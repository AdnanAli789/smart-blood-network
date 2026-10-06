import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertCircle, BarChart3, CheckCircle2, ChevronRight, Clock3, Droplets, HeartPulse, LayoutDashboard, Menu, Plus, Search, ShieldCheck, Users, X } from 'lucide-react';
import './index.css';

const today = new Date();
const currentDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
});
const currentHour = today.getHours();
const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

const api = async (url, opt) => {
    const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opt });
    const data = await r.json();
    if (!r.ok) throw Error(data.error || 'Request failed');
    return data
};

const blood = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

function App() {
    const [page, setPage] = useState('dashboard'),
        [dash, setDash] = useState(null),
        [donors, setDonors] = useState([]),
        [requests, setRequests] = useState([]),
        [selected, setSelected] = useState(null),
        [toast, setToast] = useState(''),
        [mobile, setMobile] = useState(false);

    const refresh = () => Promise.all([
        api('/api/dashboard').then(setDash),
        api('/api/donors').then(setDonors),
        api('/api/requests').then(setRequests)
    ]).catch(e => setToast(e.message));

    useEffect(() => { refresh() }, []);

    const notify = m => {
        setToast(m);
        setTimeout(() => setToast(''), 3500)
    };

    if (!dash)
        return <div className="min-h-screen grid place-items-center text-brand">
            <Droplets className="animate-pulse" size={42} />
        </div>;

    const nav = [
        ['dashboard', 'Dashboard', LayoutDashboard],
        ['donors', 'Donors', Users],
        ['requests', 'Blood requests', Droplets],
        ['analytics', 'Analytics', BarChart3]
    ];

    return <div className="min-h-screen flex">
        <aside className={`fixed z-20 inset-y-0 left-0 w-64 bg-ink text-white p-6 flex flex-col transition-transform md:translate-x-0 ${mobile ? 'translate-x-0' : '-translate-x-full'}`}>

            <div className="flex items-center gap-3 mb-12">
                <div className="bg-brand rounded-xl p-2">
                    <HeartPulse size={22} />
                </div>

                <div>
                    <b className="font-extrabold">
                        Blood<span className="text-red-300">Link</span>
                    </b>
                    <div className="text-[10px] text-slate-400 tracking-widest uppercase">
                        Community network
                    </div>
                </div>

                <button className="ml-auto md:hidden" onClick={() => setMobile(false)}>
                    <X size={20} />
                </button>
            </div>

            <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-3">
                Workspace
            </div>

            {nav.map(([id, label, Icon]) =>
                <button
                    key={id}
                    onClick={() => { setPage(id); setMobile(false) }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm text-left ${page === id
                            ? 'bg-white/15 text-white'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <Icon size={18} />
                    {label}
                </button>
            )}

            <div className="mt-auto bg-white/10 rounded-2xl p-4">
                <ShieldCheck size={20} className="text-red-300 mb-2" />
                <b className="text-sm">Keep the circle strong</b>
                <p className="text-xs text-slate-400 mt-1">
                    Every verified donor can save up to three lives.
                </p>
            </div>
        </aside>

        <main className="md:ml-64 flex-1 min-w-0">

            <header className="h-20 px-5 md:px-10 flex items-center justify-between bg-white/80 border-b border-stone-200 sticky top-0 z-10">

                <button className="md:hidden" onClick={() => setMobile(true)}>
                    <Menu />
                </button>

                <div className="hidden sm:block text-sm text-stone-500">
                    {currentDate}
                    <span className="mx-2">·</span>
                    {greeting}, coordinator
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 text-brand grid place-items-center font-bold">
                        AA
                    </div>

                    <div className="hidden sm:block text-sm">
                        <b>Adnan Ali</b>
                        <div className="text-xs text-stone-500">
                            Network coordinator
                        </div>
                    </div>
                </div>

            </header>

            <div className="p-5 md:p-10 max-w-[1500px] mx-auto">

                {page === 'dashboard' &&
                    <Dashboard
                        dash={dash}
                        requests={requests}
                        onPage={setPage}
                        onSelect={setSelected}
                    />
                }

                {page === 'donors' &&
                    <Donors
                        donors={donors}
                        refresh={refresh}
                        notify={notify}
                    />
                }

                {page === 'requests' &&
                    <Requests
                        requests={requests}
                        refresh={refresh}
                        notify={notify}
                        selected={selected}
                        setSelected={setSelected}
                    />
                }

                {page === 'analytics' && <Analytics />}

            </div>
        </main>

        {toast &&
            <div className="fixed bottom-5 right-5 bg-ink text-white px-4 py-3 rounded-xl shadow-xl text-sm">
                {toast}
            </div>
        }

    </div>
}

function Dashboard({ dash, requests, onPage, onSelect }) {
    return <>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">

            <div>
                <div className="text-brand text-sm font-bold mb-2">
                    NETWORK OVERVIEW
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold">
                    {greeting}, Adnan
                </h1>

                <p className="text-stone-500 mt-2">
                    Here’s what’s happening across your donor network.
                </p>
            </div>

            <button
                className="btn btn-primary flex items-center gap-2 self-start"
                onClick={() => onPage('requests')}
            >
                <Plus size={17} />
                New blood request
            </button>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {[
                ['Active donors', dash.available, Users, '#edf7f1'],
                ['Open requests', dash.open, Droplets, '#fff0f0'],
                ['Urgent cases', dash.urgent.length, AlertCircle, '#fff7e8'],
                ['Fulfilled cases', dash.fulfilled, CheckCircle2, '#eef3ff']
            ].map(([label, val, I, bg]) =>
                <div className="card p-5" key={label}>

                    <div className="flex justify-between">
                        <span className="text-sm text-stone-500">
                            {label}
                        </span>

                        <span
                            style={{ background: bg }}
                            className="p-2 rounded-lg"
                        >
                            <I size={17} />
                        </span>
                    </div>

                    <div className="text-3xl font-extrabold mt-3">
                        {val}
                    </div>

                    <div className="text-xs text-emerald-600 mt-2">
                        ↗ Updated just now
                    </div>

                </div>
            )}

        </div>

        <div className="grid lg:grid-cols-5 gap-6">

            <div className="card lg:col-span-3 p-6">

                <div className="flex items-center justify-between mb-5">

                    <div>
                        <h2 className="text-lg">
                            Urgent requests
                        </h2>

                        <p className="text-sm text-stone-500">
                            Cases that need attention today
                        </p>
                    </div>

                    <button
                        className="text-brand text-sm font-bold"
                        onClick={() => onPage('requests')}
                    >
                        View all
                        <ChevronRight size={15} className="inline" />
                    </button>

                </div>

                {dash.urgent.length ?
                    <div className="space-y-3">

                        {dash.urgent.map(r =>
                            <button
                                className="w-full text-left border border-stone-200 rounded-xl p-4 hover:border-brand transition"
                                onClick={() => onSelect(r.id)}
                                key={r.id}
                            >

                                <div className="flex gap-3 items-center">

                                    <span className="w-10 h-10 rounded-lg bg-red-50 text-brand grid place-items-center font-bold">
                                        {r.blood_type}
                                    </span>

                                    <div className="flex-1">
                                        <b>{r.patient_name}</b>

                                        <div className="text-xs text-stone-500 mt-1">
                                            {r.hospital} · {r.units} unit{r.units > 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    <span className="badge bg-red-100 text-brand">
                                        {r.urgency}
                                    </span>

                                </div>

                            </button>
                        )}

                    </div>
                    :
                    <p className="text-sm text-stone-500 py-5">
                        No urgent cases right now.
                    </p>
                }

            </div>

            <div className="card lg:col-span-2 p-6">

                <h2 className="text-lg">
                    Network snapshot
                </h2>

                <p className="text-sm text-stone-500 mb-5">
                    Donor availability by type
                </p>

                {blood.slice(0, 6).map((b, i) =>
                    <div className="mb-4" key={b}>

                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold">{b}</span>

                            <span className="text-stone-500">
                                {[24, 18, 12, 9, 7, 5][i]} donors
                            </span>
                        </div>

                        <div className="h-2 bg-stone-100 rounded-full">
                            <div
                                className="h-full bg-brand rounded-full"
                                style={{ width: `${[90, 72, 55, 42, 33, 24][i]}%` }}
                            />
                        </div>

                    </div>
                )}

            </div>

        </div>

        <div className="card mt-6 p-6">

            <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-brand" />
                <h2 className="text-lg">Recent activity</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-3">

                {requests.slice(0, 3).map(r =>
                    <div
                        className="border-l-2 border-brand pl-3"
                        key={r.id}
                    >

                        <div className="text-xs text-stone-500">
                            {new Date(r.created_at).toLocaleDateString()}
                        </div>

                        <div className="text-sm mt-1">
                            <b>{r.patient_name}</b> request created for {r.blood_type}
                        </div>

                    </div>
                )}

            </div>

        </div>
    </>
}

function Donors({ donors, refresh, notify }) {
    const [search, setSearch] = useState(''),
        [show, setShow] = useState(false);

    const filtered = donors.filter(d =>
        (d.name + d.city + d.blood_type)
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const toggle = async d => {
        await api(`/api/donors/${d.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ available: !d.available })
        });

        notify('Donor availability updated');
        refresh()
    };

    const verify = async d => {
        await api(`/api/donors/${d.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ verified: true })
        });

        notify('Donor verified');
        refresh()
    };

    return <>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-7">

            <div>
                <div className="text-brand text-sm font-bold mb-2">
                    DONOR DIRECTORY
                </div>

                <h1 className="text-3xl font-extrabold">
                    Our donors
                </h1>

                <p className="text-stone-500 mt-2">
                    {donors.length} registered people in your network
                </p>
            </div>

            <button
                className="btn btn-primary flex gap-2 items-center self-start"
                onClick={() => setShow(true)}
            >
                <Plus size={17} />
                Register donor
            </button>

        </div>

        <div className="card p-4 mb-5">

            <div className="relative max-w-md">

                <Search
                    size={17}
                    className="absolute left-3 top-3 text-stone-400"
                />

                <input
                    className="input pl-10"
                    placeholder="Search name, city or blood type..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

            </div>

        </div>

        <div className="card overflow-hidden">

            <div className="overflow-x-auto">

                <table className="w-full text-sm">

                    <thead className="bg-stone-50 text-stone-500 text-xs uppercase">

                        <tr>
                            <th className="text-left p-4">Donor</th>
                            <th className="text-left p-4">Blood type</th>
                            <th className="text-left p-4">Location</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Verification</th>
                        </tr>

                    </thead>

                    <tbody>

                        {filtered.map(d =>
                            <tr
                                className="border-t border-stone-100"
                                key={d.id}
                            >

                                <td className="p-4">
                                    <b>{d.name}</b>
                                    <div className="text-xs text-stone-500">
                                        {d.phone}
                                    </div>
                                </td>

                                <td className="p-4">
                                    <span className="badge bg-red-50 text-brand">
                                        {d.blood_type}
                                    </span>
                                </td>

                                <td className="p-4">
                                    {d.city}
                                    <div className="text-xs text-stone-500">
                                        {d.distance} mi away
                                    </div>
                                </td>

                                <td className="p-4">

                                    <button
                                        onClick={() => toggle(d)}
                                        className={`badge ${d.available
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-stone-100 text-stone-500'
                                            }`}
                                    >
                                        {d.available ? 'Available' : 'Unavailable'}
                                    </button>

                                </td>

                                <td className="p-4">

                                    {d.verified ?
                                        <span className="text-emerald-600 flex gap-1 items-center">
                                            <ShieldCheck size={15} />
                                            Verified
                                        </span>
                                        :
                                        <button
                                            onClick={() => verify(d)}
                                            className="text-amber-600 underline"
                                        >
                                            Verify now
                                        </button>
                                    }

                                </td>

                            </tr>
                        )}

                    </tbody>

                </table>

            </div>

        </div>

        {show &&
            <DonorForm
                close={() => setShow(false)}
                refresh={refresh}
                notify={notify}
            />
        }

    </>
}

function DonorForm({ close, refresh, notify }) {

    const [f, setF] = useState({
        name: '',
        bloodType: 'O+',
        phone: '',
        email: '',
        city: 'Austin',
        distance: 0
    });

    const submit = async e => {
        e.preventDefault();

        try {

            await api('/api/donors', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            notify('Donor registered successfully');
            refresh();
            close()

        } catch (x) {
            notify(x.message)
        }
    };

    return <Modal title="Register a donor" close={close}>

        <form onSubmit={submit} className="space-y-4">

            {[['name', 'Full name'], ['phone', 'Phone'], ['email', 'Email']]
                .map(([k, l]) =>
                    <input
                        required={k !== 'email'}
                        className="input"
                        placeholder={l}
                        value={f[k]}
                        onChange={e => setF({ ...f, [k]: e.target.value })}
                        key={k}
                    />
                )
            }

            <div className="grid grid-cols-2 gap-3">

                <select
                    className="input"
                    value={f.bloodType}
                    onChange={e => setF({ ...f, bloodType: e.target.value })}
                >
                    {blood.map(b =>
                        <option key={b}>{b}</option>
                    )}
                </select>

                <input
                    className="input"
                    placeholder="City"
                    value={f.city}
                    onChange={e => setF({ ...f, city: e.target.value })}
                />

            </div>

            <button className="btn btn-primary w-full">
                Add donor
            </button>

        </form>

    </Modal>
}

function Requests({ requests, refresh, notify, selected, setSelected }) {

    const [show, setShow] = useState(false);

    return <>

        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-7">

            <div>

                <div className="text-brand text-sm font-bold mb-2">
                    CASE MANAGEMENT
                </div>

                <h1 className="text-3xl font-extrabold">
                    Blood requests
                </h1>

                <p className="text-stone-500 mt-2">
                    Coordinate every request from intake to completion.
                </p>

            </div>

            <button
                className="btn btn-primary flex gap-2 items-center self-start"
                onClick={() => setShow(true)}
            >
                <Plus size={17} />
                Create request
            </button>

        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-5">

            {[
                ['Open', requests.filter(r => r.status === 'Open').length, 'bg-red-50'],
                ['Critical', requests.filter(r => r.urgency === 'Critical').length, 'bg-amber-50'],
                ['Completed', requests.filter(r => r.status === 'Completed').length, 'bg-emerald-50']
            ].map(x =>
                <div className="card p-4" key={x[0]}>

                    <div className="text-sm text-stone-500">
                        {x[0]} requests
                    </div>

                    <div className="text-2xl font-extrabold mt-2">
                        {x[1]}
                    </div>

                </div>
            )}

        </div>

        <div className="space-y-3">

            {requests.map(r =>
                <button
                    onClick={() => setSelected(r.id)}
                    className="card w-full text-left p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-brand transition"
                    key={r.id}
                >

                    <span className="w-12 h-12 rounded-xl bg-red-50 text-brand grid place-items-center font-bold">
                        {r.blood_type}
                    </span>

                    <div className="flex-1">

                        <div className="flex gap-2 items-center">

                            <b>{r.patient_name}</b>

                            <span
                                className={`badge ${r.urgency === 'Critical'
                                        ? 'bg-red-100 text-brand'
                                        : r.urgency === 'Urgent'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-stone-100 text-stone-600'
                                    }`}
                            >
                                {r.urgency}
                            </span>

                        </div>

                        <div className="text-sm text-stone-500 mt-1">
                            {r.hospital} · {r.city} · {r.units} unit{r.units > 1 ? 's' : ''}
                        </div>

                    </div>

                    <div className="text-right">

                        <div
                            className={`text-sm font-bold ${r.status === 'Completed'
                                    ? 'text-emerald-600'
                                    : 'text-brand'
                                }`}
                        >
                            {r.status}
                        </div>

                        <div className="text-xs text-stone-400">
                            {new Date(r.created_at).toLocaleDateString()}
                        </div>

                    </div>

                    <ChevronRight size={18} className="text-stone-400" />

                </button>
            )}

        </div>

        {show &&
            <RequestForm
                close={() => setShow(false)}
                refresh={refresh}
                notify={notify}
            />
        }

        {selected &&
            <RequestDetail
                id={selected}
                close={() => setSelected(null)}
                refresh={refresh}
                notify={notify}
            />
        }

    </>
}

function RequestForm({ close, refresh, notify }) {

    const [f, setF] = useState({
        patientName: '',
        bloodType: 'O+',
        units: 1,
        hospital: '',
        city: 'Austin',
        urgency: 'Routine',
        contact: '',
        notes: ''
    });

    const submit = async e => {
        e.preventDefault();

        try {

            await api('/api/requests', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            notify('Request created');
            refresh();
            close()

        } catch (x) {
            notify(x.message)
        }
    };

    return <Modal title="Create blood request" close={close}>

        <form onSubmit={submit} className="space-y-3">

            {[['patientName', 'Patient name'], ['hospital', 'Hospital'], ['contact', 'Contact phone']]
                .map(([k, l]) =>
                    <input
                        required
                        className="input"
                        placeholder={l}
                        value={f[k]}
                        onChange={e => setF({ ...f, [k]: e.target.value })}
                        key={k}
                    />
                )
            }

            <div className="grid grid-cols-2 gap-3">

                <select
                    className="input"
                    value={f.bloodType}
                    onChange={e => setF({ ...f, bloodType: e.target.value })}
                >
                    {blood.map(b =>
                        <option key={b}>{b}</option>
                    )}
                </select>

                <input
                    required
                    type="number"
                    min="1"
                    className="input"
                    value={f.units}
                    onChange={e => setF({ ...f, units: e.target.value })}
                />

            </div>

            <select
                className="input"
                value={f.urgency}
                onChange={e => setF({ ...f, urgency: e.target.value })}
            >
                <option>Routine</option>
                <option>Urgent</option>
                <option>Critical</option>
            </select>

            <textarea
                className="input"
                rows="3"
                placeholder="Notes (optional)"
                value={f.notes}
                onChange={e => setF({ ...f, notes: e.target.value })}
            />

            <button className="btn btn-primary w-full">
                Create request
            </button>

        </form>

    </Modal>
}

function RequestDetail({ id, close, refresh, notify }) {

    const [data, setData] = useState(null),
        [matches, setMatches] = useState([]);

    useEffect(() => {
        Promise.all([
            api(`/api/requests/${id}`).then(setData),
            api(`/api/requests/${id}/matches`).then(setMatches)
        ])
    }, [id]);

    if (!data)
        return <Modal title="Loading request" close={close}>
            <div className="p-8 text-center">
                <Clock3 className="mx-auto animate-pulse" />
            </div>
        </Modal>;

    const invite = async donorId => {
        await api(`/api/requests/${id}/responses`, {
            method: 'POST',
            body: JSON.stringify({ donorId })
        });

        notify('Invitation sent');
        setMatches(matches.filter(x => x.id !== donorId));

        const fresh = await api(`/api/requests/${id}`);
        setData(fresh)
    };

    const respond = async (responseId, status) => {
        await api(`/api/responses/${responseId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });

        setData({
            ...data,
            responses: data.responses.map(
                x => x.id === responseId ? { ...x, status } : x
            )
        });

        notify(`Response ${status.toLowerCase()}`)
    };

    const complete = async () => {
        await api(`/api/requests/${id}/complete`, {
            method: 'POST'
        });

        notify('Request marked completed');
        refresh();
        close()
    };

    return <Modal
        title={`${data.patient_name} · ${data.blood_type}`}
        close={close}
    >

        <div className="space-y-4">

            <div className="grid grid-cols-2 gap-3 text-sm">

                <div className="bg-stone-50 p-3 rounded-lg">
                    <span className="text-stone-500 block">
                        Hospital
                    </span>
                    <b>{data.hospital}</b>
                </div>

                <div className="bg-stone-50 p-3 rounded-lg">
                    <span className="text-stone-500 block">
                        Contact
                    </span>
                    <b>{data.contact}</b>
                </div>

            </div>

            {data.responses?.length > 0 &&
                <div>

                    <h3 className="font-bold mb-2">
                        Donor responses
                    </h3>

                    {data.responses.map(x =>
                        <div
                            className="border rounded-lg p-3 flex items-center gap-2 mb-2 text-sm"
                            key={x.id}
                        >

                            <div className="flex-1">

                                <b>{x.donor_name}</b>

                                <div className="text-xs text-stone-500">
                                    {x.blood_type} · {x.phone}
                                </div>

                            </div>

                            {x.status === 'Pending' ?
                                <>
                                    <button
                                        className="btn bg-emerald-100 text-emerald-700 text-xs"
                                        onClick={() => respond(x.id, 'Accepted')}
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className="btn bg-red-50 text-brand text-xs"
                                        onClick={() => respond(x.id, 'Declined')}
                                    >
                                        Decline
                                    </button>
                                </>
                                :
                                <span
                                    className={`badge ${x.status === 'Accepted'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-stone-100 text-stone-500'
                                        }`}
                                >
                                    {x.status}
                                </span>
                            }

                        </div>
                    )}

                </div>
            }

            <div>

                <h3 className="font-bold mb-2">
                    Compatible verified donors
                    <span className="text-stone-400 font-normal">
                        ({matches.length})
                    </span>
                </h3>

                {matches.slice(0, 4).map(d =>
                    <div
                        className="border rounded-lg p-3 flex items-center gap-3 mb-2"
                        key={d.id}
                    >

                        <div className="w-8 h-8 rounded bg-red-50 text-brand grid place-items-center text-xs font-bold">
                            {d.blood_type}
                        </div>

                        <div className="flex-1 text-sm">

                            <b>{d.name}</b>

                            <div className="text-xs text-stone-500">
                                {d.distance} mi · {d.city}
                            </div>

                        </div>

                        <button
                            className="btn btn-muted text-xs"
                            onClick={() => invite(d.id)}
                        >
                            Invite
                        </button>

                    </div>
                )}

            </div>

            {data.status === 'Open' &&
                <button
                    className="btn btn-primary w-full"
                    onClick={complete}
                >
                    Mark request completed
                </button>
            }

        </div>

    </Modal>
}

function Analytics() {

    const [a, setA] = useState(null);

    useEffect(() => {
        api('/api/analytics').then(setA)
    }, []);

    if (!a)
        return <div>Loading analytics…</div>;

    return <>

        <div className="mb-8">

            <div className="text-brand text-sm font-bold mb-2">
                NETWORK INSIGHTS
            </div>

            <h1 className="text-3xl font-extrabold">
                Analytics
            </h1>

            <p className="text-stone-500 mt-2">
                A quick read on your network health.
            </p>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

            {[
                ['Donor blood types', a.byBlood],
                ['Request status', a.byStatus],
                ['Request urgency', a.byUrgency]
            ].map(([title, items]) =>

                <div className="card p-6" key={title}>

                    <h2 className="font-bold mb-5">
                        {title}
                    </h2>

                    {items.map((x, i) =>

                        <div className="mb-4" key={x.label}>

                            <div className="flex justify-between text-sm mb-1">
                                <span>{x.label}</span>
                                <b>{x.value}</b>
                            </div>

                            <div className="h-2 bg-stone-100 rounded-full">

                                <div
                                    className={`h-full rounded-full ${i === 0
                                            ? 'bg-brand'
                                            : i === 1
                                                ? 'bg-blue-500'
                                                : 'bg-amber-500'
                                        }`}
                                    style={{
                                        width: `${Math.min(100, x.value * 18 + 12)}%`
                                    }}
                                />

                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>

    </>
}

function Modal({ title, close, children }) {

    return <div className="fixed inset-0 z-30 bg-ink/40 grid place-items-center p-4">

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">

            <div className="flex items-center justify-between p-5 border-b">

                <h2 className="text-xl font-bold">
                    {title}
                </h2>

                <button onClick={close}>
                    <X size={20} />
                </button>

            </div>

            <div className="p-5">
                {children}
            </div>

        </div>

    </div>
}

createRoot(document.getElementById('root')).render(<App />);