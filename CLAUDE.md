# Secret Santa — istruzioni per Claude Code

Web app per organizzare lo scambio di regali di Natale: l'organizzatore crea l'evento,
aggiunge i partecipanti, l'app estrae gli abbinamenti e invia a ognuno un link segreto via email.

## Stack

- **SvelteKit 3** + **Svelte 5 (runes)** + TypeScript strict. Nessun framework CSS: design tokens in `src/app.css`.
- **Drizzle ORM** su Postgres (`src/lib/server/db/schema.ts`), email via **Resend** (`src/lib/server/email/`).
- Deploy su **Vercel** (`@sveltejs/adapter-vercel`). Test con **Vitest**.
- Richiede Node ≥ 22 e **npm ≥ 11** (npm 10 fallisce l'install con `edgesOut` error).

## Comandi

```sh
npm run dev        # sviluppo
npm run check      # svelte-check (tipi)
npm run lint       # prettier + eslint
npm test           # vitest
npm run build      # build Vercel
npm run db:push    # applica lo schema al DB (richiede DATABASE_URL)
```

Prima di ogni commit: `npm run format && npm run check && npm run lint && npm test`.

## Convenzioni SvelteKit 3 (diverse da SvelteKit 2!)

- Alias `#lib/...` (package imports) al posto di `$lib`. Per i moduli TS **serve l'estensione**: `import { draw } from '#lib/draw.ts'`.
- Variabili d'ambiente dichiarate in `src/env.ts` con `defineEnvVars`, importate da `$app/env/private` / `$app/env/public`.
- Config Kit dentro `vite.config.ts` (plugin `sveltekit({...})`), non c'è `svelte.config.js`.
- Link interni con `resolve()` da `$app/paths`.
- Stato locale inizializzato da `data`: usare `untrack(() => ...)` per evitare `state_referenced_locally`.

## Regole di dominio (non violarle)

- **Segretezza**: nessuno, nemmeno l'organizzatore, vede gli abbinamenti altrui. Una pagina mostra solo
  l'abbinamento del token richiesto. Mai esporre `assignment` in API/admin.
- **Email condivise**: l'email NON è unica. Un partecipante senza email ha `managedById` → riceve la mail il gestore,
  ma con un invito **separato**, un token proprio e oggetto "Il Secret Santa di {nome}" (`#lib/invites.ts`).
- **Estrazione** (`#lib/draw.ts`): niente auto-assegnazioni, esclusioni bidirezionali, errore esplicito se impossibile.
  L'estrazione va eseguita **sul server**.
- Token dei link: `createToken()` (`#lib/server/token.ts`), mai id sequenziali.

## Design

Fonte: canvas "Secret Santa – Design". Palette in `app.css` (pine, holly, gold, cream), titoli Fraunces, testo Inter.
Decorazioni in `src/lib/components/` (Baubles, Hills, Snowflake, Envelope). Neve: classe `.snow`.
Accessibilità: target ≥ 44px, contrasto AA, `prefers-reduced-motion` rispettato, controlli nativi con label.

## Stato attuale

L'interfaccia gira su dati demo (`#lib/demo.ts`). Pagine: `/`, `/evento/demo`, `/r/demo-nonna`, `/anteprima/email`.
I `TODO` nel codice segnano dove collegare DB e invio email reali.
