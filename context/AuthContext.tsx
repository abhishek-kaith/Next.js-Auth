'use client';

import { UserAuthType } from '@/server/auth/auth.session';
import React, { createContext, useContext } from 'react';

export type AuthContextType = {
    user: UserAuthType | null;
    isAuthenticated: boolean;
    setSession: (user: UserAuthType | null) => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    setSession: () => { },
});

export function useSession() {
    return useContext(AuthContext);
}

export function AuthProvider({
    children,
    user,
}: {
    children: React.ReactNode;
    user: UserAuthType | null;
}) {
    const [session, setSession] = React.useState<UserAuthType | null>(user);
    const isAuthenticated = session !== null;

    return (
        <AuthContext.Provider
            value={{
                user: session,
                isAuthenticated: isAuthenticated,
                setSession: (user: UserAuthType | null) => {
                    setSession(user);
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
