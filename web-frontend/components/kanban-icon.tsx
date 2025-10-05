import MainIcon from "@/public/icon-kanban.svg";

const KanbanIcon = () => {
	return (
		<div className="flex items-center gap-[14]">
			<MainIcon />
			<span className="!text-h-xl">Kanban</span>
		</div>
	);
};

export default KanbanIcon;
