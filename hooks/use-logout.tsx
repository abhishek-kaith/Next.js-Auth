import { logoutAction } from '@/server/auth/auth.actions';
import { useActionState } from 'react';

function useLogout() {
    const [state, action, isPending] = useActionState(logoutAction, {});
    return { state, action, isPending };
}

export default useLogout;
