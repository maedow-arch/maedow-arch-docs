import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Le passage du profil Light au profil Full.
 *
 * En Light, la couche domaine n'existe pas : le corpus dit que Light ne peuple
 * pas `core/`, il ne l'autorise pas différemment. Générer un domaine sur un tel
 * projet n'est donc pas une erreur à refuser, c'est le geste qui fait naître la
 * couche. La commande porte la bascule au lieu de buter dessus.
 *
 * Embarquer `result.ts` d'avance dans le template Light aurait contredit le
 * corpus, en peuplant `core/` sur un profil qui le laisse vide. Le créer au
 * moment où un domaine apparaît respecte les deux : Light reste sans domaine
 * tant qu'il n'en a pas, et le premier domaine amène ce dont il dépend.
 */

/*
 * Ce contenu doit rester identique à `templates/mode-full/src/core/common/result.ts`.
 * Un projet basculé et un projet créé en Full ne peuvent pas avoir deux
 * Result Pattern différents : le test unitaire de la CLI compare les deux.
 */
const RESULT = `export type Result<TData, TError = string> =
  { ok: true; data: TData } | { ok: false; error: TError };

export function unwrapOr<TData, TError>(result: Result<TData, TError>, fallback: TData): TData {
  return result.ok ? result.data : fallback;
}

export function mapResult<TData, TMapped, TError>(
  result: Result<TData, TError>,
  fn: (data: TData) => TMapped
): Result<TMapped, TError> {
  return result.ok ? { ok: true, data: fn(result.data) } : result;
}

export function match<TData, TError, TReturn>(
  result: Result<TData, TError>,
  handlers: { ok: (data: TData) => TReturn; err: (error: TError) => TReturn }
): TReturn {
  return result.ok ? handlers.ok(result.data) : handlers.err(result.error);
}
`;

/**
 * Crée la couche domaine si elle manque.
 *
 * @returns `true` si le projet vient de basculer, `false` s'il était déjà en Full.
 */
export function assurerLaCoucheDomaine() {
  const commun = join("src", "core", "common");
  const result = join(commun, "result.ts");

  if (existsSync(result)) return false;

  mkdirSync(commun, { recursive: true });
  writeFileSync(result, RESULT);
  return true;
}

/** Exporté pour que le test unitaire compare ce contenu à celui du template Full. */
export const CONTENU_RESULT = RESULT;
