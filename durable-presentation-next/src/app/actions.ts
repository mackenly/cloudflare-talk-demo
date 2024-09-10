'use server';

import { signIn } from '@/app/auth';

export async function resendSignInEmail(email: string) {
    'use server';
    await signIn('resend', { email: email, redirectTo: '/' }).catch((e) => {
        console.error('Failed to sign in with email', e);
        throw e;
    });
}