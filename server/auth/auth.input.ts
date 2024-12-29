import { z } from 'zod';

export const loginFormInput = z.object({
    email: z
        .string({
            required_error: 'Email is required.',
        })
        .email({
            message: 'Invalid email address.',
        })
        .min(3, 'Invalid email address.'),
    password: z
        .string({
            required_error: 'Password is required.',
        })
        .min(8, 'Password must be at least 8 characters long.'),
});

export const signupFormInput = z
    .object({
        name: z
            .string({
                required_error: 'Name is required.',
            })
            .min(3, 'Name must be at least 3 characters long.'),
        email: z
            .string({
                required_error: 'Email is required.',
            })
            .email({
                message: 'Invalid email address.',
            })
            .min(3, 'Invalid email address.'),
        password: z
            .string({
                required_error: 'Password is required.',
            })
            .min(8, 'Password must be at least 8 characters long.')
            .regex(/[0-9]/, 'Password must contain one number.')
            .regex(/[a-z]/, 'Password must contain one lowercase letter.')
            .regex(/[A-Z]/, 'Password must contain one uppercase letter.'),
        confirmPassword: z
            .string({
                required_error: 'Confirm password is required.',
            })
            .min(8, 'Password must be at least 8 characters long.'),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passwords do not match.',
                path: ['confirmPassword'],
            });
        }
    });

export const verifyEmailFormInput = z.object({
    otp: z
        .string({
            required_error: 'Verification code is required.',
        })
        .min(8, 'Verification code must be at least 8 characters long.'),
});

export const resetPasswordFormInput = z.object({
    email: z
        .string({
            required_error: 'Email is required.',
        })
        .email('Invalid email address.'),
});

export const resetPasswordVerifyFormInput = z.object({
    password: z
        .string({
            required_error: 'Password is required.',
        })
        .min(8, 'Password must be at least 8 characters long.')
        .regex(/[0-9]/, 'Password must contain one number.')
        .regex(/[a-z]/, 'Password must contain one lowercase letter.')
        .regex(/[A-Z]/, 'Password must contain one uppercase letter.'),

    otp: z
        .string({
            required_error: 'Verification code is required.',
        })
        .min(8, 'Verification code must be at least 8 characters long.'),
});

export type LoginFormType = z.infer<typeof loginFormInput>;
export type SignupFormType = z.infer<typeof signupFormInput>;
export type VerifyEmailFormType = z.infer<typeof verifyEmailFormInput>;
export type ResetPasswordFormType = z.infer<typeof resetPasswordFormInput>;
export type ResetPasswordVerifyFormType = z.infer<typeof resetPasswordVerifyFormInput>;
