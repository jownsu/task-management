"use client";

/* NEXT */
import Link from "next/link";

/* COMPONENTS */
import ThemeSwitch from "@/components/side-nav/theme-switch";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from "@/components/ui/sheet";

/* PLUGINS */
import { useMediaQuery } from "react-responsive";

/* ICONS */
import IconBoardLink from "@/public/icon-board-link.svg";
import { FaChevronDown, FaPlus } from "react-icons/fa";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* CONSTANTS */
import { BREAKPOINTS } from "@/constants";

const BOARD_LINKS = [
	{
		id: 1,
		name: "Platform Launch"
	},
	{
		id: 2,
		name: "Marketing Plan"
	},
	{
		id: 3,
		name: "Roadmap"
	}
];

const BoardsDropdown = () => {
	const is_mobile = useMediaQuery({ maxWidth: BREAKPOINTS.mobile });

	if (!is_mobile) {
		return null;
	}

	return (
		<Sheet>
			<SheetTrigger className="flex items-center gap-[4] group cursor-pointer">
				<h1 className="text-lg">Platform Launch</h1>
				<FaChevronDown className="text-primary size-[12] group-data-[state=open]:-rotate-180 duration-200" />
			</SheetTrigger>
			<SheetContent side="top" className="pt-[80] px-[65]">
				<div className="bg-foreground w-full mx-auto rounded-lg">
					<SheetHeader className="px-[24]">
						<SheetTitle className="text-medium-grey uppercase t-[12] tracking-[2.4]">
							All Boards ({BOARD_LINKS.length})
						</SheetTitle>
					</SheetHeader>
					<div className="flex flex-col pr-[24]">
						{BOARD_LINKS.map((board) => (
							<Link
								key={board.id}
								href="/"
								className={cn(
									"flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-medium-grey text-md",
									{
										["bg-primary text-white"]: board.id === 1,
										["hover:bg-primary/10 hover:text-primary"]:
											board.id !== 1
									}
								)}
							>
								<IconBoardLink /> {board.name}
							</Link>
						))}

						<button
							type="button"
							className="flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-primary text-md hover:bg-primary/10 hover:text-primary cursor-pointer"
						>
							<IconBoardLink />{" "}
							<span className="flex items-center gap-[4]">
								<FaPlus className="size-[10]" /> Create New board
							</span>
						</button>
					</div>
					<SheetFooter>
						<ThemeSwitch />
					</SheetFooter>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default BoardsDropdown;
