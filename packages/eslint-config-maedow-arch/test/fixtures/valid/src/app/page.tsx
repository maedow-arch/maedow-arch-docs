import { CheckoutScreen } from "../features/checkout/Screen";
import { BillingScreen } from "../features/billing/Screen";
import { createBilling } from "../core/billing/service";
export const Page = () => [CheckoutScreen(), BillingScreen(), createBilling(1)];
