"use client";

/* COMPONENTS */
import KanbanIcon from "@/components/kanban-icon";
import BoardsList from "@/components/navigation/boards-list";
import ThemeSwitch from "@/components/navigation/theme-switch";

/* STORE */
import { useNavigationStore } from "@/store/navigation.store";

/* ICONS */
import IconEye from "@/public/icon-eye.svg";
import IconHide from "@/public/icon-hide.svg";

/* UTILITIES */
import { cn } from "@/lib/utils";

const SideNav = () => {
	const setOpenSidebar = useNavigationStore((state) => state.setOpenSidebar);
	const is_sidebar_open = useNavigationStore((state) => state.is_sidebar_open);

	return (
		<nav
			className={cn(
				"bg-foreground w-[260] flex-col z-[100] border-r-lines pb-[32] fixed left-0 h-full duration-500 lg:w-[300] hidden md:flex",
				{
					["left-[-260] lg:left-[-300]"]: !is_sidebar_open
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
				className="flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-medium-grey !text-h-md hover:bg-primary/10 hover:text-primary mr-[24] cursor-pointer dark:hover:bg-white"
				onClick={() => setOpenSidebar(false)}
			>
				<IconHide />
				Hide Sidebar
			</button>

			<button
				type="button"
				className={cn(
					"w-[56] h-[46] bg-primary text-white rounded-r-full absolute bottom-[32] items-center justify-center right-0 translate-x-full cursor-pointer flex opacity-100 transition-opacity duration-200 delay-500 z-[99] hover:bg-primary-foreground",
					{
						["opacity-0 delay-0"]: is_sidebar_open
					}
				)}
				onClick={() => setOpenSidebar(true)}
			>
				<IconEye />
			</button>
		</nav>
	);
};

export default SideNav;
