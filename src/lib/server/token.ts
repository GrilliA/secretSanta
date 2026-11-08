import { randomBytes } from 'node:crypto';

/** Token non indovinabile per i link personali (192 bit, base64url). */
export function createToken() {
	return randomBytes(24).toString('base64url');
}
