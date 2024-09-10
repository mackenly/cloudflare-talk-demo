import { auth } from './auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export default async function Home() {
	const session = await auth();

	if (session) {
		revalidatePath('/dashboard');
		return redirect('/dashboard');
	} else {
		return redirect('/login');
	}
}
