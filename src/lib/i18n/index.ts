import { es } from './es.ts';
import { it, type Messages } from './it.ts';

export type Locale = 'it' | 'es';
export type { Messages };

export const LOCALES: Locale[] = ['it', 'es'];
export const DEFAULT_LOCALE: Locale = 'it';

const dictionaries: Record<Locale, Messages> = { it, es };

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

export function toLocale(value: unknown): Locale {
	return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Dizionario per la lingua indicata (italiano se sconosciuta). */
export function getT(locale: unknown): Messages {
	return dictionaries[toLocale(locale)];
}

/** Lingua preferita dal browser tra quelle supportate (header Accept-Language). */
export function fromAcceptLanguage(header: string | null): Locale {
	for (const part of (header ?? '').split(',')) {
		const code = part.trim().slice(0, 2).toLowerCase();
		if (isLocale(code)) return code;
	}
	return DEFAULT_LOCALE;
}
