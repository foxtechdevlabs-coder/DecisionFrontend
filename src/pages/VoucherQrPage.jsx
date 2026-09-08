import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Medal, SpinnerGap } from "@phosphor-icons/react";
import { api } from "../api/client.js";
import GlowBackdrop from "../components/GlowBackdrop.jsx";
import logo from "../assets/foxtech-logo-full.jpg";

const TIER_COLORS = { SILVER: "#9CA3AF", GOLD: "#D4A017", PLATINUM: "#7C3AED" };

// Dedicated, full-page QR display for one voucher — large enough to scan or
// print. Reuses the existing public GET /api/vouchers/:code lookup and the
// same voucher URL the admin's inline "Generate Voucher QR" flow already
// produced; this page just gives that QR its own route/screen instead of
// rendering inside the admin dashboard. Viewing the QR here never redeems
// it — only actually opening /voucher/:code and scratching does that.
export default function VoucherQrPage() {
  const { code } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getVoucher(code)
      .then((res) => {
        if (res?.success) setVoucher(res.voucher);
        else setError(res?.message || "This voucher does not exist.");
      })
      .catch(() => setError("Could not load this voucher. Please try again."))
      .finally(() => setLoading(false));
  }, [code]);

  const voucherUrl = `${window.location.origin}/voucher/${code}`;
  const tierColor = voucher ? TIER_COLORS[voucher.tier] || "#7C3AED" : "#7C3AED";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <GlowBackdrop />

      <div className="w-full max-w-md rounded-3xl border border-fox-violet/10 bg-white p-8 text-center shadow-glow">
        <div className="mx-auto mb-5 inline-flex rounded-xl bg-fox-mist px-3 py-2">
          <img src={logo} alt="FOXTECH" className="h-7 w-auto" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-2 py-10 text-fox-ink/40">
            <SpinnerGap size={28} weight="bold" className="animate-spin" />
            Loading voucher...
          </div>
        ) : error ? (
          <p className="py-10 text-sm text-red-500">{error}</p>
        ) : (
          <>
            <div
              className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${tierColor}22` }}
            >
              <Medal size={20} weight="fill" style={{ color: tierColor }} />
            </div>
            <h1 className="text-xl font-bold text-fox-ink">
              <span style={{ color: tierColor }}>{voucher.tier}</span> Voucher
            </h1>
            <p className="mt-1 text-sm text-fox-ink/60">
              {voucher.status === "REDEEMED" ? "Already redeemed" : "Scan to open the scratch card"}
            </p>

            <div className="mx-auto mt-6 flex justify-center rounded-2xl bg-fox-mist p-5">
              <QRCodeSVG value={voucherUrl} size={260} />
            </div>

            <p className="mt-4 font-mono text-sm font-bold text-fox-violet">{code}</p>
            <p className="mt-1 break-all text-xs text-fox-ink/40">{voucherUrl}</p>
          </>
        )}

        <Link
          to="/admin"
          className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-sm font-semibold text-fox-violet transition hover:gap-2.5"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to Admin
        </Link>
      </div>
    </div>
  );
}
