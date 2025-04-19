/* NEXT */
import Link from "next/link";

/* COMPONENTS */
import CreateBoardButton from "@/components/navigation/create-board-button";

/* ICONS */
import IconBoardLink from "@/public/icon-board-link.svg";

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
								["hover:bg-primary/10 hover:text-primary dark:hover:bg-white"]: board.id !== 1
							}
						)}
					>
						<IconBoardLink /> {board.name}
					</Link>
				))}

				<CreateBoardButton />
			</div>
		</div>
	);
};

export default BoardsList;
