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
    requestPasswordReset,
    verifyEmailOtp,
    verifyPasswordResetOtp,
} from './auth.services';
import { createSession, generateSessionToken, setSessionTokenCookie } from './auth.session';

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
    return {
        defaultValues: input,
        message: 'Successfully signed up! Please check your email for the verification code.',
        status: 'success',
    };
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
    return {
        defaultValues: input,
        message: 'Successfully verified email!',
        status: 'success',
    };
});

export const loginAction = createActionHandler(loginFormInput, async (input) => {
    const result = await loginService(input);
    return result;
});

export const resetPasswordAction = createActionHandler(resetPasswordFormInput, async (input) => {
    const result = await requestPasswordReset(input);
    return result;
});

export const resetPasswordVerifyAction = createActionHandler(
    resetPasswordVerifyFormInput,
    async (input) => {
        const result = await verifyPasswordResetOtp(input);
        return result;
    },
);
