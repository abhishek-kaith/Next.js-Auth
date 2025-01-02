'use server';

import { createActionHandler } from '@/lib/action';
import paths from '@/lib/paths';
import {
    loginFormInput,
    resetPasswordFormInput,
    resetPasswordVerifyFormInput,
    signupFormInput,
    verifyEmailFormInput,
} from '@/server/auth/auth.input';
import { redirect } from 'next/navigation';
import {
    createAndSetCookieForEmailOtp,
    createUser,
    loginService,
    logoutService,
    requestPasswordReset,
    verifyEmailOtp,
    verifyPasswordResetOtp,
} from './auth.services';
import {
    createSession,
    generateSessionToken,
    getSession,
    setSessionTokenCookie,
} from './auth.session';

export const signupAction = createActionHandler(signupFormInput, async (input) => {
    const user = await createUser(input);
    if (!user) {
        return {
            defaultValues: input,
            message: 'User already exists with this email',
            status: 'error',
        };
    }
    const otp = await createAndSetCookieForEmailOtp(user);
    const token = generateSessionToken();
    const session = await createSession(token, user.id);
    await setSessionTokenCookie(token, session.expiresAt);
    console.log({
        email: user.email,
        otp,
    });
    redirect(paths.verifyEmail);
});

export const verifyEmailAction = createActionHandler(verifyEmailFormInput, async (input) => {
    const otp = await verifyEmailOtp(input.otp);
    if (!otp) {
        return {
            defaultValues: input,
            message: 'Invalid OTP',
            status: 'error',
        };
    }
    redirect(paths.firstTimeLogin);
});

export const loginAction = createActionHandler(loginFormInput, async (input) => {
    const result = await loginService(input);
    if (result.status === 'success') {
        redirect(paths.dashboard);
    }
    return result;
});

export const resetPasswordAction = createActionHandler(resetPasswordFormInput, async (input) => {
    const result = await requestPasswordReset(input);
    if (result.status === "success") {
        throw redirect(paths.resetPasswordVerify)
    }
    return result;
});

export const resetPasswordVerifyAction = createActionHandler(
    resetPasswordVerifyFormInput,
    async (input) => {
        const result = await verifyPasswordResetOtp(input);
        if (result.status === "success") {
            redirect(paths.dashboard)
        }
        return result;
    },
);

export const logoutAction = createActionHandler(null, async () => {
    await logoutService();
    redirect(paths.home);
});

export const getDashboardSession = async () => {
    const { user, session } = await getSession();
    if (!user || !session) {
        redirect(paths.signin);
    }
    if (!user.emailVerifiedAt) {
        redirect(paths.verifyEmail);
    }
    return { user, session };
};
