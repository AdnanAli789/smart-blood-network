import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'blood-network.db'));
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS donors (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 blood_type TEXT NOT NULL,
 phone TEXT NOT NULL,
 email TEXT,
 city TEXT NOT NULL,
 distance REAL DEFAULT 0,
 available INTEGER DEFAULT 1,
 verified INTEGER DEFAULT 0,
 last_donation TEXT,
 joined_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_name TEXT NOT NULL,
 blood_type TEXT NOT NULL,
 units INTEGER NOT NULL,
 hospital TEXT NOT NULL,
 city TEXT NOT NULL,
 urgency TEXT DEFAULT 'Routine',
 contact TEXT NOT NULL,
 notes TEXT,
 status TEXT DEFAULT 'Open',
 verified INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 completed_at TEXT
);

CREATE TABLE IF NOT EXISTS responses (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 request_id INTEGER NOT NULL,
 donor_id INTEGER NOT NULL,
 status TEXT DEFAULT 'Pending',
 message TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(request_id, donor_id),
 FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE,
 FOREIGN KEY(donor_id) REFERENCES donors(id) ON DELETE CASCADE
);
`);

const seed = db.prepare('SELECT COUNT(*) count FROM donors').get().count === 0;

if (seed) {
    const addDonor = db.prepare(
        'INSERT INTO donors (name,blood_type,phone,email,city,distance,available,verified,last_donation) VALUES (?,?,?,?,?,?,?,?,?)'
    );

    [
        ['Aarav Mehta', 'O+', '555-0142', 'aarav@example.com', 'Austin', 2.4, 1, 1, '2025-08-12'],
        ['Maya Singh', 'B+', '555-0177', 'maya@example.com', 'Austin', 6.8, 1, 1, '2025-10-04'],
        ['Jordan Lee', 'O-', '555-0109', 'jordan@example.com', 'Round Rock', 18.2, 1, 0, '2025-06-20'],
        ['Sofia Garcia', 'AB+', '555-0193', 'sofia@example.com', 'Pflugerville', 11.5, 0, 1, '2025-09-15'],
        ['Noah Williams', 'A-', '555-0131', 'noah@example.com', 'Austin', 4.1, 1, 1, '2025-07-01'],
        ['Priya Shah', 'O+', '555-0188', 'priya@example.com', 'Cedar Park', 21.7, 1, 1, '2025-11-19']
    ].forEach(d => addDonor.run(...d));

    const addRequest = db.prepare(
        'INSERT INTO requests (patient_name,blood_type,units,hospital,city,urgency,contact,notes,status,verified) VALUES (?,?,?,?,?,?,?,?,?,?)'
    );

    addRequest.run(
        'Elena Rodriguez',
        'O-',
        2,
        'St. David Medical Center',
        'Austin',
        'Critical',
        '555-0112',
        'Surgery scheduled today',
        'Open',
        1
    );

    addRequest.run(
        'Marcus Thompson',
        'A+',
        1,
        'Ascension Seton',
        'Austin',
        'Urgent',
        '555-0164',
        'Please call the family before arrival',
        'Open',
        1
    );

    addRequest.run(
        'Liam Chen',
        'B+',
        3,
        'Dell Children’s',
        'Round Rock',
        'Routine',
        '555-0120',
        'Platelet support needed',
        'Open',
        0
    );
}

const app = express();

app.use(cors());
app.use(express.json());

const bool = v => Number(Boolean(v));

const compatible = (donor, recipient) => {
    const map = {
        'O-': ['O-'],
        'O+': ['O-', 'O+'],
        'A-': ['O-', 'A-'],
        'A+': ['O-', 'O+', 'A-', 'A+'],
        'B-': ['O-', 'B-'],
        'B+': ['O-', 'O+', 'B-', 'B+'],
        'AB-': ['O-', 'A-', 'B-', 'AB-'],
        'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    };

    return (map[recipient] || []).includes(donor);
};

const donorView = d => ({
    ...d,
    available: !!d.available,
    verified: !!d.verified
});

const requestView = r => ({
    ...r,
    verified: !!r.verified
});


/* =========================
   DONORS
========================= */

app.get('/api/donors', (req, res) => {
    let sql = 'SELECT * FROM donors WHERE 1=1';
    let args = [];

    if (req.query.search) {
        sql += ' AND (name LIKE ? OR city LIKE ? OR blood_type LIKE ?)';
        const s = `%${req.query.search}%`;
        args.push(s, s, s);
    }

    if (req.query.available === 'true') {
        sql += ' AND available=1';
    }

    if (req.query.bloodType) {
        sql += ' AND blood_type=?';
        args.push(req.query.bloodType);
    }

    res.json(
        db
            .prepare(sql + ' ORDER BY verified DESC, available DESC, distance ASC')
            .all(...args)
            .map(donorView)
    );
});


app.post('/api/donors', (req, res) => {
    const {
        name,
        bloodType,
        phone,
        email = '',
        city,
        distance = 0,
        available = true,
        lastDonation = ''
    } = req.body;

    if (!name || !bloodType || !phone || !city) {
        return res.status(400).json({
            error: 'Name, blood type, phone, and city are required.'
        });
    }

    const r = db.prepare(
        'INSERT INTO donors (name,blood_type,phone,email,city,distance,available,last_donation) VALUES (?,?,?,?,?,?,?,?)'
    ).run(
        name,
        bloodType,
        phone,
        email,
        city,
        distance,
        bool(available),
        lastDonation
    );

    res.status(201).json(
        donorView(
            db.prepare('SELECT * FROM donors WHERE id=?')
                .get(r.lastInsertRowid)
        )
    );
});


app.patch('/api/donors/:id', (req, res) => {
    const d = db
        .prepare('SELECT * FROM donors WHERE id=?')
        .get(req.params.id);

    if (!d) return res.sendStatus(404);

    const available =
        req.body.available === undefined
            ? d.available
            : bool(req.body.available);

    const verified =
        req.body.verified === undefined
            ? d.verified
            : bool(req.body.verified);

    db.prepare(
        'UPDATE donors SET available=?,verified=? WHERE id=?'
    ).run(available, verified, d.id);

    res.json(
        donorView(
            db.prepare('SELECT * FROM donors WHERE id=?').get(d.id)
        )
    );
});


/* =========================
   REQUESTS
========================= */

app.get('/api/requests', (req, res) => {
    res.json(
        db.prepare(
            "SELECT * FROM requests ORDER BY CASE urgency WHEN 'Critical' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, created_at DESC"
        )
        .all()
        .map(requestView)
    );
});


app.post('/api/requests', (req, res) => {
    const {
        patientName,
        bloodType,
        units = 1,
        hospital,
        city,
        urgency = 'Routine',
        contact,
        notes = ''
    } = req.body;

    if (!patientName || !bloodType || !hospital || !city || !contact) {
        return res.status(400).json({
            error: 'Please complete all required fields.'
        });
    }

    const r = db.prepare(
        'INSERT INTO requests (patient_name,blood_type,units,hospital,city,urgency,contact,notes) VALUES (?,?,?,?,?,?,?,?)'
    ).run(
        patientName,
        bloodType,
        units,
        hospital,
        city,
        urgency,
        contact,
        notes
    );

    res.status(201).json(
        requestView(
            db.prepare('SELECT * FROM requests WHERE id=?')
                .get(r.lastInsertRowid)
        )
    );
});


app.patch('/api/requests/:id', (req, res) => {
    const r = db
        .prepare('SELECT * FROM requests WHERE id=?')
        .get(req.params.id);

    if (!r) return res.sendStatus(404);

    const verified =
        req.body.verified === undefined
            ? r.verified
            : bool(req.body.verified);

    db.prepare(
        'UPDATE requests SET verified=? WHERE id=?'
    ).run(verified, r.id);

    res.json(
        requestView(
            db.prepare('SELECT * FROM requests WHERE id=?').get(r.id)
        )
    );
});


/* =========================
   MATCHING
========================= */

app.get('/api/requests/:id/matches', (req, res) => {
    const r = db
        .prepare('SELECT * FROM requests WHERE id=?')
        .get(req.params.id);

    if (!r) return res.sendStatus(404);

    const donors = db
        .prepare(
            'SELECT * FROM donors WHERE available=1 AND verified=1'
        )
        .all()
        .filter(d => compatible(d.blood_type, r.blood_type))
        .sort((a, b) => a.distance - b.distance);

    res.json(
        donors.map(d => ({
            ...donorView(d),
            compatibility: 'Compatible'
        }))
    );
});


/* =========================
   RESPONSES
========================= */

app.post('/api/requests/:id/responses', (req, res) => {
    try {
        const r = db.prepare(
            'INSERT INTO responses (request_id,donor_id,message) VALUES (?,?,?)'
        ).run(
            req.params.id,
            req.body.donorId,
            req.body.message || ''
        );

        res.status(201).json(
            db.prepare(
                'SELECT responses.*,donors.name donor_name FROM responses JOIN donors ON donors.id=responses.donor_id WHERE responses.id=?'
            ).get(r.lastInsertRowid)
        );

    } catch (e) {
        res.status(400).json({
            error: 'This donor has already been invited.'
        });
    }
});


app.patch('/api/responses/:id', (req, res) => {
    const response = db
        .prepare('SELECT * FROM responses WHERE id=?')
        .get(req.params.id);

    if (!response) return res.sendStatus(404);

    db.prepare(
        'UPDATE responses SET status=? WHERE id=?'
    ).run(req.body.status, response.id);

    res.json(
        db.prepare('SELECT * FROM responses WHERE id=?')
            .get(response.id)
    );
});


/* =========================
   COMPLETE REQUEST
========================= */

app.post('/api/requests/:id/complete', (req, res) => {
    db.prepare(
        "UPDATE requests SET status='Completed', completed_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(req.params.id);

    res.json(
        requestView(
            db.prepare('SELECT * FROM requests WHERE id=?')
                .get(req.params.id)
        )
    );
});


app.get('/api/requests/:id', (req, res) => {
    const r = db
        .prepare('SELECT * FROM requests WHERE id=?')
        .get(req.params.id);

    if (!r) return res.sendStatus(404);

    res.json({
        ...requestView(r),
        responses: db.prepare(
            'SELECT responses.*, donors.name donor_name, donors.blood_type, donors.phone FROM responses JOIN donors ON donors.id=responses.donor_id WHERE request_id=?'
        ).all(r.id)
    });
});


/* =========================
   DASHBOARD
========================= */

app.get('/api/dashboard', (req, res) => {
    const donors = db
        .prepare('SELECT COUNT(*) count FROM donors')
        .get().count;

    const available = db
        .prepare('SELECT COUNT(*) count FROM donors WHERE available=1')
        .get().count;

    const open = db
        .prepare("SELECT COUNT(*) count FROM requests WHERE status='Open'")
        .get().count;

    const fulfilled = db
        .prepare("SELECT COUNT(*) count FROM requests WHERE status='Completed'")
        .get().count;

    const urgent = db.prepare(
        "SELECT * FROM requests WHERE status='Open' AND urgency IN ('Urgent','Critical') ORDER BY created_at DESC LIMIT 4"
    ).all().map(requestView);

    const activity = db.prepare(
        'SELECT id,patient_name,blood_type,urgency,status,created_at FROM requests ORDER BY created_at DESC LIMIT 5'
    ).all();

    res.json({
        donors,
        available,
        open,
        fulfilled,
        urgent,
        activity
    });
});


/* =========================
   ANALYTICS
========================= */

app.get('/api/analytics', (req, res) => {
    res.json({
        byBlood: db.prepare(
            'SELECT blood_type label, COUNT(*) value FROM donors GROUP BY blood_type ORDER BY value DESC'
        ).all(),

        byStatus: db.prepare(
            'SELECT status label, COUNT(*) value FROM requests GROUP BY status'
        ).all(),

        byUrgency: db.prepare(
            'SELECT urgency label, COUNT(*) value FROM requests GROUP BY urgency'
        ).all()
    });
});


/* =========================
   START SERVER
========================= */

app.listen(
    process.env.PORT || 4000,
    () => console.log(
        'Smart Blood Network API listening on http://localhost:4000'
    )
);