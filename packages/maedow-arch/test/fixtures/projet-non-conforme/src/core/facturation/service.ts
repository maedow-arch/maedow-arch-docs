// MA-001 : core remonte vers features.
import { Ecran } from "@/features/panier/Ecran";
// MA-005 : un any explicite.
export function calculer(entree: any) {
  return Ecran() ?? entree;
}
// MA-006 : une double assertion.
export const forcer = (v: string) => v as unknown as number;
