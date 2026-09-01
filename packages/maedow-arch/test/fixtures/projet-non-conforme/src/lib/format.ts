// MA-001 : lib remonte vers core.
import { calculer } from "@/core/facturation/service";
export const formater = (n: number) => String(calculer(n));
