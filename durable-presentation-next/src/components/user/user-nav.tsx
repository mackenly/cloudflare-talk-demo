'use server';

import { signOut } from '@/app/auth';
import { revalidatePath } from 'next/cache';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export async function UserNav({
    session,
}: Readonly<any>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-10 w-10 rounded-full">
					<Avatar className="h-10 w-10">
						{session.user.image ? <AvatarImage src={session.user.image} alt={session.user.name || 'Anon'} /> : <></>}
						<AvatarFallback>
							{session.user.name ? session.user.name[0].toUpperCase() : 'A'}
							{session.user.name ? session.user.name[1].toUpperCase() : 'N'}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{session.user.name || 'Anonymous'}</p>
						<p className="text-xs leading-none text-muted-foreground">{session.user.email || 'No email found'}</p>
					</div>
				</DropdownMenuLabel>
				{/*<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem>
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem>
						Settings
					</DropdownMenuItem>
					<DropdownMenuItem>New Team</DropdownMenuItem>
				</DropdownMenuGroup>*/}
				<DropdownMenuSeparator />
				<form
					action={async (formData) => {
						'use server';
						await signOut().then(() => {
							revalidatePath('/');
						});
					}}
				>
					<DropdownMenuItem>
                        <Button variant="ghost" type="submit">
                            Sign Out
                        </Button>
                    </DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
