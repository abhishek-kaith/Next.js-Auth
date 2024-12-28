'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordAction } from '@/server/auth/auth.actions';
import { LoaderCircle } from 'lucide-react';
import { useActionState } from 'react';

export default function ResetPasswordForm() {
    const [state, formAction, isPending] = useActionState(resetPasswordAction, {
        defaultValues: {
            email: '',
        },
    });

    return (
        <form className="flex flex-col items-center gap-3" action={formAction}>
            <div className="flex w-full flex-col items-center gap-1">
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

            <Button disabled={isPending} type="submit" className="w-fit">
                {isPending && (
                    <LoaderCircle
                        className="-ms-1 me-2 animate-spin"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                )}
                Reset Password
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
