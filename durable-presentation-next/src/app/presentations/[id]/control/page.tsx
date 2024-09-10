import { auth } from '@/app/auth';

import { Controller } from '@/components/screen/control';

export const runtime = 'edge';

export default async function Viewer({ params }: { params: { id: string } }) {
	const session = await auth();

	const { id } = params;
	return (
		<main>
			<h1>Controller {id}</h1>
			<Controller id={id} username={session?.user?.name} />
		</main>
	);
}
