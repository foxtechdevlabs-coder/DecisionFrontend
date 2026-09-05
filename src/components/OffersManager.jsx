import { useEffect, useState } from "react";
import { Percent, Gift, Trash, Plus, Sparkle } from "@phosphor-icons/react";
import { api } from "../api/client.js";
import Wheel from "./Wheel.jsx";

const logo = "/logo.png";

const WHEEL_COLORS = ["#7C3AED", "#4C1D95", "#A855F7", "#2E1065", "#9333EA", "#3B0764", "#6D28D9"];

const BLANK_DRAFT = { offerType: "percentage", name: "", discountPercentage: "", weight: "", maxClaims: "" };

function toWheelSegments(offers) {
  return offers
    .filter((o) => o.isActive)
    .map((o, index) => ({
      id: o.id,
      name: o.name,
      offerType: o.offerType,
      discountPercentage: o.discountPercentage,
      color: WHEEL_COLORS[index % WHEEL_COLORS.length],
    }));
}

function TypeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-fox-violet/15 p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => onChange("percentage")}
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
          value === "percentage" ? "bg-fox-gradient text-white" : "text-fox-ink/50 hover:text-fox-violet"
        }`}
      >
        <Percent size={12} weight="bold" />
        %
      </button>
      <button
        type="button"
        onClick={() => onChange("custom")}
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
          value === "custom" ? "bg-fox-gradient text-white" : "text-fox-ink/50 hover:text-fox-violet"
        }`}
      >
        <Gift size={12} weight="bold" />
        Text
      </button>
    </div>
  );
}

