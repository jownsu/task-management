/* COMPONENTS */
import CreateBoardmodal from "@/components/board/create-board-modal";
import SideNav from "@/components/navigation/side-nav";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

/* QUERIES */
import { prefetchAllBoards } from "@/hooks/queries/all_boards.query";

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const prefetched_boards = await prefetchAllBoards();

	return (
		<HydrationBoundary state={prefetched_boards}>
			<div className="flex h-full flex-1">
				<SideNav />
				{children}
			</div>

			{/* MODALS */}
			<CreateBoardmodal />
		</HydrationBoundary>
	);
}
