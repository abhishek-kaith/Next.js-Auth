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

export const signupAction = createActionHandler(signupFormInput, async (input) => {
    return {
        defaultValues: input,
        message: 'Successfully signed up!',
        status: 'success',
    };
});

export const verifyEmailAction = createActionHandler(verifyEmailFormInput, async (input) => {
    return {
        defaultValues: input,
        message: 'Successfully verified email!',
        status: 'success',
    };
});

export const loginAction = createActionHandler(loginFormInput, async (input) => {
    return {
        defaultValues: input,
        message: 'Successfully logged in!',
        status: 'success',
    };
});

export const resetPasswordAction = createActionHandler(resetPasswordFormInput, async (_input) => {
    redirect(paths.resetPasswordVerify);
});

export const resetPasswordVerifyAction = createActionHandler(
    resetPasswordVerifyFormInput,
    async (_input) => {
        redirect(paths.dashboard);
    },
);
