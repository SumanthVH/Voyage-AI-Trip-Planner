import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, Moon, Plane, Share2, Sparkles, Sun } from "lucide-react";
import TripForm from "./components/TripForm";
import Itinerary from "./components/Itinerary";

const STORAGE_KEY = "voyage-saved-journeys";
const THEME_KEY = "voyage-theme";

export default function App() {
  const [trip, setTrip] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setSavedTrips(Array.isArray(stored) ? stored : []);
    } catch {
      setSavedTrips([]);
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark") {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const persistSaved = (next) => {
    setSavedTrips(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveCurrentTrip = () => {
    if (!trip) return;
    const saved = {
      ...trip,
      savedId: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    persistSaved([saved, ...savedTrips]);
  };

  const deleteSavedTrip = (savedId) => {
    persistSaved(savedTrips.filter((item) => item.savedId !== savedId));
  };

  if (trip) {
    return (
      <Itinerary
        trip={trip}
        setTrip={setTrip}
        onBack={() => setTrip(null)}
        onSave={saveCurrentTrip}
        isDark={isDark}
        toggleDarkMode={() => setIsDark((current) => !current)}
      />
    );
  }

  return (
    <main className="site-shell">
      <header className="navbar">
        <div className="nav-inner">
          <a className="brand" href="#top" aria-label="Voyage home">
            <span className="brand-mark"><Sparkles size={20} /></span>
            <span>VOYAGE</span>
          </a>

          <div className="nav-actions">
            <span className="nav-label">AI TRIP PLANNER</span>
            <button className="theme-toggle" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} onClick={() => setIsDark((current) => !current)}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
              {isDark ? "Light" : "Dark"}
            </button>
            <button className="theme-toggle" aria-label="Share Voyage" onClick={async () => {
              const shareData = {
                title: "Voyage AI Trip Planner",
                text: "Plan your next journey with Voyage.",
                url: window.location.href,
              };

              if (navigator.share) {
                await navigator.share(shareData).catch(() => {});
              } else {
                await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
              }
            }}>
              <Share2 size={17} /> Share
            </button>
            <button className="saved-button" aria-label="View saved journeys" onClick={() => setShowSaved(true)}>
              <Bookmark size={17} />
              Saved Journeys
              <span>{savedTrips.length}</span>
            </button>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="hero-inner">
          <div className="eyebrow"><Sparkles size={15} /> AI-POWERED TRAVEL</div>
          <h1>
            Don&apos;t just plan it.
            <span>Experience it.</span>
          </h1>
          <p className="hero-copy">
            Tell us where you want to go. AI transforms a simple idea into a
            thoughtful, interactive journey built around you.
          </p>

          <TripForm onTripGenerated={setTrip} />

          <div className="feature-row">
            <span>✦ Natural language</span>
            <span>✦ Personalized itinerary</span>
            <span>✦ Fully interactive</span>
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="process-inner">
          <div className="section-kicker">FROM IDEA TO ITINERARY</div>
          <div className="process-heading-row">
            <h2>One prompt.<br /><span>Your entire journey.</span></h2>
            <p>Describe <ArrowRight size={16} /> Generate <ArrowRight size={16} /> Personalize</p>
          </div>

          <div className="process-grid">
            <article className="process-card">
              <div className="step-number">01</div>
              <h3>Describe</h3>
              <p>Share your destination, budget, interests and travel style naturally.</p>
            </article>
            <article className="process-card featured">
              <div className="step-number">02</div>
              <h3>Generate</h3>
              <p>AI turns your idea into a structured day-by-day travel experience.</p>
            </article>
            <article className="process-card">
              <div className="step-number">03</div>
              <h3>Make it yours</h3>
              <p>Edit, replace, remove and rearrange stops until the journey feels right.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="statement-section">
        <div>
          <Plane size={34} />
          <p>Built for the way<br />you actually travel.</p>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="brand">
            <span className="brand-mark"><Sparkles size={20} /></span>
            <span>VOYAGE</span>
          </div>
          <p>AI-powered journeys, built around you.</p>
        </div>
      </footer>

      {showSaved && (
        <div className="modal-backdrop" onMouseDown={() => setShowSaved(false)}>
          <div className="saved-panel" onMouseDown={(e) => e.stopPropagation()}>
            <div className="saved-panel-header">
              <div>
                <span className="section-kicker">YOUR COLLECTION</span>
                <h2>Saved journeys</h2>
              </div>
              <button className="icon-button" onClick={() => setShowSaved(false)}>×</button>
            </div>

            {savedTrips.length === 0 ? (
              <div className="empty-state">
                <Bookmark size={32} />
                <h3>No saved journeys yet</h3>
                <p>Generate a trip and save it here for later.</p>
              </div>
            ) : (
              <div className="saved-list">
                {savedTrips.map((item) => (
                  <article className="saved-item" key={item.savedId}>
                    <button className="saved-main" onClick={() => {
                      setTrip(item);
                      setShowSaved(false);
                    }}>
                      <span>{item.destination}</span>
                      <strong>{item.title}</strong>
                      <small>{item.days?.length || 0} days · {item.estimatedBudget}</small>
                    </button>
                    <button className="delete-link" onClick={() => deleteSavedTrip(item.savedId)}>
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
