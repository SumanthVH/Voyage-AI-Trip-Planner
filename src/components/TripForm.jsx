import { useRef, useState } from "react";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";

const EXAMPLE =
  "Plan a 4-day trip to Hyderabad for 3 friends with a budget of ₹20,000 per person. We love local food, history, cafés and photography.";

export default function TripForm({ onTripGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const latestRequestRef = useRef(0);
  const activeControllerRef = useRef(null);

  const generateTrip = async (event) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    setLoading(true);
    setError("");

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    try {
      const response = await fetch("http://localhost:5000/api/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate the trip.");
      }

      if (requestId !== latestRequestRef.current) {
        return;
      }

      onTripGenerated(data);
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }

      if (requestId !== latestRequestRef.current) {
        return;
      }

      setError(
        err.message === "Failed to fetch"
          ? "Could not connect to the Voyage server. Make sure npm start is running."
          : err.message
      );
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
        activeControllerRef.current = null;
      }
    }
  };

  return (
    <form className="prompt-card" onSubmit={generateTrip}>
      <div className="prompt-label">
        <span><Sparkles size={16} /> DESCRIBE YOUR DREAM TRIP</span>
        <button type="button" onClick={() => setPrompt(EXAMPLE)}>Use example</button>
      </div>

      <textarea
        value={prompt}
        maxLength={2000}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Try: 5 days in Mumbai with friends. We love street food, cricket, beaches and nightlife. ₹25,000 per person..."
        aria-label="Describe your dream trip"
      />

      <div className="prompt-footer">
        <span className="counter">{prompt.length} / 2000</span>
        <button className="primary-button" disabled={!prompt.trim() || loading}>
          {loading ? (
            <>
              <LoaderCircle className="spinner" size={18} />
              Building your journey
            </>
          ) : (
            <>
              Create my journey <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
