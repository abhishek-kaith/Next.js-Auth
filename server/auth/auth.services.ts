import "server-only"
import db from '@/db';
import {
    LoginFormType,
    ResetPasswordFormType,
    ResetPasswordVerifyFormType,
    SignupFormType,
} from './auth.input';
import { otpTable, userTable, UserType } from '@/db/schema/auth.sql';
import {
    createSession,
    deleteSessionTokenCookie,
    generateSessionToken,
    getSession,
    invalidateSession,
    invalidateUserSessions,
    setSessionTokenCookie,
} from './auth.session';
import { eq } from 'drizzle-orm';
import constants from '@/lib/constants';
import { generateRandomOTP, hashInput, verifyHash } from './auth.password';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { ActionResponse } from '@/lib/action';

export const createUser = async (data: SignupFormType) => {
    const user = await db.query.userTable.findFirst({
        where: (table, { eq }) => eq(table.email, data.email),
    });
    const passwordHash = await hashInput(data.password);
    const userData = {
        email: data.email,
        passwordHash,
        name: data.name,
    };
    if (!user) {
        const [user] = await db.insert(userTable).values(userData).returning();
        return user;
    } else {
        if (!user.emailVerifiedAt) {
            await invalidateUserSessions(user.id);
            await db.delete(otpTable).where(eq(otpTable.userId, user.id));
            const [newUser] = await db
                .update(userTable)
                .set({
                    email: data.email,
                    passwordHash: data.password,
                    name: data.name,
                })
                .returning();
            return newUser;
        }
        return null; // user already exists
    }
};

export async function createAndSetCookieForEmailOtp(user: UserType) {
    await db.delete(otpTable).where(eq(otpTable.userId, user.id));
    const otp = generateRandomOTP();
    const otpHash = await hashInput(otp);
    const [otpResult] = await db
        .insert(otpTable)
        .values({
            userId: user.id,
            otpType: 'EMAIL_VERIFICATION',
            otpHash: otpHash,
            isUsed: false,
            expiresAt: new Date(Date.now() + constants.EMAIL_VERIFICATION_CODE_EXPIRY),
        })
        .returning();
    const cookie = await cookies();
    cookie.set(constants.EMAIL_VERIFICATION_COOKIE_NAME, otpResult.id, {
        httpOnly: true,
        path: '/',
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: otpResult.expiresAt,
    });
    return otp;
}

export async function verifyEmailOtp(otp: string) {
    const cookie = await cookies();
    const otpId = cookie.get(constants.EMAIL_VERIFICATION_COOKIE_NAME)?.value ?? null;
    if (otpId === null) {
        return false;
    }
    const { user } = await getSession();
    if (!user) {
        return false;
    }
    const otpResult = await db.query.otpTable.findFirst({
        where: (table, { eq, and }) => and(eq(table.id, otpId), eq(table.userId, user.id)),
    });
    if (!otpResult) {
        return false;
    }
    if (otpResult.isUsed) {
        return false;
    }
    if (Date.now() >= otpResult.expiresAt.getTime()) {
        await db.delete(otpTable).where(eq(otpTable.id, otpResult.id));
        return false;
    }
    const isValid = await verifyHash(otpResult.otpHash, otp);
    if (isValid) {
        await db.update(otpTable).set({
            isUsed: true,
        });
        await db.update(userTable).set({
            emailVerifiedAt: new Date(),
        });
        cookie.set(constants.EMAIL_VERIFICATION_COOKIE_NAME, '', {
            httpOnly: true,
            path: '/',
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
        });
        return true;
    }
    return false;
}

