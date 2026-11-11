# Secret Santa — istruzioni per Claude Code

Web app per organizzare lo scambio di regali di Natale: l'organizzatore crea l'evento,
aggiunge i partecipanti, l'app estrae gli abbinamenti e invia a ognuno un link segreto via email.

## Stack

- **SvelteKit 3** + **Svelte 5 (runes)** + TypeScript strict. Nessun framework CSS: design tokens in `src/app.css`.
- **Drizzle ORM** su **Neon** (driver `neon-http`, `src/lib/server/db/`), email via **Resend** (`src/lib/server/email/`).
- In sviluppo senza `DATABASE_URL` si usa **PGlite** su disco (`.pglite/`); nei test PGlite in memoria (`#lib/server/test-db.ts`).
- Deploy su **Vercel** (`@sveltejs/adapter-vercel`). Test con **Vitest**.
- Richiede Node ≥ 22 e **npm ≥ 11** (npm 10 fallisce l'install con `edgesOut` error).

## Comandi

```sh
npm run dev        # sviluppo
npm run check      # svelte-check (tipi)
npm run lint       # prettier + eslint
npm test           # vitest
npm run build      # build Vercel
npm run db:generate # genera una migrazione in drizzle/ dopo aver cambiato lo schema
npm run db:migrate  # applica le migrazioni al DB Neon (richiede DATABASE_URL)
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

## Architettura

- `src/lib/server/events.ts`: tutta la logica di dominio sul DB. Ogni funzione riceve `db: Db` → testabile con PGlite
  (`events.spec.ts`). Gli errori per l'utente sono `EventError`; nelle actions si usa `guard()` (`#lib/server/actions.ts`).
- Niente login: l'organizzatore gestisce l'evento da `/evento/[adminToken]`, ogni partecipante vede il suo invito da `/r/[token]`.
- Le pagine usano form actions + `use:enhance`. `getDb()` è async.
- Lo schema si cambia solo con `db:generate` (migrazioni versionate in `drizzle/`), mai `db:push` in produzione.
- `/anteprima/email` esiste solo in sviluppo.
- **Foto**: le carica l'organizzatore (form di aggiunta o clic sull'avatar). Il browser le ritaglia/riduce
  (`#lib/photo-client.ts`), il server valida i byte reali (`#lib/server/photos.ts`) e le salva in base64
  nella tabella `photo`. Servite da `/foto/[photoId]` con cache immutable: l'id cambia a ogni sostituzione.

## Video di benvenuto

- L'organizzatore carica fino a due video (MP4/WebM/MOV, max 40 MB): **computer** (orizzontale) e **telefono**
  (verticale, facoltativo). Campo `slot` = `desktop` | `mobile` → `event.videoUrl`/`videoPoster` e `videoMobileUrl`/`videoMobilePoster`.
- In `/r/[token]` il video parte **a tutto schermo** (`VideoIntro.svelte`) alla prima apertura su quel dispositivo
  (localStorage), poi lascia la pagina. Su schermi stretti/verticali usa il video per telefono se c'è.
  Pulsanti "Salta" e audio; "Rivedi il video" nella barra in alto. Niente intro con reduced-motion.
- Produzione: il browser carica **direttamente su Vercel Blob** (`@vercel/blob/client` → token da
  `/evento/[adminToken]/video`, solo percorso `video/<eventId>/`), poi `?/video` verifica con `head()` e salva l'URL.
- Sviluppo senza `BLOB_READ_WRITE_TOKEN`: `?/videoLocal` salva in `.uploads/video/`, servito da `/media/video/[name]`.
- Il poster è un fotogramma JPEG generato nel browser. I partecipanti (`PlayersGarland dark`) stanno in cima all'hero.

## Lingue (it / es)

- Dizionari in `src/lib/i18n/it.ts` (riferimento) e `es.ts` (stessa forma, controllata da TS e da `i18n.spec.ts`).
  **Ogni nuovo testo va aggiunto in entrambi**: niente stringhe italiane scritte direttamente nei componenti.
- Ogni evento ha `event.locale`: email, pagina di gestione e pagina dell'invito usano `getT(locale)`.
- Pagina iniziale ed errori: lingua dell'interfaccia da `?lang=` → cookie → Accept-Language (`hooks.server.ts`,
  `locals.locale`, `+layout.server.ts` → `uiLocale`).
- Errori di dominio: `new EventError((t) => t.errors.xxx)`; `guard(fn, () => locale)` li traduce.
- In spagnolo il gioco si chiama "Amigo Invisible".

## Flusso in due fasi

1. **Lista dei desideri**: l'organizzatore invia gli inviti "Scrivi la tua lista" (`?/inviteWishlist`, solo a chi non
   l'ha ricevuto). Ognuno scrive i desideri da `/r/[token]` e preme "La mia lista è pronta" (`?/ready`).
   Quando l'ultima lista è pronta l'organizzatore riceve UNA mail (`setWishlistReady` + `event.readyNotifiedAt`;
   aggiungere una persona azzera l'avviso).
2. **Estrazione**: l'organizzatore estrae (anche se manca qualcuno, dopo conferma) e parte la mail con la busta.
   `?/resend` rimanda l'invito della fase in corso. Le email condividono `#lib/server/email/layout.ts`.

## Pagine

- `/` crea l'evento (manda all'organizzatore il link di gestione)
- `/evento/[adminToken]` partecipanti, esclusioni, estrazione + invio, stato inviti, "Rimanda"
- `/r/[token]` busta animata, viso + nome del destinatario, desideri
- `/foto/[id]` immagine di un partecipante
