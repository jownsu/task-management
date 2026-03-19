"use client";

/* PLUGINS */
import { signOut, useSession } from "next-auth/react";

/* COMPONENTS */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/* ICONS */
import { LuLogOut } from "react-icons/lu";

/**
 * DOCU: This component renders a profile avatar dropdown with logout functionality. <br>
 * Shows the user's avatar image or their initials as a fallback. <br>
 * Triggered: Rendered in the Navbar component. <br>
 * Last Updated: March 19, 2026
 * @author Jhones
 */
const ProfileDropdown = () => {
	const { data: session } = useSession();
	const user = session?.user;

	/**
	 * DOCU: This function extracts initials from a user's name. <br>
	 * Triggered: When the user has no avatar image. <br>
	 * Last Updated: March 19, 2026
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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="cursor-pointer rounded-full outline-none">
					<Avatar className="size-[36]">
						{user.image && <AvatarImage src={user.image} alt={user.name || "User avatar"} />}
						<AvatarFallback className="bg-primary text-white !text-b-md font-bold">{getInitials(user.name || "U")}</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={12} className="min-w-[160]">
				<DropdownMenuLabel className="flex flex-col gap-[2] font-normal">
					<span className="font-medium">{user.name}</span>
					{user.email && <span className="text-medium-grey !text-b-sm">{user.email}</span>}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={() => signOut({ redirectTo: "/login" })}>
					<LuLogOut size={16} />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
