import { useCheckout } from "./hooks/useCheckout";
import { Card } from "../_shared/Card";
import { Button } from "../../components/ui/Button";
export const CheckoutScreen = () => [useCheckout(), Card(1), Button(2)];
