import { useEffect, useMemo, useState } from "react";
import {
  EnvelopeSimple,
  LockKey,
  SignOut,
  Users,
  ArrowsClockwise,
  Gift,
  CalendarCheck,
  Trophy,
  MagnifyingGlass,
  DownloadSimple,
  CaretLeft,
  CaretRight,
  UsersThree,
  Ticket,
} from "@phosphor-icons/react";
import { api } from "../api/client.js";
import { adminSession } from "../api/session.js";
import OffersManager from "../components/OffersManager.jsx";

const logo = "/foxtech-logo-full.jpg";

const DEPARTMENTS = [
  "Computer Science / IT",
  "AI & Data Science",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
  "Management",
  "Commerce",
  "Other",
];

const PAGE_SIZE = 10;

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-fox-violet/10 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fox-gradient-soft">
          <Icon size={16} weight="bold" className="text-fox-violet" />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-fox-ink/50">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-fox-ink">{value}</p>
    </div>
  );
}

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.adminLogin({ email, password });
      if (res?.success) {
        adminSession.save(res.token);
        onSuccess(res.token);
      } else {
        setError(res?.message || "Invalid email or password.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fox-mist px-6">
      <div className="w-full max-w-sm rounded-3xl border border-fox-violet/10 bg-white p-8 shadow-glow">
        <div className="mb-6 flex flex-col items-center gap-2">
          <img src={logo} alt="FOXTECH" className="h-8 w-auto" />
          <span className="text-sm font-semibold text-fox-ink/50">Admin</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">Email</label>
            <div className="relative">
              <EnvelopeSimple size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fox-violet/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-fox-violet/15 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-fox-violet/40"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">Password</label>
            <div className="relative">
              <LockKey size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fox-violet/50" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-fox-violet/15 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-fox-violet/40"
              />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-fox-gradient py-3 text-sm font-bold text-white shadow-glow-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [offerFilter, setOfferFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("participants");

  const offerOptions = useMemo(
    () => (stats?.offerBreakdown || []).map((o) => o.name),
    [stats]
  );

  useEffect(() => {
    api.adminStats(token).then((res) => {
      if (res?.success) setStats(res.stats);
    });
  }, [token]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const handle = setTimeout(() => {
      api
        .adminParticipants(token, { page, pageSize: PAGE_SIZE, search, department, offer: offerFilter })
        .then((res) => {
          if (res?.success) {
            setParticipants(res.participants);
            setTotal(res.total);
          } else {
            setError(res?.message || "Session expired. Please sign in again.");
            if (res?.message?.toLowerCase().includes("session")) onLogout();
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [token, page, search, department, offerFilter, onLogout]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function exportCsv() {
    const header = ["Name", "Phone", "Department", "Year", "College", "Status", "Offer", "Date"];
    const rows = participants.map((p) => [
      p.name,
      p.phone,
      p.department,
      p.year || "",
      p.collegeName || "",
      p.status,
      p.offer ? (p.offer.offerType === "custom" ? p.offer.name : `${p.offer.discountPercentage}% - ${p.offer.name}`) : "",
      p.createdAt,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foxtech-participants-page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-fox-mist pb-16">
      <header className="border-b border-fox-violet/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="FOXTECH" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-fox-ink/40">Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-fox-violet/20 px-4 py-2 text-sm font-semibold text-fox-violet transition hover:bg-fox-violet/5"
          >
            <SignOut size={16} weight="bold" />
            Log Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total Participants" value={stats?.totalParticipants ?? "—"} icon={Users} />
          <StatCard label="Total Spins" value={stats?.totalSpins ?? "—"} icon={ArrowsClockwise} />
          <StatCard label="Offers Distributed" value={stats?.offersDistributed ?? "—"} icon={Gift} />
          <StatCard label="Today's Participants" value={stats?.todaysParticipants ?? "—"} icon={CalendarCheck} />
          <StatCard label="Most Common Offer" value={stats?.mostCommonOffer ?? "—"} icon={Trophy} />
        </div>

        <div className="mt-8 flex gap-2">
          <button
            onClick={() => setTab("participants")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "participants" ? "bg-fox-gradient text-white" : "bg-white text-fox-ink/60 hover:bg-fox-violet/5"
            }`}
          >
            <UsersThree size={16} weight="bold" />
            Participants
          </button>
          <button
            onClick={() => setTab("offers")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "offers" ? "bg-fox-gradient text-white" : "bg-white text-fox-ink/60 hover:bg-fox-violet/5"
            }`}
          >
            <Ticket size={16} weight="bold" />
            Wheel Offers
          </button>
        </div>

        {tab === "offers" && (
          <div className="mt-4">
            <OffersManager token={token} />
          </div>
        )}

        {tab === "participants" && (
        <div className="mt-4 rounded-2xl border border-fox-violet/10 bg-white p-5 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-fox-ink">Participants</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <MagnifyingGlass size={16} weight="bold" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fox-violet/40" />
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  className="rounded-lg border border-fox-violet/15 py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
                />
              </div>
              <select
                value={department}
                onChange={(e) => {
                  setPage(1);
                  setDepartment(e.target.value);
                }}
                className="rounded-lg border border-fox-violet/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
              >
                <option value="">All departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={offerFilter}
                onChange={(e) => {
                  setPage(1);
                  setOfferFilter(e.target.value);
                }}
                className="rounded-lg border border-fox-violet/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
              >
                <option value="">All offers</option>
                {offerOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                onClick={exportCsv}
                disabled={!participants.length}
                className="flex items-center gap-1.5 rounded-lg bg-fox-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                <DownloadSimple size={16} weight="bold" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-fox-violet/10 text-xs uppercase tracking-wide text-fox-ink/50">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Year</th>
                  <th className="py-2 pr-4">College</th>
                  <th className="py-2 pr-4">Offer</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-fox-ink/40">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-fox-ink/40">
                      No participants found.
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.id} className="border-b border-fox-violet/5">
                      <td className="py-3 pr-4 font-medium text-fox-ink">{p.name}</td>
                      <td className="py-3 pr-4 text-fox-ink/70">{p.phone}</td>
                      <td className="py-3 pr-4 text-fox-ink/70">{p.department}</td>
                      <td className="py-3 pr-4 text-fox-ink/70">{p.year || "—"}</td>
                      <td className="py-3 pr-4 text-fox-ink/70">{p.collegeName || "—"}</td>
                      <td className="py-3 pr-4 text-fox-ink/70">
                        {p.offer
                          ? p.offer.offerType === "custom"
                            ? p.offer.name
                            : `${p.offer.discountPercentage}% — ${p.offer.name}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.status === "Spun"
                              ? "bg-fox-gradient-soft text-fox-violet"
                              : "bg-fox-ink/5 text-fox-ink/50"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-fox-ink/60">{p.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-fox-ink/60">
            <span>
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-fox-violet/15 px-3 py-1.5 disabled:opacity-40"
              >
                <CaretLeft size={14} weight="bold" />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-fox-violet/15 px-3 py-1.5 disabled:opacity-40"
              >
                Next
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const existing = adminSession.load();
    if (existing) setToken(existing);
    setChecked(true);
  }, []);

  function handleLogout() {
    adminSession.clear();
    setToken(null);
  }

  if (!checked) return null;

  return token ? (
    <Dashboard token={token} onLogout={handleLogout} />
  ) : (
    <LoginForm onSuccess={(t) => setToken(t)} />
  );
}
