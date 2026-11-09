/** "2026-12-25" → "25 dicembre". Restituisce null per date assenti o non valide. */
export function formatDay(isoDate: string | null | undefined, intlLocale = 'it-IT') {
	if (!isoDate) return null;
	const d = new Date(`${isoDate}T12:00:00Z`);
	if (Number.isNaN(d.getTime())) return null;
	return new Intl.DateTimeFormat(intlLocale, {
		day: 'numeric',
		month: 'long',
		timeZone: 'UTC'
	}).format(d);
}