function OfferRow({ offer, token, onChanged, onError }) {
  const [draft, setDraft] = useState({
    offerType: offer.offerType,
    name: offer.name,
    discountPercentage: offer.discountPercentage ?? "",
    weight: offer.weight,
    maxClaims: offer.maxClaims ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isDirty =
    draft.offerType !== offer.offerType ||
    draft.name !== offer.name ||
    String(draft.discountPercentage ?? "") !== String(offer.discountPercentage ?? "") ||
    Number(draft.weight) !== offer.weight ||
    String(draft.maxClaims ?? "") !== String(offer.maxClaims ?? "");

  async function save() {
    setSaving(true);
    onError("");
    try {
      const res = await api.adminUpdateOffer(token, offer.id, {
        offerType: draft.offerType,
        name: draft.name.trim(),
        discountPercentage: draft.offerType === "custom" ? null : Number(draft.discountPercentage),
        weight: Number(draft.weight),
        maxClaims: draft.maxClaims === "" ? null : Number(draft.maxClaims),
      });
      if (res?.success) onChanged(res.offer);
      else onError(res?.message || "Could not save this offer.");
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    onError("");
    try {
      const res = await api.adminUpdateOffer(token, offer.id, { isActive: !offer.isActive });
      if (res?.success) onChanged(res.offer);
      else onError(res?.message || "Could not update this offer.");
    } catch (err) {
      onError(err.message);
    }
  }

  async function remove() {
    const hasClaims = offer.claimsCount > 0;
    const confirmMessage = hasClaims
      ? `"${offer.name}" has already been won by ${offer.claimsCount} participant(s). Deleting it will unlink it from their records (their recorded offer name/discount stays, just the reference to this offer is cleared). This can't be undone. Delete anyway?`
      : `Delete "${offer.name}"? This can't be undone.`;
    if (!confirm(confirmMessage)) return;

    setDeleting(true);
    onError("");
    try {
      const res = await api.adminDeleteOffer(token, offer.id, { force: hasClaims });
      if (res?.success) onChanged(null, offer.id);
      else onError(res?.message || "Could not delete this offer.");
    } catch (err) {
      onError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr className="border-b border-fox-violet/5 align-middle">
      <td className="py-2 pr-3">
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder={draft.offerType === "custom" ? "e.g. Free Course Kit" : "e.g. 25% Discount"}
          className="w-40 rounded-lg border border-fox-violet/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
        />
      </td>
      <td className="py-2 pr-3">
        <TypeToggle value={draft.offerType} onChange={(t) => setDraft((d) => ({ ...d, offerType: t }))} />
      </td>
      <td className="py-2 pr-3">
        {draft.offerType === "custom" ? (
          <span className="text-fox-ink/30">—</span>
        ) : (
          <input
            type="number"
            min="1"
            max="100"
            value={draft.discountPercentage}
            onChange={(e) => setDraft((d) => ({ ...d, discountPercentage: e.target.value }))}
            className="w-20 rounded-lg border border-fox-violet/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
          />
        )}
      </td>
      <td className="py-2 pr-3">
        <input
          type="number"
          min="0"
          value={draft.weight}
          onChange={(e) => setDraft((d) => ({ ...d, weight: e.target.value }))}
          className="w-20 rounded-lg border border-fox-violet/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
        />
      </td>
      <td className="py-2 pr-3">
        <input
          type="number"
          min="0"
          placeholder="Unlimited"
          value={draft.maxClaims}
          onChange={(e) => setDraft((d) => ({ ...d, maxClaims: e.target.value }))}
          className="w-24 rounded-lg border border-fox-violet/15 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
        />
      </td>
      <td className="py-2 pr-3 text-center text-fox-ink/60">{offer.claimsCount}</td>
      <td className="py-2 pr-3">
        <button
          onClick={toggleActive}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            offer.isActive ? "bg-fox-gradient-soft text-fox-violet" : "bg-fox-ink/5 text-fox-ink/40"
          }`}
        >
          {offer.isActive ? "Active" : "Disabled"}
        </button>
      </td>
      <td className="py-2 pr-3 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={save}
            disabled={!isDirty || saving}
            className="rounded-lg bg-fox-gradient px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={remove}
            disabled={deleting}
            aria-label={`Delete ${offer.name}`}
            title={offer.claimsCount > 0 ? "Already won by participants — deleting will unlink their records" : "Delete"}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash size={14} weight="bold" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function OffersManager({ token }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newOffer, setNewOffer] = useState(BLANK_DRAFT);
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    api
      .adminGetOffers(token)
      .then((res) => {
        if (res?.success) setOffers(res.offers);
        else setError(res?.message || "Could not load offers.");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  function handleChanged(updatedOffer, deletedId) {
    if (deletedId) {
      setOffers((prev) => prev.filter((o) => o.id !== deletedId));
    } else if (updatedOffer) {
      setOffers((prev) => prev.map((o) => (o.id === updatedOffer.id ? updatedOffer : o)));
    }
  }

  async function createOffer(e) {
    e.preventDefault();
    setError("");
    const needsDiscount = newOffer.offerType === "percentage";
    if (!newOffer.name.trim() || (needsDiscount && newOffer.discountPercentage === "") || newOffer.weight === "") {
      setError(
        needsDiscount
          ? "Name, discount percentage and weight are required to add an offer."
          : "Reward text and weight are required to add an offer."
      );
      return;
    }
    setCreating(true);
    try {
      const res = await api.adminCreateOffer(token, {
        offerType: newOffer.offerType,
        name: newOffer.name.trim(),
        discountPercentage: needsDiscount ? Number(newOffer.discountPercentage) : null,
        weight: Number(newOffer.weight),
        maxClaims: newOffer.maxClaims === "" ? null : Number(newOffer.maxClaims),
        isActive: true,
      });
      if (res?.success) {
        setOffers((prev) => [...prev, res.offer]);
        setNewOffer(BLANK_DRAFT);
      } else {
        setError(res?.message || "Could not create this offer.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  const previewSegments = toWheelSegments(offers);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-fox-violet/10 bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-bold text-fox-ink">
          <Sparkle size={18} weight="fill" className="text-fox-violet" />
          Wheel Offers
        </h2>
        <p className="mt-1 text-sm text-fox-ink/60">
          Changes here apply to the public wheel immediately — no redeploy needed. Rewards can be a
          percentage discount or plain text (e.g. "Free Course Kit").
        </p>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-fox-violet/10 text-xs uppercase tracking-wide text-fox-ink/50">
                <th className="py-2 pr-3">Name / Reward Text</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Discount %</th>
                <th className="py-2 pr-3">Weight</th>
                <th className="py-2 pr-3">Max Claims</th>
                <th className="py-2 pr-3 text-center">Won</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-fox-ink/40">
                    Loading...
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    token={token}
                    onChanged={handleChanged}
                    onError={setError}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={createOffer} className="mt-6 rounded-xl bg-fox-gradient-soft p-4">
          <p className="mb-3 text-sm font-semibold text-fox-ink">Add a new offer</p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-fox-ink/60">Type</label>
              <TypeToggle
                value={newOffer.offerType}
                onChange={(t) => setNewOffer((d) => ({ ...d, offerType: t }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-fox-ink/60">
                {newOffer.offerType === "custom" ? "Reward Text" : "Name"}
              </label>
              <input
                value={newOffer.name}
                onChange={(e) => setNewOffer((d) => ({ ...d, name: e.target.value }))}
                placeholder={newOffer.offerType === "custom" ? "e.g. Free Course Kit" : "e.g. 25% Discount"}
                className="w-44 rounded-lg border border-fox-violet/15 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
              />
            </div>
            {newOffer.offerType === "percentage" && (
              <div>
                <label className="mb-1 block text-xs text-fox-ink/60">Discount %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newOffer.discountPercentage}
                  onChange={(e) => setNewOffer((d) => ({ ...d, discountPercentage: e.target.value }))}
                  className="w-24 rounded-lg border border-fox-violet/15 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs text-fox-ink/60">Weight</label>
              <input
                type="number"
                min="0"
                value={newOffer.weight}
                onChange={(e) => setNewOffer((d) => ({ ...d, weight: e.target.value }))}
                className="w-24 rounded-lg border border-fox-violet/15 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-fox-ink/60">Max Claims</label>
              <input
                type="number"
                min="0"
                placeholder="Unlimited"
                value={newOffer.maxClaims}
                onChange={(e) => setNewOffer((d) => ({ ...d, maxClaims: e.target.value }))}
                className="w-28 rounded-lg border border-fox-violet/15 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-fox-violet/30"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1.5 rounded-lg bg-fox-gradient px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              <Plus size={16} weight="bold" />
              {creating ? "Adding..." : "Add Offer"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-fox-violet/10 bg-white p-5 shadow-card">
        <h3 className="text-sm font-bold text-fox-ink">Live Wheel Preview</h3>
        <p className="mt-1 text-xs text-fox-ink/50">Only active offers appear on the public wheel.</p>
        <div className="mt-4 scale-[0.8] origin-top">
          {previewSegments.length > 0 ? (
            <Wheel segments={previewSegments} rotation={0} spinning={false} onRotationComplete={() => {}} logoSrc={logo} />
          ) : (
            <p className="py-10 text-center text-sm text-fox-ink/40">No active offers — the public wheel is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
}
