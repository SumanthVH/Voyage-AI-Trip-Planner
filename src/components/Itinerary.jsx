import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  MapPin,
  Moon,
  RotateCcw,
  Share2,
  Sparkles,
  Sun,
  Wallet,
} from "lucide-react";
import DayCard from "./DayCard";

export default function Itinerary({ trip, setTrip, onBack, onSave, isDark, toggleDarkMode }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const itineraryRef = useRef(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      itineraryRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const copyTrip = async () => {
    const text = [
      trip.title,
      trip.summary,
      "",
      ...trip.days.flatMap((day) => [
        `Day ${day.day}: ${day.title}`,
        ...day.stops.map((stop) => `${stop.time} — ${stop.name} (${stop.area})`),
        "",
      ]),
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareTrip = async () => {
    const shareData = {
      title: trip.title,
      text: `${trip.title} — ${trip.destination}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      await copyTrip();
    }
  };

  const saveTrip = () => {
    if (saved) return;

    onSave();
    setSaved(true);
  };

  return (
    <main className="itinerary-page">
      <header className="itinerary-nav">
        <div className="nav-inner">
          <button className="brand brand-button" onClick={onBack}>
            <span className="brand-mark"><Sparkles size={20} /></span>
            <span>VOYAGE</span>
          </button>

          <div className="itinerary-actions">
            <button className="theme-toggle" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} onClick={toggleDarkMode}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
              {isDark ? "Light" : "Dark"}
            </button>
            <button aria-label={copied ? "Trip copied" : "Copy itinerary"} onClick={copyTrip}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copied" : "Copy"}</button>
            <button aria-label="Share itinerary" onClick={shareTrip}><Share2 size={17} /> Share</button>
            <button className="save-action" aria-label={saved ? "Journey saved" : "Save journey"} onClick={saveTrip} disabled={saved}>
              {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
              {saved ? "Saved" : "Save journey"}
            </button>
          </div>
        </div>
      </header>

      <section className="trip-hero">
        <div className="trip-hero-inner">
          <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> Plan another journey</button>
          <span className="section-kicker">YOUR AI-GENERATED VOYAGE</span>
          <h1>{trip.title}</h1>
          <p>{trip.summary}</p>
          <div className="trip-meta">
            <span><MapPin size={17} /> {trip.destination}</span>
            <span><Wallet size={17} /> {trip.estimatedBudget}</span>
            <span>{trip.days.length} days</span>
          </div>
        </div>
      </section>

      <section className="days-section" ref={itineraryRef}>
        <div className="days-inner">
          <div className="days-intro">
            <span className="section-kicker">YOUR ITINERARY</span>
            <h2>Day by day.</h2>
            <p>Drag activities to reorder them. Edit, replace or remove anything.</p>
          </div>

          <div className="days-list">
            {trip.days.map((day, dayIndex) => (
              <DayCard
                key={`${day.day}-${dayIndex}`}
                day={day}
                dayIndex={dayIndex}
                destination={trip.destination}
                trip={trip}
                setTrip={setTrip}
              />
            ))}
          </div>

          <div className="journey-end">
            <Sparkles size={28} />
            <h2>Make it yours.</h2>
            <p>Your itinerary is a starting point, not a rulebook.</p>
            <button className="primary-button" onClick={onBack}>
              <RotateCcw size={17} /> Plan another journey
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
