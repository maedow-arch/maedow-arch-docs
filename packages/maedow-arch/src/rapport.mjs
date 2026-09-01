import { ORDRE } from "./audit.mjs";

/**
 * La mise en forme du rapport.
 *
 * Le parti pris tient en une phrase : un projet qui découvre deux cents
 * violations doit voir un chemin, pas un verdict. L'ordre suit ce qui débloque
 * le reste, chaque section dit ce que la correction rend possible, et le total
 * n'apparaît qu'à la fin, une fois que le lecteur sait par où commencer.
 */

const APERCU = 5;

export function enTexte(resultat, { seuil }) {
  const l = [];
  const total = compter(resultat.violations);

  l.push("");
  l.push(`  Maedow Arch · audit de ${resultat.racine}`);
  l.push(`  ${resultat.fichiers} fichiers lus, ${resultat.classes} dans une couche du standard`);

  const hors = (resultat.horsCouche ?? []).length;
  if (hors > 0) {
    // Un renseignement, pas un reproche : l'audit ne dit rien de ces fichiers
    // parce qu'ils ne relèvent pas du standard, et non parce qu'ils seraient
    // conformes.
    l.push(`  ${hors} hors des couches, non examinés (scripts, configuration, actifs)`);
  }
  l.push("");

  if (resultat.classes === 0) {
    l.push("  Aucun fichier ne se trouve dans app/, features/, core/, components/ ou lib/.");
    l.push("  Le projet n'a pas encore l'arborescence du standard : les règles de");
    l.push("  frontière ne peuvent rien dire de lui. Commencez par lire");
    l.push("  « Structure recommandée » dans architecture.md.");
    l.push("");
    return l.join("\n");
  }

  if (total === 0) {
    const sansCouches = ["features", "core"].filter((c) => !(resultat.couches ?? []).includes(c));
    if (sansCouches.length > 0) {
      l.push(`  Aucune violation, mais ce projet n'a pas de ${sansCouches.join(" ni de ")}.`);
      l.push("  Les règles de frontière n'ont rien pu vérifier : leur silence ne dit pas");
      l.push("  qu'elles sont respectées, mais qu'il n'y avait rien à examiner.");
      l.push("");
      return l.join("\n");
    }
    l.push("  Aucune violation détectée.");
    l.push("");
    l.push("  Cet audit dénombre, il ne garantit pas : installez");
    l.push("  eslint-config-maedow-arch pour que la vérification tienne dans le temps.");
    l.push("");
    return l.join("\n");
  }

  l.push("  Par quoi commencer");
  l.push("  ──────────────────");
  l.push("");

  let rang = 0;
  for (const etape of ORDRE) {
    const trouvees = resultat.violations[etape.code] ?? [];
    if (trouvees.length === 0) continue;
    rang += 1;

    l.push(`  ${rang}. ${etape.titre}  ·  ${etape.code}  ·  ${quantifier(trouvees.length)}`);
    l.push(`     ${etape.debloque}`);
    l.push("");

    for (const violation of trouvees.slice(0, APERCU)) {
      const ou = violation.ligne ? `${violation.fichier}:${violation.ligne}` : violation.fichier;
      l.push(`       ${ou}`);
      if (violation.detail) l.push(`         ${violation.detail}`);
    }
    if (trouvees.length > APERCU) {
      l.push(`       … et ${trouvees.length - APERCU} autre(s)`);
    }
    l.push("");
  }

  l.push("  ──────────────────");
  l.push(`  ${quantifier(total)} au total.`);

  const manquantes = ["features", "core"].filter((c) => !(resultat.couches ?? []).includes(c));
  if (manquantes.length > 0) {
    l.push("");
    l.push(`  Ce projet n'a pas de ${manquantes.join(" ni de ")}. Les règles de frontière`);
    l.push("  n'ont donc rien pu vérifier : leur silence ci-dessus ne dit pas qu'elles");
    l.push("  sont respectées, mais qu'il n'y avait rien à examiner. Le découpage en");
    l.push("  couches est le premier geste, avant tout ce qui précède.");
  }

  if (seuil !== null) {
    l.push(
      total > seuil
        ? `  Au-dessus du seuil de ${seuil} : la commande échoue.`
        : `  Sous le seuil de ${seuil} : la commande réussit.`
    );
  }

  l.push("");
  l.push("  Cet audit dénombre, il ne garantit pas. Il lit les chemins d'import sans");
  l.push("  compiler le projet, ce qui lui permet de tourner ici sans rien installer,");
  l.push("  au prix de quelques cas limites. Une fois la migration faite, c'est");
  l.push("  eslint-config-maedow-arch qui tient les frontières à chaque commit.");
  l.push("");

  return l.join("\n");
}

export function enJson(resultat) {
  const parCode = {};

  for (const etape of ORDRE) {
    const trouvees = resultat.violations[etape.code] ?? [];
    parCode[etape.code] = {
      titre: etape.titre,
      total: trouvees.length,
      fichiers: [...new Set(trouvees.map((v) => v.fichier))],
      violations: trouvees,
    };
  }

  return JSON.stringify(
    {
      racine: resultat.racine,
      fichiersLus: resultat.fichiers,
      fichiersClasses: resultat.classes,
      tsconfigTrouve: resultat.tsconfig,
      couchesPresentes: resultat.couches ?? [],
      fichiersHorsCouches: (resultat.horsCouche ?? []).length,
      total: compter(resultat.violations),
      ordreDeMigration: ORDRE.filter((e) => (resultat.violations[e.code] ?? []).length > 0).map(
        (e) => e.code
      ),
      parCode,
    },
    null,
    2
  );
}

export function compter(violations) {
  return Object.values(violations).reduce((total, liste) => total + liste.length, 0);
}

function quantifier(n) {
  return n === 1 ? "1 violation" : `${n} violations`;
}
