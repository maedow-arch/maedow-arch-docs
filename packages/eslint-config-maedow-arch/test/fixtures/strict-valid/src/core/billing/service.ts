// Aucun cycle : le service descend vers les types, jamais l'inverse.
import type { Facture } from "./types";
export const total = (f: Facture) => f.total;
