// MA-002 par un import de type seul. Une frontière qui ne verrait que les
// imports de valeurs laisserait passer le couplage de typage.
import type { BillingView } from "../billing/types";
export type Panier = { facture: BillingView };
