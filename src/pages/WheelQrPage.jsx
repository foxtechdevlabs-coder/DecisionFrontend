import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Link as LinkIcon, Check } from "@phosphor-icons/react";
import GlowBackdrop from "../components/GlowBackdrop.jsx";
import logo from "../assets/foxtech-logo-full.jpg";

// Dedicated, full-page QR display for the Decision Wheel link — large
// enough to scan off a screen/projector. Reuses the same fixed /wheel URL
// the admin's "Share the Decision Wheel" panel already links to; this page
// just gives it its own route instead of showing the QR inline in the
// admin dashboard. No auth required to view — the link itself is meant to
// be shared publicly (e.g. on Instagram), and each visitor still needs
// their own coupon code to actually spin.
export default function WheelQrPage() {
  const [copied, setCopied] = useState(false);
  const wheelUrl = `${window.location.origin}/wheel`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(wheelUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard access can fail — the link is still visible to copy manually
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <GlowBackdrop />

      <div className="w-full max-w-md rounded-3xl border border-fox-violet/10 bg-white p-8 text-center shadow-glow">
        <div className="mx-auto mb-5 inline-flex rounded-xl bg-fox-mist px-3 py-2">
          <img src={logo} alt="FOXTECH" className="h-7 w-auto" />
        </div>

        <h1 className="text-xl font-bold text-fox-ink">Decision Wheel</h1>
        <p className="mt-1 text-sm text-fox-ink/60">Scan to enter — each visitor spins with their own coupon.</p>

        <div className="mx-auto mt-6 flex justify-center rounded-2xl bg-fox-mist p-5">
          <QRCodeSVG value={wheelUrl} size={260} />
        </div>

        <button
          onClick={copyLink}
          className="mx-auto mt-5 flex items-center gap-1.5 rounded-lg border border-fox-violet/20 px-4 py-2 text-xs font-semibold text-fox-violet transition hover:bg-fox-violet/5"
        >
          {copied ? <Check size={14} weight="bold" /> : <LinkIcon size={14} weight="bold" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <p className="mt-2 break-all text-xs text-fox-ink/40">{wheelUrl}</p>

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
