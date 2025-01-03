import 'server-only';
import { hash, verify } from '@node-rs/argon2';
import { encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';

export async function hashInput(password: string): Promise<string> {
    return await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });
}

export async function verifyHash(hash: string, password: string): Promise<boolean> {
    return await verify(hash, password);
}

export function generateRandomOTP(): string {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const code = encodeBase32UpperCaseNoPadding(bytes);
    return code;
}

export function generateRandomRecoveryCode(): string {
    const recoveryCodeBytes = new Uint8Array(10);
    crypto.getRandomValues(recoveryCodeBytes);
    const recoveryCode = encodeBase32UpperCaseNoPadding(recoveryCodeBytes);
    return recoveryCode;
}
