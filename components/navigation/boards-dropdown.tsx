"use client";

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
import { useMediaQuery } from "react-responsive";

/* ICONS */
import { FaChevronDown } from "react-icons/fa";

/* CONSTANTS */
import { BREAKPOINTS } from "@/constants";

const BoardsDropdown = () => {
	const is_mobile = useMediaQuery({ maxWidth: BREAKPOINTS.mobile });

	if (!is_mobile) {
		return null;
	}

	return (
		<Sheet>
			<SheetTrigger className="flex items-center gap-[4] group cursor-pointer">
				<h1 className="text-h-lg">Platform Launch</h1>
				<FaChevronDown className="text-primary size-[12] group-data-[state=open]:-rotate-180 duration-200" />
			</SheetTrigger>
			<SheetContent side="top" className="pt-[80] px-[65]">
				<div className="bg-foreground w-full mx-auto rounded-lg">
					<VisuallyHidden>
						<SheetTitle>Boards List</SheetTitle>
					</VisuallyHidden>
					<BoardsList />
					<SheetFooter>
						<ThemeSwitch />
					</SheetFooter>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default BoardsDropdown;
