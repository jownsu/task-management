"use client";

/* NEXT */
import Link from "next/link";

/* PLUGINS */
import { signOut, useSession } from "next-auth/react";
import { ClassNameValue } from "tailwind-merge";

/* COMPONENTS */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/* ICONS */
import { LuLogOut, LuUser } from "react-icons/lu";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	className?: ClassNameValue;
}

/**
 * DOCU: This component renders a user profile button that displays the user's avatar, name, and email. <br>
 * When clicked, it shows a popover with a logout button. <br>
 * Triggered: Rendered in the SideNav and mobile BoardsDropdown components. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
const UserProfile = ({ className }: Props) => {
	const { data: session } = useSession();
	const user = session?.user;

	/**
	 * DOCU: This function extracts initials from a user's name. <br>
	 * Triggered: When the user has no avatar image. <br>
	 * Last Updated: March 25, 2026
	 * @author Jhones
	 */
	const getInitials = (name: string) => {
		const words = name.trim().split(/\s+/);
		return words
			.slice(0, 2)
			.map((word) => word[0].toUpperCase())
			.join("");
	};

	if (!user) return null;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button type="button" className={cn("flex cursor-pointer items-center gap-[12] rounded-lg px-[12] py-[8] transition-colors hover:bg-primary/10 dark:hover:bg-white/5", className)}>
					<Avatar className="size-[36] shrink-0">
						{user.image && <AvatarImage src={user.image} alt={user.name || "User avatar"} />}
						<AvatarFallback className="bg-primary text-white !text-b-md font-bold">{getInitials(user.name || "U")}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col items-start overflow-hidden">
						<span className="!text-b-md max-w-full truncate font-medium">{user.name}</span>
						{user.email && <span className="!text-b-sm max-w-full truncate text-medium-grey">{user.email}</span>}
					</div>
				</button>
			</PopoverTrigger>
			<PopoverContent side="top" align="start" sideOffset={8} className="pointer-events-auto z-[200] w-(--radix-popover-trigger-width) min-w-[160] p-[4] bg-foreground border border-lines shadow-lg">
				<Link
					href="/profile"
					className="!text-b-md flex w-full items-center gap-[8] rounded-md px-[12] py-[8] transition-colors hover:bg-primary/10 dark:hover:bg-white/5"
				>
					<LuUser size={16} />
					Profile
				</Link>
				<div className="my-[4] border-b border-lines" />
				<button
					type="button"
					className="!text-b-md flex w-full cursor-pointer items-center gap-[8] rounded-md px-[12] py-[8] text-destructive transition-colors hover:bg-destructive/10"
					onClick={() => signOut({ redirectTo: "/login" })}
				>
					<LuLogOut size={16} />
					Logout
				</button>
			</PopoverContent>
		</Popover>
	);
};

export default UserProfile;
