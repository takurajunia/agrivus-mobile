import type { FarmOSTrackerEntry } from "../types";

export type HarvestUrgency = "overdue" | "dueSoon" | "onTrack" | "harvested";

const DUE_SOON_THRESHOLD_DAYS = 30;

export const getHarvestUrgency = (
  daysUntilHarvest: number | null,
  status: string,
): HarvestUrgency => {
  if (status === "harvested") return "harvested";
  if (daysUntilHarvest === null) return "onTrack";
  if (daysUntilHarvest < 0) return "overdue";
  if (daysUntilHarvest <= DUE_SOON_THRESHOLD_DAYS) return "dueSoon";
  return "onTrack";
};

export const formatHarvestDate = (value?: string | null): string => {
  if (!value) return "No date set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatHarvestCountdown = (
  daysUntilHarvest: number | null,
  status: string,
): string => {
  if (status === "harvested") return "Harvested";
  if (daysUntilHarvest === null) return "";
  if (daysUntilHarvest === 0) return "Due today";
  if (daysUntilHarvest > 0) return `${daysUntilHarvest} days left`;
  return `${Math.abs(daysUntilHarvest)} days overdue`;
};

export const splitTrackerEntriesByUrgency = (entries: FarmOSTrackerEntry[]) => {
  const overdue: FarmOSTrackerEntry[] = [];
  const dueSoon: FarmOSTrackerEntry[] = [];
  for (const entry of entries) {
    const urgency = getHarvestUrgency(entry.days_until_harvest, entry.status);
    if (urgency === "overdue") overdue.push(entry);
    else if (urgency === "dueSoon") dueSoon.push(entry);
  }
  return { overdue, dueSoon };
};
