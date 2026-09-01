import { describe, it, expect } from "vitest";
import { all, andThen, mapResult, match, unwrapOr, type Result } from "./result";

/**
 * Ces tests s'exécutent sans DOM, sans mock et sans monter d'arbre React.
 * C'est la propriété que la couche `core/` doit conserver, et le seul moyen
 * de s'en assurer est d'écrire les tests qui en dépendent.
 */

const succes = <T>(data: T): Result<T> => ({ ok: true, data });
const echec = (error: string): Result<never> => ({ ok: false, error });

describe("unwrapOr", () => {
  it("rend la donnée en cas de succès", () => {
    expect(unwrapOr(succes(42), 0)).toBe(42);
  });

  it("rend la valeur de repli en cas d'échec", () => {
    expect(unwrapOr(echec("introuvable"), 0)).toBe(0);
  });
});

describe("mapResult", () => {
  it("transforme la donnée et laisse le succès intact", () => {
    expect(mapResult(succes(2), (n) => n * 3)).toEqual({ ok: true, data: 6 });
  });

  it("propage l'erreur sans appeler la transformation", () => {
    let appele = false;
    const resultat = mapResult(echec("refusé"), () => {
      appele = true;
      return 1;
    });

    expect(resultat).toEqual({ ok: false, error: "refusé" });
    expect(appele).toBe(false);
  });
});

describe("match", () => {
  it("emprunte la branche correspondant au résultat", () => {
    expect(match(succes("a"), { ok: (d) => `ok:${d}`, err: (e) => `err:${e}` })).toBe("ok:a");
    expect(match(echec("b"), { ok: (d) => `ok:${d}`, err: (e) => `err:${e}` })).toBe("err:b");
  });
});

describe("andThen", () => {
  it("enchaîne trois opérations faillibles sans imbrication", async () => {
    const trouver = (id: string) => Promise.resolve(succes({ id, total: 100 }));
    const autoriser = (c: { id: string; total: number }) =>
      c.total > 0 ? succes({ ...c, autorise: true }) : echec("montant nul");
    const encaisser = (c: { id: string }) => Promise.resolve(succes(`paiement-${c.id}`));

    const resultat = await andThen(andThen(trouver("cmd-1"), autoriser), encaisser);

    expect(resultat).toEqual({ ok: true, data: "paiement-cmd-1" });
  });

  it("court-circuite à la première erreur, sans exécuter la suite", async () => {
    let atteint = false;
    const resultat = await andThen(echec("panier vide"), () => {
      atteint = true;
      return succes("jamais");
    });

    expect(resultat).toEqual({ ok: false, error: "panier vide" });
    expect(atteint).toBe(false);
  });

  it("accepte indifféremment une valeur ou une promesse", async () => {
    await expect(andThen(succes(1), (n) => succes(n + 1))).resolves.toEqual({ ok: true, data: 2 });
    await expect(
      andThen(Promise.resolve(succes(1)), (n) => Promise.resolve(succes(n + 1)))
    ).resolves.toEqual({ ok: true, data: 2 });
  });
});

describe("all", () => {
  it("agrège les données en conservant leur ordre", () => {
    expect(all([succes(1), succes(2), succes(3)])).toEqual({ ok: true, data: [1, 2, 3] });
  });

  it("rend la première erreur rencontrée", () => {
    expect(all([succes(1), echec("second invalide"), echec("troisième invalide")])).toEqual({
      ok: false,
      error: "second invalide",
    });
  });

  it("rend une liste vide pour une entrée vide", () => {
    expect(all([])).toEqual({ ok: true, data: [] });
  });
});
