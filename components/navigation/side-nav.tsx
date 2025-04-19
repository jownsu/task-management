"use client";

/* COMPONENTS */
import KanbanIcon from "@/components/kanban-icon";
import BoardsList from "@/components/navigation/boards-list";
import ThemeSwitch from "@/components/navigation/theme-switch";

/* STORE */
import { useNavigationStore } from "@/store/navigation.store";

/* ICONS */
import IconHide from "@/public/icon-hide.svg";

/* UTILITIES */
import { cn } from "@/lib/utils";

const SideNav = () => {
	const setOpenSidebar = useNavigationStore((state) => state.setOpenSidebar);
	const is_sidebar_open = useNavigationStore((state) => state.is_sidebar_open);

	return (
		<nav
			className={cn(
				"bg-foreground w-[260] flex flex-col z-[100] border-r-lines pb-[32] fixed left-0 h-full duration-500",
				{
					["left-[-260]"]: !is_sidebar_open
				}
			)}
		>
			<div className="h-[81] flex px-[24] mb-[7]">
				<KanbanIcon />
			</div>
			<BoardsList />
			<ThemeSwitch className="mt-auto mx-[24] mb-[8]" />

			<button
				type="button"
				className="flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-medium-grey text-md hover:bg-primary/10 hover:text-primary mr-[24]"
				onClick={() => setOpenSidebar(false)}
			>
				<IconHide />
				Hide Sidebar
			</button>
		</nav>
	);
};

export default SideNav;
