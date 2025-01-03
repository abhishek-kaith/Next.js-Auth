import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import constants from '@/lib/constants';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { getSession } from '@/server/auth/auth.session';
import paths from '@/lib/paths';
import Link from 'next/link';
import { UserDropdown } from '@/components/user-dropdown';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: constants.SITE_NAME,
    description: constants.SITE_DESCRIPTION,
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = await getSession();
    return (
        <html lang="en">
            <AuthProvider user={user}>
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    <header className="flex gap-3">
                        {Object.entries(paths).map(([name, path]) => (
                            <Link key={path} href={path}>
                                {name.toUpperCase()}
                            </Link>
                        ))}
                        {user && <UserDropdown user={user} />}
                    </header>
                    {children}
                </body>
            </AuthProvider>
        </html>
    );
}
