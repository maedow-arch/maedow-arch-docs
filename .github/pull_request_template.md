> Cette PR vise `develop`. Seule une PR ouverte depuis `develop` peut viser `main`,
> et la vérification automatique le refuse autrement.

## Ce que change cette PR

<!-- En une phrase : quel problème réel est résolu. -->

## Vérification

<!-- Ce que vous avez lancé, et ce que ça a donné. -->

- [ ] `npm run test:boundaries` passe
- [ ] `npm run format:check` passe
- [ ] `npm --prefix site run build` passe
- [ ] Si les règles de frontières changent : un **test négatif** prouve qu'une violation échoue toujours

## Si le corpus change

- [ ] La modification est faite dans les `.md` de la racine, jamais dans `site/content/docs/*.mdx` (générés)
- [ ] Une entrée a été ajoutée au `CHANGELOG.md`
