import 'server-only';
import { sessionTable, SessionType, userTable, UserType } from '@/db/schema/auth.sql';
import { encodeHexLowerCase, encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import constants from '@/lib/constants';
import db from '@/db';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { env } from '@/lib/env';

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

export async function createSession(token: string, userId: string): Promise<SessionType> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const [session] = await db
        .insert(sessionTable)
        .values({
            id: sessionId,
            userId,
            expiresAt: new Date(Date.now() + constants.SESSION_TOKEN_EXPIRY),
        })
        .returning();
    return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const result = await db
        .select({ user: userTable, session: sessionTable })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
        .where(eq(sessionTable.id, sessionId));
    if (result.length < 1) {
        return { session: null, user: null };
    }
    const { user, session } = result[0];
    const authUser: UserAuthType = {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
    if (Date.now() >= session.expiresAt.getTime()) {
        await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
        return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - constants.SESSION_TOKEN_RENEWAL_INTERVAL) {
        session.expiresAt = new Date(Date.now() + constants.SESSION_TOKEN_EXPIRY);
        await db
            .update(sessionTable)
            .set({
                expiresAt: session.expiresAt,
            })
            .where(eq(sessionTable.id, session.id));
    }
    return { session, user: authUser };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export const getSession = cache(async (): Promise<SessionValidationResult> => {
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    const cookie = await cookies();
    const token = cookie.get(constants.SESSION_COOKIE_NAME)?.value ?? null;
    if (token === null) {
        return { session: null, user: null };
    }
    const result = validateSessionToken(token);
    return result;
});

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
    const cookie = await cookies();
    cookie.set(constants.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        path: '/',
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
    });
}

export async function deleteSessionTokenCookie(): Promise<void> {
    const cookie = await cookies();
    cookie.set(constants.SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
    });
}

export type UserAuthType = Pick<
    UserType,
    'id' | 'name' | 'email' | 'emailVerifiedAt' | 'createdAt' | 'updatedAt'
>;
export type SessionValidationResult =
    | { session: SessionType; user: UserAuthType }
    | { session: null; user: null };

export type DashboardSessionValidationResult = { session: SessionType; user: UserType };
