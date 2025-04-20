/* NEXT */
import type { Metadata } from "next";

/* COMPONENTS */
import Navbar from "@/components/navigation/navbar";
import SideNav from "@/components/navigation/side-nav";
import MainContainer from "@/components/main-container";
import CreateBoardmodal from "@/components/board/create-board-modal";
import DeleteBoardmodal from "@/components/board/delete-board-modal";
import EditBoardmodal from "@/components/board/edit-board-modal";

export const metadata: Metadata = {
	title: "Nextjs with drizzle template",
	description: "Nextjs with drizzle template"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Navbar />
			<div className="flex h-full flex-1">
				<SideNav />
				<MainContainer>{children}</MainContainer>
			</div>

			{/* MODALS */}
			<CreateBoardmodal />
			<DeleteBoardmodal />
			<EditBoardmodal />
		</>
	);
}
