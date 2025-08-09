import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { calculateExpenseAmount } from "@/lib/expenseCalculator";
import { useAuth } from "./AuthContext";
import { 
  startDistanceTracking, 
  stopDistanceTracking, 
  getTrackingStatus, 
  addDealerVisit 
} from "@/lib/gpsTracking";

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
  const { user } = useAuth();
  const [status, setStatus] = useState<TripStatus>("not_started");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [history, setHistory] = useState<TripHistoryItem[]>([]);
  const [currentDistance, setCurrentDistance] = useState<number>(0);

  // Update distance from GPS tracking
  useEffect(() => {
    if (status === "in_progress") {
      const interval = setInterval(() => {
        const trackingStatus = getTrackingStatus();
        setCurrentDistance(trackingStatus.currentDistance / 1000); // Convert to km
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const dealersVisitedToday = visits.length;
  const totalDistanceToday = currentDistance;

  const startJourney = async () => {
    const result = await startDistanceTracking();
    if (result.success) {
      setStatus("in_progress");
    } else {
      console.error('Failed to start GPS tracking:', result.error);
      // Still allow manual mode
      setStatus("in_progress");
    }
  };

  const punchDealer = async () => {
    const dealerNumber = visits.length + 1;
    const dealerName = `Dealer ${dealerNumber}`;
    
    const result = await addDealerVisit(dealerName);
    if (result.success) {
      const now = new Date();
      setVisits((v) => [
        ...v,
        { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), locationName: dealerName },
      ]);
    } else {
      console.error('Failed to add dealer visit:', result.error);
      // Fallback to manual entry
      const now = new Date();
      setVisits((v) => [
        ...v,
        { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), locationName: dealerName },
      ]);
    }
  };

  const endJourney = async () => {
    if (status === "in_progress") {
      // Stop GPS tracking and get final distance
      const trackingResult = stopDistanceTracking();
      const finalDistance = trackingResult.totalDistance / 1000; // Convert to km
      
      const today = new Date().toISOString().slice(0, 10);
      const userPosition = user?.position || 'Sales Executive';
      
      try {
        const amount = await calculateExpenseAmount(finalDistance, userPosition);
        
        setHistory((h) => [{ date: today, distanceKm: finalDistance, amount }, ...h].slice(0, 10));
      } catch (error) {
        console.error('Error calculating expense amount:', error);
        // Fallback calculation
        const fallbackAmount = Math.round((finalDistance * 12) + 500); // Basic fallback
        setHistory((h) => [{ date: today, distanceKm: finalDistance, amount: fallbackAmount }, ...h].slice(0, 10));
      }
      
      setStatus("not_started");
      setVisits([]);
      setCurrentDistance(0);
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
