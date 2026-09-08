import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Medal, Plus, Trash, Sparkle, SealCheck, Clock, QrCode } from "@phosphor-icons/react";
import { api } from "../api/client.js";

const TIERS = [
  { value: "SILVER", label: "Silver", color: "#9CA3AF" },
  { value: "GOLD", label: "Gold", color: "#D4A017" },
  { value: "PLATINUM", label: "Platinum", color: "#7C3AED" },
];

function RewardPool({ tier, token }) {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReward, setNewReward] = useState("");
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .adminGetVoucherPrizes(token)
      .then((res) => {
        if (res?.success) setPrizes(res.voucherPrizes.filter((p) => p.tier === tier));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [token, tier]);

  async function add(e) {
    e.preventDefault();
    if (!newReward.trim()) return;
    setError("");
    try {
      const res = await api.adminCreateVoucherPrize(token, { tier, rewardText: newReward.trim() });
      if (res?.success) {
        setPrizes((prev) => [...prev, res.voucherPrize]);
        setNewReward("");
      } else {
        setError(res?.message || "Could not add reward.");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(prize) {
    const res = await api.adminUpdateVoucherPrize(token, prize.id, { isActive: !prize.isActive });
    if (res?.success) setPrizes((prev) => prev.map((p) => (p.id === prize.id ? res.voucherPrize : p)));
  }

  async function remove(prize) {
    if (!confirm(`Remove "${prize.rewardText}" from the ${tier} reward pool?`)) return;
    setError("");
    try {
      const res = await api.adminDeleteVoucherPrize(token, prize.id);
      if (res?.success) {
        setPrizes((prev) => prev.filter((p) => p.id !== prize.id));
        return;
      }

      if (res?.alreadyWon) {
        const confirmForce = confirm(
          `"${prize.rewardText}" has already been won by ${res.claimsCount} voucher(s). Deleting it will unlink it from those vouchers (they keep their recorded reward text, just the reference to this reward is cleared). This can't be undone. Delete anyway?`
        );
        if (!confirmForce) return;
        const forced = await api.adminDeleteVoucherPrize(token, prize.id, { force: true });
        if (forced?.success) {
          setPrizes((prev) => prev.filter((p) => p.id !== prize.id));
        } else {
          setError(forced?.message || "Could not delete this reward.");
        }
        return;
      }

      setError(res?.message || "Could not delete this reward.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {loading ? (
        <p className="py-4 text-center text-xs text-fox-ink/40">Loading rewards...</p>
      ) : (
        <ul className="space-y-2">
          {prizes.map((prize) => (
            <li
              key={prize.id}
              className="flex items-center justify-between rounded-lg border border-fox-violet/10 px-3 py-2"
            >
              <span className={`text-sm ${prize.isActive ? "text-fox-ink" : "text-fox-ink/30 line-through"}`}>
                {prize.rewardText}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(prize)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    prize.isActive ? "bg-fox-gradient-soft text-fox-violet" : "bg-fox-ink/5 text-fox-ink/40"
                  }`}
                >
                  {prize.isActive ? "Active" : "Disabled"}
                </button>
                <button
                  onClick={() => remove(prize)}
                  aria-label={`Remove ${prize.rewardText}`}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash size={14} weight="bold" />
                </button>
              </div>
            </li>
          ))}
          {prizes.length === 0 && <p className="py-2 text-center text-xs text-fox-ink/40">No rewards configured yet.</p>}
        </ul>
      )}

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          value={newReward}
          onChange={(e) => setNewReward(e.target.value)}
          placeholder="e.g. KitKat + Pen"
          className="flex-1 rounded-lg border border-fox-violet/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg bg-fox-gradient px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
        >
          <Plus size={14} weight="bold" />
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function VoucherManager({ token }) {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState("SILVER");
  const [generating, setGenerating] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState(null);
  const [error, setError] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [filterTier, setFilterTier] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  function loadVouchers() {
    setLoadingList(true);
    api
      .adminListVouchers(token, { tier: filterTier, status: filterStatus, pageSize: 50 })
      .then((res) => {
        if (res?.success) setVouchers(res.vouchers);
      })
      .finally(() => setLoadingList(false));
  }

  useEffect(loadVouchers, [token, filterTier, filterStatus]);

  async function generate() {
    setGenerating(true);
    setError("");
    setGeneratedVoucher(null);
    try {
      const res = await api.adminGenerateVoucher(token, selectedTier);
      if (res?.success) {
        setGeneratedVoucher(res.voucher);
        loadVouchers();
      } else {
        setError(res?.message || "Could not generate voucher.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        {/* Generate */}
        <div className="rounded-2xl border border-fox-violet/10 bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-bold text-fox-ink">
            <Sparkle size={18} weight="fill" className="text-fox-violet" />
            Voucher Generation
          </h2>
          <p className="mt-1 text-sm text-fox-ink/60">
            Generate a voucher QR for a tier. The reward is chosen by the server only when the recipient
            scratches the card.
          </p>

          <div className="mt-4 flex gap-2">
            {TIERS.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedTier(t.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition ${
                  selectedTier === t.value ? "text-white" : "border-fox-violet/15 text-fox-ink/60 hover:border-fox-violet/40"
                }`}
                style={selectedTier === t.value ? { backgroundColor: t.color, borderColor: t.color } : {}}
              >
                <Medal size={16} weight="fill" />
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="mt-4 w-full rounded-xl bg-fox-gradient py-3 text-sm font-bold text-white shadow-glow-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {generating ? "Generating..." : "Generate Voucher QR"}
          </button>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

          {generatedVoucher && (
            <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-fox-gradient-soft p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-fox-violet/80">Voucher generated</p>
              <p className="font-mono text-lg font-bold text-fox-violet">{generatedVoucher.voucherCode}</p>
              <button
                onClick={() => navigate(`/admin/voucher-qr/${generatedVoucher.voucherCode}`)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-fox-gradient px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <QrCode size={16} weight="bold" />
                View QR
              </button>
            </div>
          )}
        </div>

        {/* Reward pools */}
        <div className="rounded-2xl border border-fox-violet/10 bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-fox-ink">Reward Pools</h2>
          <p className="mt-1 text-sm text-fox-ink/60">
            Configure what each tier can win — every active reward in a tier has an equal chance.
          </p>
          <div className="mt-4 space-y-5">
            {TIERS.map((t) => (
              <div key={t.value}>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-bold" style={{ color: t.color }}>
                  <Medal size={15} weight="fill" />
                  {t.label}
                </p>
                <RewardPool tier={t.value} token={token} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voucher list */}
      <div className="rounded-2xl border border-fox-violet/10 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-fox-ink">Generated Vouchers</h2>
          <div className="flex gap-2">
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="rounded-lg border border-fox-violet/15 px-2 py-1.5 text-xs outline-none"
            >
              <option value="">All tiers</option>
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-fox-violet/15 px-2 py-1.5 text-xs outline-none"
            >
              <option value="">All statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="REDEEMED">Redeemed</option>
            </select>
          </div>
        </div>

        <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto">
          {loadingList ? (
            <p className="py-6 text-center text-xs text-fox-ink/40">Loading...</p>
          ) : vouchers.length === 0 ? (
            <p className="py-6 text-center text-xs text-fox-ink/40">No vouchers yet.</p>
          ) : (
            vouchers.map((v) => (
              <div key={v.id} className="rounded-xl border border-fox-violet/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-fox-ink">{v.voucherCode}</span>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      v.status === "REDEEMED" ? "bg-green-50 text-green-600" : "bg-fox-gradient-soft text-fox-violet"
                    }`}
                  >
                    {v.status === "REDEEMED" ? <SealCheck size={11} weight="fill" /> : <Clock size={11} weight="bold" />}
                    {v.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-fox-ink/50">
                  <span>{v.tier}</span>
                  <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                </div>
                {v.rewardText && <p className="mt-1 text-xs font-semibold text-fox-violet">Won: {v.rewardText}</p>}
                <button
                  onClick={() => navigate(`/admin/voucher-qr/${v.voucherCode}`)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-fox-violet/15 px-3 py-1.5 text-xs font-semibold text-fox-violet transition hover:bg-fox-violet/5"
                >
                  <QrCode size={13} weight="bold" />
                  View QR
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
