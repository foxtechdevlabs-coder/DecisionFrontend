import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SpinnerGap } from "@phosphor-icons/react";
import { api } from "../api/client.js";
import { participantSession } from "../api/session.js";
import GlowBackdrop from "../components/GlowBackdrop.jsx";
import Wheel from "../components/Wheel.jsx";
import ResultModal from "../components/ResultModal.jsx";

const logoMark = "/logo.png";
const logo = "/foxtech-logo-full.jpg";

const EXTRA_SPINS = 6;

function computeTargetRotation(offers, winningOfferId) {
  const index = offers.findIndex((o) => o.id === winningOfferId);
  const segmentAngle = 360 / offers.length;
  const center = index >= 0 ? index * segmentAngle + segmentAngle / 2 : 0;
  const buffer = Math.min(6, segmentAngle / 4);
  const jitter = (Math.random() * 2 - 1) * Math.max(segmentAngle / 2 - buffer, 0);
  const landing = (360 - center + jitter + 360) % 360;
  return EXTRA_SPINS * 360 + landing;
}

export default function WheelPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pendingResult, setPendingResult] = useState(null); // offer to reveal once wheel stops
  const [result, setResult] = useState(null); // { offer, alreadySpun }
  const [spinError, setSpinError] = useState("");

  useEffect(() => {
    const existing = participantSession.load();
    if (!existing?.token) {
      navigate("/", { replace: true });
      return;
    }
    setSession(existing);

    api
      .getOffers()
      .then((data) => {
        if (data?.success && data.offers?.length) {
          setOffers(data.offers);
        } else {
          setLoadError("No offers are available right now. Please check back later.");
        }
      })
      .catch(() => setLoadError("Could not load the wheel. Please refresh the page."))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleSpin() {
    if (!session?.token || spinning || result) return;
    setSpinError("");
    setSpinning(true);

    try {
      const response = await api.spin(session.token);

      if (response?.success && response.offer) {
        const target = computeTargetRotation(offers, response.offer.id);
        setPendingResult({ offer: response.offer, alreadySpun: false });
        setRotation(target);
        return; // reveal happens in onRotationComplete
      }

      if (response?.alreadySpun) {
        setSpinning(false);
        setResult({ offer: response.offer, alreadySpun: true });
        return;
      }

      setSpinning(false);
      setSpinError(response?.message || "Something went wrong. Please try again.");
    } catch (err) {
      setSpinning(false);
      setSpinError(err.message || "Something went wrong. Please try again.");
    }
  }

  function handleRotationComplete() {
    if (!pendingResult) return;
    setSpinning(false);
    setResult(pendingResult);
    setPendingResult(null);
  }

  function handleCloseResult() {
    participantSession.clear();
    navigate("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowBackdrop />

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-center"
        >
          <div className="inline-flex rounded-xl bg-white px-3 py-2 shadow-card">
            <img src={logo} alt="FOXTECH" className="h-7 w-auto" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-extrabold tracking-tight text-fox-ink sm:text-4xl"
        >
          Spin the wheel &amp; unlock your discount
        </motion.h1>
        <p className="mt-3 max-w-md text-sm text-fox-ink/60">
          You get one spin — make it count! Your exclusive FOXTECH course discount is one click away.
        </p>

        <div className="mt-10">
          {loading ? (
            <div className="flex h-80 w-80 flex-col items-center justify-center gap-3 rounded-full border-4 border-dashed border-fox-violet/20 text-sm text-fox-ink/40">
              <SpinnerGap size={28} weight="bold" className="animate-spin text-fox-violet/50" />
              Loading wheel...
            </div>
          ) : loadError ? (
            <div className="flex h-80 w-80 items-center justify-center rounded-full border-4 border-dashed border-red-200 px-8 text-center text-sm text-red-500">
              {loadError}
            </div>
          ) : (
            <Wheel
              segments={offers}
              rotation={rotation}
              spinning={spinning}
              onRotationComplete={handleRotationComplete}
              logoSrc={logoMark}
            />
          )}
        </div>

        {spinError && <p className="mt-4 text-sm text-red-500">{spinError}</p>}

        <button
          onClick={handleSpin}
          disabled={loading || Boolean(loadError) || spinning || Boolean(result)}
          className="mt-10 flex items-center gap-2 rounded-2xl bg-fox-gradient px-12 py-4 text-base font-extrabold tracking-wide text-white shadow-glow transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {spinning && <SpinnerGap size={20} weight="bold" className="animate-spin" />}
          {spinning ? "SPINNING..." : "SPIN NOW"}
        </button>
      </div>

      <ResultModal
        offer={result?.offer}
        alreadySpun={result?.alreadySpun}
        onClose={handleCloseResult}
        participantName={session?.name}
      />
    </div>
  );
}
