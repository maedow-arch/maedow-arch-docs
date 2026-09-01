// app peut tout importer : aucune violation ici.
import { Ecran } from "@/features/panier/Ecran";
import { formater } from "@/lib/format";
export default function Page() {
  return (
    <div>
      {formater(1)}
      {Ecran()}
    </div>
  );
}
