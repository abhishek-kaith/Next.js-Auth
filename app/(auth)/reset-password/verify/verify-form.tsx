'use client';

import InputOtp from '@/components/otp-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { resetPasswordVerifyAction } from '@/server/auth/auth.actions';
import { LoaderCircle } from 'lucide-react';
import { useActionState } from 'react';

export default function OtpForm() {
    const [state, formAction, isPending] = useActionState(resetPasswordVerifyAction, {
        defaultValues: {
            otp: '',
        },
    });

    return (
        <form className="flex flex-col items-center gap-3" action={formAction}>
            <div className="flex flex-col items-center gap-3">
                <Label htmlFor="otp">Verification Code</Label>
                <InputOtp
                    defaultvalueinput={state?.defaultValues?.otp}
                    name="otp"
                    placeholder="Verification Code"
                />
                {state?.fieldError?.otp && (
                    <p className="text-sm text-destructive">{state.fieldError.otp}</p>
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
                Submit
            </Button>

            {state?.message && (
                <p
                    className={`text-center text-sm ${state?.status === 'error' ? 'text-destructive' : 'text-foreground'}`}
                >
                    {state.message}
                </p>
            )}
        </form>
    );
}
