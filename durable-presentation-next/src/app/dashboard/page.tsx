import { auth } from '../auth';
import { redirect } from 'next/navigation';
import { UserNav } from '@/components/user/user-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export const runtime = 'edge';

const mockPresentations = [
	{ id: 1, title: 'Cloudflare Tour', slides: 15, lastEdited: '2023-06-15' },
	{ id: 2, title: 'Product Launch Strategy', slides: 22, lastEdited: '2023-06-10' },
	{ id: 3, title: 'Team Building Workshop', slides: 8, lastEdited: '2023-06-05' },
	{ id: 4, title: 'Annual Company Overview', slides: 30, lastEdited: '2023-05-28' },
];

export default async function Home() {
	const session = await auth();

    if (!session || !session.user) {
        return redirect('/login');
    }

	return (
		<main>
			<div className="container mx-auto py-10">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">Your Presentations</h1>
					<div className="flex gap-4">
						<Button asChild>
							<Link href="/presentations/new">
								<PlusCircle className="mr-2 h-4 w-4" />
								New Presentation
							</Link>
						</Button>
                        <UserNav session={session} />
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{mockPresentations.map((presentation) => (
						<Card key={presentation.id}>
							<CardHeader>
								<CardTitle>{presentation.title}</CardTitle>
								<CardDescription>{presentation.slides} slides</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Last edited: {new Date(presentation.lastEdited).toLocaleDateString()}
								</p>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button variant="outline" asChild>
									<Link href={`/presentations/${presentation.id}`}>View</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link href={`/presentations/${presentation.id}/control`}>Control</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</main>
	);
}