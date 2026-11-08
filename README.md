# 🎁 Secret Santa

Lo scambio di regali di Natale, senza bigliettini. Crea l'evento, aggiungi la famiglia, invia gli inviti via email:
ognuno scopre in segreto a chi fare il regalo e può scrivere la propria lista dei desideri.

Chi non ha un indirizzo email (es. la nonna) può ricevere l'invito sulla mail di un altro partecipante,
in una mail separata e con un link tutto suo.

## Avvio rapido

Richiede Node 22+ e npm 11+.

```sh
npm install
cp .env.example .env
npm run dev
```

In locale non serve nessun account: senza `DATABASE_URL` viene usato un Postgres interno (PGlite) e,
senza `RESEND_API_KEY`, le email (con i link) vengono stampate nel terminale.
L'anteprima grafica delle email è su `/anteprima/email`.

## Messa online (Vercel + Neon + Resend)

1. Crea un progetto su [Neon](https://neon.tech) e copia la connection string.
2. Applica le migrazioni: `DATABASE_URL="..." npm run db:migrate`.
3. Su [Resend](https://resend.com) verifica il dominio da cui spedire e crea una API key.
4. Importa la repo su Vercel e imposta `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM` (e se vuoi `APP_URL`).

## Script

| Comando           | Cosa fa                   |
| ----------------- | ------------------------- |
| `npm run dev`     | server di sviluppo        |
| `npm run check`   | controllo tipi            |
| `npm run lint`    | Prettier + ESLint         |
| `npm test`        | test unitari (Vitest)     |
| `npm run build`   | build per Vercel          |
| `npm run db:push` | applica lo schema Drizzle |

## Stack

SvelteKit 3 · Svelte 5 · TypeScript · Drizzle + Neon · Resend · Vercel.
