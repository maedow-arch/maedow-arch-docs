// MA-004 : une dépendance d'interface dans core/. Le domaine doit se tester
// sans monter d'arbre React.
import { useState } from "react";
export const useTheme = () => useState("clair");
