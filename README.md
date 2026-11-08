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

Pagine demo:

- `/` — crea l'evento
- `/evento/demo` — partecipanti, esclusioni ed estrazione
- `/r/demo-nonna` — la busta da aprire con l'abbinamento
- `/anteprima/email` — anteprima delle email d'invito

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

SvelteKit 3 · Svelte 5 · TypeScript · Drizzle + Postgres · Resend · Vercel.
