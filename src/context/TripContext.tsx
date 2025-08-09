import React, { createContext, useContext, useMemo, useState } from "react";

export type TripStatus = "not_started" | "in_progress";

export interface Visit {
  time: string;
  locationName: string;
}

export interface TripHistoryItem {
  date: string;
  distanceKm: number;
  amount: number;
}

interface TripContextType {
  status: TripStatus;
  dealersVisitedToday: number;
  visits: Visit[];
  totalDistanceToday: number;
  startJourney: () => void;
  punchDealer: () => void;
  endJourney: () => void;
  history: TripHistoryItem[];
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<TripStatus>("not_started");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [history, setHistory] = useState<TripHistoryItem[]>([
    { date: "2025-08-01", distanceKm: 24.6, amount: 492 },
    { date: "2025-08-02", distanceKm: 31.2, amount: 624 },
    { date: "2025-08-03", distanceKm: 18.4, amount: 368 },
    { date: "2025-08-04", distanceKm: 42.1, amount: 842 },
    { date: "2025-08-05", distanceKm: 27.9, amount: 558 },
  ]);

  const dealersVisitedToday = visits.length;
  const totalDistanceToday = parseFloat((dealersVisitedToday * 4.8).toFixed(1));

  const startJourney = () => setStatus("in_progress");

  const punchDealer = () => {
    const now = new Date();
    setVisits((v) => [
      ...v,
      { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), locationName: `Dealer ${v.length + 1}` },
    ]);
  };

  const endJourney = () => {
    if (status === "in_progress") {
      const today = new Date().toISOString().slice(0, 10);
      const amount = Math.round(totalDistanceToday * 20); // placeholder rate
      setHistory((h) => [{ date: today, distanceKm: totalDistanceToday, amount }, ...h].slice(0, 10));
      setStatus("not_started");
      setVisits([]);
    }
  };

  const value = useMemo(
    () => ({ status, dealersVisitedToday, visits, totalDistanceToday, startJourney, punchDealer, endJourney, history }),
    [status, dealersVisitedToday, visits, totalDistanceToday, history]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
};
