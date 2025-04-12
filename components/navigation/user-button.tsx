"use client";

/* NEXT */
import Link from "next/link";

/* PLUGINS */
import { CircleUserRound, LogOut, Moon, Sun } from "lucide-react";
import { User } from "next-auth";
import { useTheme } from "next-themes";

/* COMPONENTS */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

/* ACTIONS */
import { signOut } from "next-auth/react";

/* HELPERS */
import { cn } from "@/lib/utils";

interface Props {
	user?: User;
}

const UserButton = ({ user }: Props) => {
	const { theme, setTheme } = useTheme();

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex cursor-pointer">
				<Avatar>
					{user.image && <AvatarImage src={user.image} />}
					<AvatarFallback className="bg-primary text-white">
						{user.name?.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="p-4" align="end">
				<div className="mb-4 p-4 flex flex-col items-center bg-primary/15 rounded-lg gap-1">
					<Avatar>
						{user.image && <AvatarImage src={user.image} />}
						<AvatarFallback className="bg-primary text-white">
							{user.name?.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<p className="font-bold text-xs">{user.name}</p>
					<p className="font-medium text-xs text-secondary-foreground">
						{user.email}
					</p>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					asChild
					className="py-2 font-medium cursor-pointer transition-all duration-200 group"
				>
					<Link href={"/profile"}>
						<CircleUserRound className="mr-1 group-hover:translate-x-1 transition-all duration-200 ease-in-out" />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem className={"py-2 font-medium cursor-pointer group"}>
					{theme === "dark" && (
						<Moon
							className="mr-1 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200 ease-in-out"
							size={14}
						/>
					)}
					{theme === "light" && (
						<Sun
							className="mr-1 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-200 ease-in-out"
							size={14}
						/>
					)}
					<div
						className={cn(
							"first-letter:uppercase transition-all duration-200 ease-in-out",
							{
								["group-hover:text-blue-400"]: theme === "dark",
								["group-hover:text-yellow-600"]: theme === "light"
							}
						)}
					>
						{theme} mode
					</div>
					<Switch
						onClick={(e) => e.stopPropagation()}
						className="scale-80 cursor-pointer"
						checked={theme === "dark"}
						onCheckedChange={(value) => {
							setTheme(value ? "dark" : "light");
						}}
					/>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="py-2 font-medium cursor-pointer transition-all duration-200 group hover:!bg-destructive/30"
					onClick={() => signOut()}
				>
					<LogOut
						className="mr-1 group-hover:translate-x-1 transition-all duration-300 ease-in-out"
						size={14}
					/>{" "}
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserButton;
