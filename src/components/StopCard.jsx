import { useState } from "react";
import {
  Check,
  Clock3,
  ExternalLink,
  GripVertical,
  LoaderCircle,
  MapPin,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

export default function StopCard({
  stop,
  destination,
  dayTitle,
  onUpdate,
  onRemove,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stop);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const startEditing = () => {
    setDraft(stop);
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate({ ...stop, ...draft, id: stop.id });
    setEditing(false);
  };

  const regenerateStop = async () => {
    setRegenerating(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/regenerate-stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stop, destination, dayTitle }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || "Could not replace this activity.");

      onUpdate({ ...data, id: stop.id, time: stop.time });
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const explore = () => {
    const query = encodeURIComponent(`${stop.name} ${stop.area} ${destination}`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`stop-card ${isDragging ? "dragging" : ""}`}
      draggable={draggable && !editing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="stop-time">{stop.time}</div>

      <div className="drag-handle" title="Drag to reorder">
        <GripVertical size={19} />
      </div>

      <div className="stop-content">
        {editing ? (
          <div className="edit-grid">
            <label>
              Activity
              <input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              Area
              <input value={draft.area || ""} onChange={(e) => setDraft({ ...draft, area: e.target.value })} />
            </label>
            <label>
              Category
              <input value={draft.category || ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
            </label>
            <label>
              Duration
              <input value={draft.duration || ""} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} />
            </label>
            <label>
              Estimated cost
              <input value={draft.estimatedCost || ""} onChange={(e) => setDraft({ ...draft, estimatedCost: e.target.value })} />
            </label>
            <label className="wide">
              Description
              <textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </label>
            <label className="wide">
              Local tip
              <textarea value={draft.details || ""} onChange={(e) => setDraft({ ...draft, details: e.target.value })} />
            </label>

            <div className="edit-actions wide">
              <button className="small-primary" onClick={saveEdit}><Check size={15} /> Save changes</button>
              <button className="small-ghost" onClick={() => setEditing(false)}><X size={15} /> Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="stop-topline">
              <span className="category-pill">{stop.category}</span>
              <span><MapPin size={14} /> {stop.area}</span>
            </div>
            <h4>{stop.name}</h4>
            <p className="stop-description">{stop.description}</p>
            <div className="stop-stats">
              <span><Clock3 size={15} /> {stop.duration}</span>
              <span>EST. COST <strong>{stop.estimatedCost}</strong></span>
            </div>
            {stop.details && <p className="local-tip"><strong>Local note:</strong> {stop.details}</p>}

            <div className="stop-actions">
              <button onClick={explore}><ExternalLink size={15} /> Explore</button>
              <button onClick={startEditing}><Pencil size={15} /> Edit</button>
              <button onClick={regenerateStop} disabled={regenerating}>
                {regenerating ? <LoaderCircle className="spinner" size={15} /> : <RefreshCw size={15} />}
                {regenerating ? "Replacing" : "Replace"}
              </button>
              <button className="danger-action" onClick={onRemove}><Trash2 size={15} /> Remove</button>
            </div>

            {error && <div className="inline-error">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
