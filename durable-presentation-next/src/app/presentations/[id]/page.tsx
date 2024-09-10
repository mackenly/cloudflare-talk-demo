import { auth } from '@/app/auth';

import { ScreenView } from '@/components/screen/screen';

export const runtime = 'edge';

export default async function Viewer({ params}: { params: { id: string } }) {
    const session = await auth();

    const { id } = params;
    return (
        <main>
            <ScreenView id={id} username={session?.user?.name} />
        </main>
    )
}