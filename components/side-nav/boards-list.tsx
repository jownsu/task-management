import Link from "next/link";

/* ICONS */
import IconBoardLink from "@/public/icon-board-link.svg";
import { FaPlus } from "react-icons/fa";

/* UTILITIES */
import { cn } from "@/lib/utils";

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

const BoardsList = () => {
	return (
		<div>
			<h2 className="text-medium-grey uppercase t-[12] tracking-[2.4] px-[24] py-[16] font-bold">
				All Boards ({BOARD_LINKS.length})
			</h2>
			<div className="flex flex-col pr-[24]">
				{BOARD_LINKS.map((board) => (
					<Link
						key={board.id}
						href="/"
						className={cn(
							"flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-medium-grey text-md",
							{
								["bg-primary text-white"]: board.id === 1,
								["hover:bg-primary/10 hover:text-primary"]: board.id !== 1
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
		</div>
	);
};

export default BoardsList;
