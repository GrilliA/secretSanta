import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({
	EMAIL_FROM: 'Secret Santa <onboarding@resend.dev>',
	GMAIL_USER: undefined,
	GMAIL_APP_PASSWORD: undefined,
	RESEND_API_KEY: undefined
}));

describe('senderName', () => {
	it('prende il nome dal mittente configurato', async () => {
		const { senderName } = await import('./send.ts');
		expect(senderName()).toBe('Secret Santa');
	});
});
