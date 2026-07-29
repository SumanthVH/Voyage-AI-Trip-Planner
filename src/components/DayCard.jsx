import { useState } from "react";
import StopCard from "./StopCard";

export default function DayCard({
  day,
  dayIndex,
  destination,
  trip,
  setTrip,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const TRAVEL_BUFFER_MINUTES = 30;

  const parseDurationToMinutes = (duration) => {
    if (!duration || typeof duration !== "string") return 0;
    const normalized = duration.toLowerCase().trim();
    const minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*minute/);
    if (minuteMatch) {
      return Math.round(Number(minuteMatch[1]));
    }

    const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*hour/);
    if (hourMatch) {
      return Math.round(Number(hourMatch[1]) * 60);
    }

    const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
    return numberMatch ? Math.round(Number(numberMatch[1]) * 60) : 0;
  };

  const parseTimeToMinutes = (time) => {
    if (!time || typeof time !== "string") return null;
    const match = time.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (!match) return null;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === "AM") {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }
    return hour * 60 + minute;
  };

  const formatMinutesToTime = (minutes) => {
    const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hour24 = Math.floor(normalized / 60);
    const minute = normalized % 60;
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const paddedHour = String(hour12).padStart(2, "0");
    const paddedMinute = String(minute).padStart(2, "0");
    return `${paddedHour}:${paddedMinute} ${period}`;
  };

  const reorder = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setTrip((current) => {
      const days = current.days.map((item, index) => {
        if (index !== dayIndex) return item;

        const stops = [...item.stops];
        const targetStop = stops[targetIndex];
        const [moved] = stops.splice(draggedIndex, 1);
        stops.splice(targetIndex, 0, moved);

        const updatedStops = stops.map((stop) => {
          if (stop === moved) {
            return { ...stop, time: targetStop.time };
          }

          if (stop === targetStop) {
            return { ...stop, time: moved.time };
          }

          return stop;
        });

        return { ...item, stops: updatedStops };
      });
      return { ...current, days };
    });

    setDraggedIndex(null);
  };

  const updateStop = (stopIndex, nextStop) => {
    setTrip((current) => ({
      ...current,
      days: current.days.map((item, index) =>
        index !== dayIndex
          ? item
          : {
              ...item,
              stops: item.stops.map((stop, index2) =>
                index2 === stopIndex ? nextStop : stop
              ),
            }
      ),
    }));
  };

  const removeStop = (stopIndex) => {
    setTrip((current) => ({
      ...current,
      days: current.days.map((item, index) =>
        index !== dayIndex
          ? item
          : { ...item, stops: item.stops.filter((_, index2) => index2 !== stopIndex) }
      ),
    }));
  };

  return (
    <article className="day-card">
      <div className="day-heading">
        <div className="day-number">DAY {String(day.day).padStart(2, "0")}</div>
        <div>
          <h3>{day.title}</h3>
          <p>{day.stops.length} experiences · Drag to reorder</p>
        </div>
      </div>

      <div className="stops">
        {day.stops.map((stop, stopIndex) => (
          <StopCard
            key={stop.id || `${dayIndex}-${stopIndex}`}
            stop={stop}
            destination={destination}
            dayTitle={day.title}
            onUpdate={(nextStop) => updateStop(stopIndex, nextStop)}
            onRemove={() => removeStop(stopIndex)}
            draggable
            onDragStart={() => setDraggedIndex(stopIndex)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => reorder(stopIndex)}
            isDragging={draggedIndex === stopIndex}
          />
        ))}
      </div>
    </article>
  );
}
