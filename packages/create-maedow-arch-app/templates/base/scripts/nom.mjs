/**
 * Transformation d'un nom de dossier en identifiant TypeScript.
 *
 * `user-profile` doit donner `UserProfile`. Poser une majuscule sur la seule
 * première lettre laisse le tiret au milieu et produit `User-profileScreen`,
 * qui n'est pas un identifiant valide : le fichier généré ne compile pas.
 *
 * Le défaut a survécu parce que la vérification automatique n'employait que des
 * noms d'un seul mot. C'est le mode de défaillance que ce dépôt documente sous
 * le nom de pourrissement silencieux : une chose qui n'est jamais exercée finit
 * par ne plus fonctionner sans que rien ne le signale.
 */

/** Ce qui sépare deux mots dans un nom de dossier. */
const SEPARATEURS = /[-_.]+/;

/** Ce que npm accepte dans un nom, et donc ce que les générateurs acceptent. */
const NOM_ACCEPTE = /^[a-z0-9][a-z0-9._-]*$/;

/** Ce que TypeScript accepte comme identifiant. */
const IDENTIFIANT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function versPascal(nom) {
  return nom
    .split(SEPARATEURS)
    .filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join("");
}

/**
 * Refuse un nom qui ne donnerait pas de code compilable, avant d'écrire quoi
 * que ce soit sur le disque. Un générateur qui échoue à mi-parcours laisse un
 * dossier à moitié rempli, et c'est plus pénible qu'un refus net.
 */
export function verifierNom(nom, commande) {
  if (!NOM_ACCEPTE.test(nom)) {
    console.error(
      `« ${nom} » n'est pas un nom valide.\n` +
        "   Minuscules, chiffres, tirets, points et underscores, en commençant par une lettre ou un chiffre.\n" +
        `   Exemple : npm run ${commande} user-profile`
    );
    process.exit(1);
  }

  const pascal = versPascal(nom);

  if (!IDENTIFIANT.test(pascal)) {
    console.error(
      `« ${nom} » ne donne pas d'identifiant TypeScript exploitable (${pascal || "vide"}).\n` +
        "   Commencez par une lettre, et séparez les mots par des tirets.\n" +
        `   Exemple : npm run ${commande} user-profile`
    );
    process.exit(1);
  }

  return pascal;
}
