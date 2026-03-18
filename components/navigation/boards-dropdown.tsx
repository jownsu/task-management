"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import BoardsList from "@/components/navigation/boards-list";
import ThemeSwitch from "@/components/navigation/theme-switch";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetTitle,
	SheetTrigger
} from "@/components/ui/sheet";

/* PLUGINS */
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { signOut } from "next-auth/react";
import { useMediaQuery } from "react-responsive";

/* ICONS */
import { FaChevronDown } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* CONSTANTS */
import { BREAKPOINTS } from "@/constants";

const BoardsDropdown = () => {
	const is_mobile = useMediaQuery({ maxWidth: BREAKPOINTS.mobile });
	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetBoard(board_id);

	if (!is_mobile) {
		return null;
	}

	return (
		<Sheet>
			<SheetTrigger className="flex items-center gap-[4] group cursor-pointer">
				<h1 className="text-h-lg">{board?.name || "Select Board"}</h1>
				<FaChevronDown className="text-primary size-[12] group-data-[state=open]:-rotate-180 duration-200" />
			</SheetTrigger>
			<SheetContent side="top" className="pt-[80] px-[65]">
				<div className="bg-foreground w-full mx-auto rounded-lg">
					<VisuallyHidden>
						<SheetTitle>Boards List</SheetTitle>
					</VisuallyHidden>
					<BoardsList />
						<button
							type="button"
							className="flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-medium-grey !text-h-md hover:bg-destructive/10 hover:text-destructive mr-[24] cursor-pointer w-full"
							onClick={() => signOut({ redirectTo: "/login" })}
						>
							<LuLogOut size={16} />
							Logout
						</button>
					<SheetFooter className="flex-col gap-[8] px-[24] pb-[16]">

						<ThemeSwitch />
					</SheetFooter>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default BoardsDropdown;
