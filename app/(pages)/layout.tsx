/* COMPONENTS */
import Navbar from "@/components/navigation/navbar";
import SideNav from "@/components/navigation/side-nav";
import MainContainer from "@/components/main-container";
import CreateBoardmodal from "@/components/board/create-board-modal";
import DeleteBoardmodal from "@/components/board/delete-board-modal";
import EditBoardmodal from "@/components/board/edit-board-modal";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

/* QUERIES */
import { prefetchBoard } from "@/hooks/queries/board.query";

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const prefetched_boards = await prefetchBoard();

	return (
		<HydrationBoundary state={prefetched_boards}>
			<Navbar />
			<div className="flex h-full flex-1">
				<SideNav />
				<MainContainer>{children}</MainContainer>
			</div>

			{/* MODALS */}
			<CreateBoardmodal />
			<DeleteBoardmodal />
			<EditBoardmodal />
		</HydrationBoundary>
	);
}
