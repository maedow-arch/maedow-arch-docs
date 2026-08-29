import { ok, type Result } from "../common/result";
import { formatPrice } from "../../lib/utils";
export const createBilling = (n: number): Result<string> => ok(formatPrice(n));
