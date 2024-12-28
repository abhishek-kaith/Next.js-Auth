'use client';

import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/server/auth/auth.actions';
import { LoaderCircle } from 'lucide-react';
import { useActionState } from 'react';

export default function SigninForm() {
    const [state, formAction, isPending] = useActionState(loginAction, {
        defaultValues: {
            email: '',
            password: '',
        },
    });

    return (
        <form className="flex flex-col gap-3" action={formAction}>
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

            <Button disabled={isPending} type="submit" className="w-full">
                {isPending && (
                    <LoaderCircle
                        className="-ms-1 me-2 animate-spin"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                )}
                Login
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
