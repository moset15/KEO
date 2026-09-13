import records from "../../data/events/seed.json";
import { evidence } from "./repository";
import { EventSchema, type Event } from "./schemas";

export const events: Event[] = records.map((record) =>
  EventSchema.parse(record),
);

for (const event of events) {
  if (
    event.evidenceIds.some((id) => !evidence.some((item) => item.id === id))
  ) {
    throw new Error(`Unknown map evidence reference in ${event.id}`);
  }
  if (!event.isDemo) {
    throw new Error(
      "The launch map seed must contain illustrative records only",
    );
  }
}

// Display names match the boundary file, except the documented Tharaka alias.
export const countyNames = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;

export function eventsForCounty(county: string): Event[] {
  return county
    ? events.filter((event) => event.location.county === county)
    : events;
}

export function boundaryCountyName(displayName: string): string {
  return displayName === "Tharaka-Nithi" ? "Tharaka" : displayName;
}
