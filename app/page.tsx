"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";

/* STORE */
import { useNavigationStore } from "@/store/navigation.store";

/* ACTIONS */
import { signOut } from "next-auth/react";

const HomePage = () => {
	const setOpenSidebar = useNavigationStore((state) => state.setOpenSidebar);

	return (
		<div className="container">
			<p>Home Page</p>
			<Button
				variant="destructive"
				onClick={() => {
					signOut();
				}}
			>
				Logout
			</Button>

			<Button onClick={() => setOpenSidebar(true)}>Open</Button>
		</div>
	);
};

export default HomePage;