export async function loginService(data: LoginFormType): Promise<ActionResponse<LoginFormType>> {
    const user = await db.query.userTable.findFirst({
        where: (table, { eq }) => eq(table.email, data.email),
    });
    if (!user) {
        return {
            defaultValues: data,
            message: 'Invalid email or password',
            status: 'error',
        };
    }
    if (!user.emailVerifiedAt) {
        return {
            defaultValues: data,
            message: 'Please verify your email before logging in.',
            status: 'error',
        };
    }
    const isValid = await verifyHash(user.passwordHash, data.password);
    if (!isValid) {
        return {
            defaultValues: data,
            message: 'Invalid email or password',
            status: 'error',
        };
    }
    const token = generateSessionToken();
    const session = await createSession(token, user.id);
    await setSessionTokenCookie(token, session.expiresAt);
    return {
        defaultValues: data,
        message: 'Successfully logged in!',
        status: 'success',
    };
}

export async function requestPasswordReset(
    data: ResetPasswordFormType,
): Promise<ActionResponse<ResetPasswordFormType>> {
    const user = await db.query.userTable.findFirst({
        where: (table, { eq }) => eq(table.email, data.email),
    });
    if (!user) {
        return {
            defaultValues: data,
            message: 'Invalid email address.',
            status: 'error',
        };
    }

    const otp = generateRandomOTP();
    console.log("Reset password Otp: ", otp)
    const otpHash = await hashInput(otp);

    const [otpResult] = await db
        .insert(otpTable)
        .values({
            userId: user.id,
            otpType: 'PASSWORD_RESET',
            otpHash,
            expiresAt: new Date(Date.now() + constants.PASSWORD_RESET_CODE_EXPIRY),
        })
        .returning();

    const cookie = await cookies();
    cookie.set(constants.PASSWORD_RESET_COOKIE_NAME, otpResult.id, {
        httpOnly: true,
        path: '/',
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: otpResult.expiresAt,
    });

    return {
        defaultValues: data,
        message:
            'Successfully requested password reset. Please check your email for the verification code.',
        status: 'success',
    };
}

export async function verifyPasswordResetOtp(
    data: ResetPasswordVerifyFormType,
): Promise<ActionResponse<ResetPasswordVerifyFormType>> {
    const cookie = await cookies();
    const otpId = cookie.get(constants.PASSWORD_RESET_COOKIE_NAME)?.value ?? null;
    if (otpId === null) {
        return {
            defaultValues: data,
            message: 'Invalid verification code.',
            status: 'error',
        };
    }
    const { otp, password } = data;

    const otpData = await db.query.otpTable.findFirst({
        where: (table, { eq, and }) => and(eq(table.id, otpId)),
    });
    if (!otpData) {
        return {
            defaultValues: data,
            message: 'Invalid verification code.',
            status: 'error',
        };
    }
    if (otpData.isUsed) {
        return {
            defaultValues: data,
            message: 'Invalid verification code.',
            status: 'error',
        }
    }
    const isValid = await verifyHash(otpData.otpHash, otp);
    if (!isValid) {
        return {
            defaultValues: data,
            message: 'Invalid verification code.',
            status: 'error',
        };
    }
    if (Date.now() >= otpData.expiresAt.getTime()) {
        await db.delete(otpTable).where(eq(otpTable.id, otpData.id));
        return {
            defaultValues: data,
            message: 'Verification code expired.',
            status: 'error',
        };
    }
    await db.update(otpTable).set({
        isUsed: true,
    });
    const user = await db.query.userTable.findFirst({
        where: (table, { eq }) => eq(table.id, otpData.userId),
    });
    if (!user) {
        return {
            defaultValues: data,
            message: 'Invalid verification code.',
            status: 'error',
        };
    }

    const hashedPassword = await hashInput(password);
    await db
        .update(userTable)
        .set({
            passwordHash: hashedPassword,
        })
        .where(eq(userTable.id, user.id));

    return {
        defaultValues: data,
        message: 'Successfully reset password!',
        status: 'success',
    };
}

export async function logoutService(): Promise<ActionResponse<null>> {
    const { user, session } = await getSession();
    if (!user || !session) {
        return {
            defaultValues: null,
            message: 'You are not logged in.',
            status: 'error',
        };
    }
    await deleteSessionTokenCookie();
    await invalidateSession(session.id);
    return {
        defaultValues: null,
        message: 'You have been logged out.',
        status: 'success',
    };
}
