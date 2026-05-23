import FlowBoardSVG from "@/public/icon-kanban.svg";

const FlowBoardIcon = () => {
	return (
		<div className="flex items-center gap-[14]">
			<FlowBoardSVG />
			<span className="!text-h-xl">FlowBoard</span>
		</div>
	);
};

export default FlowBoardIcon;
