"use client";

/* NEXT */
import dynamic from "next/dynamic";

/* COMPONENTS */
const BoardsDropdown = dynamic(() => import("@/components/navigation/boards-dropdown"), {
	ssr: false
});

/* ICONS */
import IconKanbanOnly from "@/public/icon-kanban.svg";

const NavMobile = () => {
	return (
		<div className="flex items-center gap-[16] md:hidden">
			<IconKanbanOnly />
			<BoardsDropdown />
		</div>
	);
};

export default NavMobile;
