/*
 * Le cas que shadcn produit : `components.json` déclare "hooks": "@/hooks",
 * et tout composant embarquant un hook le dépose ici.
 *
 * Ce dossier n'est aucune des cinq couches. Le fichier échappe donc à l'audit
 * et aux frontières à la fois, et rien n'empêche cet import de remonter le flux.
 */
import { total } from "@/features/panier/Ecran";

export const useMobile = () => total;
