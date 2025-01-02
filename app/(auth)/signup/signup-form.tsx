'use client';

import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signupAction } from '@/server/auth/auth.actions';
import { LoaderCircle } from 'lucide-react';
import { useActionState } from 'react';

export default function SignupForm() {
    const [state, formAction, isPending] = useActionState(signupAction, {
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    return (
        <form className="flex flex-col gap-3" action={formAction}>
            <div className="flex flex-col gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    name="name"
                    required
                    defaultValue={state?.defaultValues?.name}
                />
                {state?.fieldError?.name && (
                    <p className="text-sm text-destructive">{state.fieldError.name}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    name="email"
                    required
                    defaultValue={state?.defaultValues?.email}
                />
                {state?.fieldError?.email && (
                    <p className="text-sm text-destructive">{state.fieldError.email}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                    name="password"
                    placeholder="Password"
                    defaultValue={state?.defaultValues?.password}
                />
                {state?.fieldError?.password && (
                    <p className="text-sm text-destructive">{state.fieldError.password}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                    hidestats={'true'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    defaultValue={state?.defaultValues?.confirmPassword}
                />
                {state?.fieldError?.confirmPassword && (
                    <p className="text-sm text-destructive">{state.fieldError.confirmPassword}</p>
                )}
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
                {isPending && (
                    <LoaderCircle
                        className="-ms-1 me-2 animate-spin"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                )}
                Sign Up
            </Button>

            {state?.message && (
                <p
                    className={`text-sm ${state?.status === 'error' ? 'text-destructive' : 'text-foreground'}`}
                >
                    {state.message}
                </p>
            )}
        </form>
    );
}
