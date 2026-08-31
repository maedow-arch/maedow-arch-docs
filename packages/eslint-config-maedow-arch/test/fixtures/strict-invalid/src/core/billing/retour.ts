// MA-007 : un cycle, moitié retour. Ni l'un ni l'autre ne franchit de
// frontière de couche : le cycle se forme à l'intérieur de core/.
import { aller } from "./aller";
export const retour = () => aller;
