"use client";

/* NEXT */
import Link from "next/link";
import { useParams } from "next/navigation";

/* COMPONENTS */
import CreateBoardButton from "@/components/board/create-board-button";

/* ICONS */
import IconBoardLink from "@/public/icon-board-link.svg";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* QUERIES */
import { useGetAllBoards } from "@/hooks/queries/board.query";

const BoardsList = () => {

	const { boards } = useGetAllBoards();
	const { board_id } = useParams();

	return (
		<div>
			<h2 className="text-medium-grey uppercase t-[12] tracking-[2.4] px-[24] py-[16] font-bold">
				All Boards ({boards?.length})
			</h2>
			<div className="flex flex-col pr-[24]">
				{boards?.map((board) => (
					<Link
						key={board.id}
						href={`/${board.id}`}
						className={cn(
							"flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-medium-grey !text-h-md",
							{
								["bg-primary text-white"]: board.id === board_id,
								["hover:bg-primary/10 hover:text-primary dark:hover:bg-white"]: board.id !== board_id
							}
						)}
					>
						<IconBoardLink /> {board.title}
					</Link>
				))}

				<CreateBoardButton />
			</div>
		</div>
	);
};

export default BoardsList;
