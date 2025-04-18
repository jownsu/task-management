/* COMPONENTS */
import KanbanIcon from "@/components/kanban-icon";
import BoardsList from "@/components/navigation/boards-list";
import ThemeSwitch from "@/components/navigation/theme-switch";

/* ICONS */
import IconHide from "@/public/icon-hide.svg";

const SideNav = () => {
	return (
		<div className="bg-foreground w-[260] flex flex-col z-[100] border-r-lines pb-[32]">
			<div className="h-[81] flex px-[24] mb-[7]">
				<KanbanIcon />
			</div>
			<BoardsList />
			<ThemeSwitch className="mt-auto mx-[24] mb-[8]" />
			<button
				type="button"
				className="flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-medium-grey text-md hover:bg-primary/10 hover:text-primary mr-[24]"
			>
				<IconHide />
				Hide Sidebar
			</button>
		</div>
	);
};

export default SideNav;
