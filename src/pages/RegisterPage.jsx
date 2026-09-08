import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Buildings,
  GraduationCap,
  CalendarBlank,
  Code,
  ChartLineUp,
  Briefcase,
  Gift,
  ArrowRight,
  Compass,
  Copy,
  Check,
  Ticket,
} from "@phosphor-icons/react";
import { api } from "../api/client.js";
import GlowBackdrop from "../components/GlowBackdrop.jsx";
import logo from "../assets/foxtech-logo-full.jpg";

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

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Graduated / Professional"];

const CATEGORY_BADGES = [
  { label: "IT Courses", detail: "Full Stack, AI/ML, Cloud, Cyber Security", icon: Code },
  { label: "Management", detail: "PM, HR, Digital Marketing, Analytics", icon: ChartLineUp },
  { label: "Non-IT", detail: "Communication, Finance, Career Skills", icon: Briefcase },
];

function isValidPhone(raw) {
  const trimmed = raw.trim();
  if (!/^\+?[0-9\s-]{7,20}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function CouponCode({ code }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard access can fail (permissions, insecure context) — the
      // code is still selectable/visible, so this is a soft failure.
    }
  }

  return (
    <div className="mt-5 rounded-2xl bg-fox-gradient-soft p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-fox-violet/80">Your Coupon</p>
      <p className="mt-1 text-4xl font-extrabold tracking-[0.15em] text-gradient">{code}</p>
      <button
        type="button"
        onClick={copy}
        className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg border border-fox-violet/20 bg-white px-4 py-2 text-xs font-semibold text-fox-violet transition hover:bg-fox-violet/5"
      >
        {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
        {copied ? "Copied!" : "Copy Code"}
      </button>
      <p className="mt-3 text-xs text-fox-ink/50">
        Save this code — you can use it on any device to continue where you left off.
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  // The registration QR/link identifies the campaign — e.g. /?campaign=normal
  // for the offline-games QR — rather than asking the user to choose.
  const campaign = searchParams.get("campaign") === "normal" ? "NORMAL" : "INSTAGRAM";
  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "",
    departmentOther: "",
    year: "",
    collegeName: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(null); // { message, offer, couponCode }
  const [couponResult, setCouponResult] = useState(null); // { couponCode, name, resumed }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    const name = form.name.trim().replace(/\s+/g, " ");
    if (!name || name.length < 2) nextErrors.name = "Please enter your full name.";
    if (!isValidPhone(form.phone)) nextErrors.phone = "Please enter a valid phone number.";
    if (!form.department) nextErrors.department = "Please select your department.";
    if (form.department === "Other" && form.departmentOther.trim().length < 2) {
      nextErrors.departmentOther = "Please specify your department.";
    }
    if (!form.year) nextErrors.year = "Please select your year.";
    if (form.collegeName.trim().length < 2) nextErrors.collegeName = "Please enter your college name.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlreadyClaimed(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const cleanedName = form.name.trim().replace(/\s+/g, " ");
      const result = await api.registerParticipant({
        name: cleanedName,
        phone: form.phone.trim(),
        department: form.department,
        departmentOther: form.department === "Other" ? form.departmentOther.trim() : undefined,
        year: form.year,
        collegeName: form.collegeName.trim().replace(/\s+/g, " "),
        campaignType: campaign,
      });

      if (result?.success && result.canSpin) {
        setCouponResult({ couponCode: result.couponCode, name: cleanedName, resumed: Boolean(result.resumed) });
        return;
      }

      if (result?.alreadyParticipated) {
        setAlreadyClaimed({ message: result.message, offer: result.offer, couponCode: result.couponCode });
        return;
      }

      setErrors({ form: result?.message || "Something went wrong. Please try again." });
    } catch (err) {
      setErrors({ form: err.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowBackdrop />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col-reverse items-center gap-12 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:py-0">
        {/* Branding / copy side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-xl text-center lg:text-left"
        >
          <div className="mb-6 flex items-center justify-center lg:justify-start">
            <div className="inline-flex rounded-xl bg-white px-3 py-2 shadow-card">
              <img src={logo} alt="FOXTECH" className="h-8 w-auto sm:h-9" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-fox-ink sm:text-5xl">
            Spin. Win. <span className="text-gradient">Learn.</span>
          </h1>
          <p className="mt-5 text-lg text-fox-ink/70">
            Your career upgrade starts here. Enter your details, spin the FOXTECH wheel, and unlock an
            exclusive discount on our IT, management and professional training programs.
          </p>

          <a
            href="#categories"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-fox-violet transition hover:gap-2.5"
          >
            <Compass size={17} weight="bold" />
            Explore Courses
            <ArrowRight size={15} weight="bold" />
          </a>

          <div id="categories" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CATEGORY_BADGES.map((cat) => (
              <div
                key={cat.label}
                className="rounded-2xl border border-fox-violet/10 bg-white/70 p-4 text-left shadow-card backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-glow-sm"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-fox-gradient-soft">
                  <cat.icon size={18} weight="bold" className="text-fox-violet" />
                </div>
                <p className="text-sm font-bold text-fox-violet">{cat.label}</p>
                <p className="mt-1 text-xs text-fox-ink/60">{cat.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl border border-fox-violet/10 bg-white p-8 shadow-glow">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-fox-gradient" />

            {couponResult ? (
              <div className="animate-fade-up text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fox-gradient-soft">
                  <Ticket size={28} weight="fill" className="text-fox-violet" />
                </div>
                <h2 className="text-xl font-bold text-fox-ink">
                  {couponResult.resumed ? "Welcome back!" : "Registration Successful!"}
                </h2>
                <p className="mt-1 text-sm text-fox-ink/60">
                  {couponResult.resumed
                    ? "Here's your coupon code — pick up where you left off."
                    : "Here's your unique coupon code."}
                </p>

                <CouponCode code={couponResult.couponCode} />

                <p className="mt-6 text-sm text-fox-ink/60">
                  {campaign === "NORMAL"
                    ? "Show this coupon code to our team to start playing the 9 games. Complete 3, 6, or 9 games to unlock a Silver, Gold, or Platinum voucher."
                    : "We'll share the Decision Wheel link separately — keep this coupon code safe, you'll need it there to spin."}
                </p>
              </div>
            ) : alreadyClaimed ? (
              <div className="animate-fade-up">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fox-gradient-soft">
                  <Gift size={28} weight="fill" className="text-fox-violet" />
                </div>
                <h2 className="text-center text-xl font-bold text-fox-ink">You've already claimed your offer!</h2>
                <p className="mt-2 text-center text-sm text-fox-ink/60">
                  You have already participated in this offer campaign.
                </p>
                {alreadyClaimed.offer && (
                  <div className="mt-5 rounded-2xl bg-fox-gradient-soft p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-fox-violet/80">Your offer</p>
                    {alreadyClaimed.offer.offerType === "custom" ? (
                      <p className="mt-1 text-2xl font-extrabold text-gradient">{alreadyClaimed.offer.name}</p>
                    ) : (
                      <>
                        <p className="mt-1 text-2xl font-extrabold text-gradient">
                          {alreadyClaimed.offer.discountPercentage}% OFF
                        </p>
                        <p className="text-sm text-fox-ink/60">{alreadyClaimed.offer.name}</p>
                      </>
                    )}
                  </div>
                )}
                {alreadyClaimed.couponCode && (
                  <p className="mt-4 text-center text-xs text-fox-ink/50">
                    Your coupon code: <span className="font-bold text-fox-ink/70">{alreadyClaimed.couponCode}</span>
                  </p>
                )}
                <button
                  onClick={() => setAlreadyClaimed(null)}
                  className="mt-6 w-full rounded-xl border border-fox-violet/20 py-3 text-sm font-semibold text-fox-violet transition hover:bg-fox-violet/5"
                >
                  Back
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-fox-ink">Claim Your Offer</h2>
                <p className="mt-1 text-sm text-fox-ink/60">
                  Fill in your details to receive your coupon code.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">Full Name</label>
                    <div className="relative">
                      <User size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fox-violet/50" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-fox-violet/40 ${
                          errors.name ? "border-red-400" : "border-fox-violet/15"
                        }`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fox-violet/50" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="e.g. 98765 43210"
                        className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-fox-violet/40 ${
                          errors.phone ? "border-red-400" : "border-fox-violet/15"
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">Department</label>
                    <div className="relative">
                      <Buildings size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fox-violet/50" />
                      <select
                        value={form.department}
                        onChange={(e) => updateField("department", e.target.value)}
                        className={`w-full appearance-none rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-fox-violet/40 ${
                          errors.department ? "border-red-400" : "border-fox-violet/15"
                        }`}
                      >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
                  </div>

                  {form.department === "Other" && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">
                        Please specify your department
                      </label>
                      <input
                        type="text"
                        value={form.departmentOther}
                        onChange={(e) => updateField("departmentOther", e.target.value)}
                        placeholder="e.g. Biotechnology"
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-fox-violet/40 ${
                          errors.departmentOther ? "border-red-400" : "border-fox-violet/15"
                        }`}
                      />
                      {errors.departmentOther && (
                        <p className="mt-1 text-xs text-red-500">{errors.departmentOther}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">Year</label>
                    <div className="relative">
                      <CalendarBlank size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fox-violet/50" />
                      <select
                        value={form.year}
                        onChange={(e) => updateField("year", e.target.value)}
                        className={`w-full appearance-none rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-fox-violet/40 ${
                          errors.year ? "border-red-400" : "border-fox-violet/15"
                        }`}
                      >
                        <option value="">Select year</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fox-ink/80">College Name</label>
                    <div className="relative">
                      <GraduationCap size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fox-violet/50" />
                      <input
                        type="text"
                        value={form.collegeName}
                        onChange={(e) => updateField("collegeName", e.target.value)}
                        placeholder="e.g. FOXTECH Institute of Technology"
                        className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-fox-violet/40 ${
                          errors.collegeName ? "border-red-400" : "border-fox-violet/15"
                        }`}
                      />
                    </div>
                    {errors.collegeName && <p className="mt-1 text-xs text-red-500">{errors.collegeName}</p>}
                  </div>

                  {errors.form && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{errors.form}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-fox-gradient py-3.5 text-sm font-bold text-white shadow-glow-sm transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : (
                      <>
                        Claim Your Offer
                        <ArrowRight size={17} weight="bold" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/*
        Hidden admin entry point. This whole landing/registration page is
        handed out to every participant, so there is no visible link to the
        admin login — that would let anyone wander into /admin. Instead this
        is an invisible (opacity-0), keyboard/screen-reader-excluded hit area
        pinned to the very bottom-right corner of the screen. Only someone who
        knows to click that corner reaches the admin login section.
      */}
      <Link
        to="/admin"
        aria-hidden="true"
        tabIndex={-1}
        className="fixed bottom-0 right-0 z-50 h-10 w-10 opacity-0"
      />
    </div>
  );
}
