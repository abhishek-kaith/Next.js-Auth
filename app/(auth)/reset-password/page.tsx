import { GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import ResetPasswordForm from './reset-password-form';
import paths from '@/lib/paths';
import constants from '@/lib/constants';

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={'flex flex-col gap-6'}>
                    <div>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <Link
                                    href={paths.home}
                                    className="flex flex-col items-center gap-2 font-medium"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md">
                                        <GalleryVerticalEnd className="size-6" />
                                    </div>
                                    <span className="sr-only">{constants.SITE_NAME}</span>
                                </Link>
                                <h1 className="text-xl font-bold">Reset Password</h1>
                            </div>
                            <ResetPasswordForm />
                        </div>
                    </div>
                    <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                        By clicking continue, you agree to our{' '}
                        <Link href={paths.termsOfService}>Terms of Service</Link> and{' '}
                        <Link href={paths.privacyPolicy}>Privacy Policy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}
