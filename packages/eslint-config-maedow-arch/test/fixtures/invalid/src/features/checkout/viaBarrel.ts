// MA-002 au travers d'un barrel. Le chemin ne nomme plus le fichier importé,
// et une règle qui s'y fierait ne verrait rien.
import { BillingScreen } from "../billing";
export const payer = () => BillingScreen();
