import { User } from "../models/User.js";
import { distanceKm } from "./distance.js";

/**
 * Pick the nearest online rider in the same society to the delivery coordinates.
 */
export async function assignNearestRider(societyName, deliveryLat, deliveryLng) {
  const riders = await User.find({
    role: "rider",
    societyName,
    isOnline: true,
  }).lean();

  if (!riders.length) return null;

  let best = null;
  let bestDist = Infinity;
  for (const r of riders) {
    const lat = r.location?.lat ?? 0;
    const lng = r.location?.lng ?? 0;
    const d = distanceKm(deliveryLat, deliveryLng, lat, lng);
    if (d < bestDist) {
      bestDist = d;
      best = r;
    }
  }
  return best ? { rider: best, distanceKm: bestDist } : null;
}
