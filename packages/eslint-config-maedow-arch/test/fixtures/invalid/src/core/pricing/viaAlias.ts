// MA-001 par l'alias de chemin. Les fixtures n'employaient que des imports
// relatifs : rien ne garantissait que @/ soit intercepté.
import { BillingScreen } from "@/features/billing/Screen";
export const prix = () => BillingScreen();
