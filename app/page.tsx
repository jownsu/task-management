"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";

/* ACTIONS */
import { signOut } from "next-auth/react";

const HomePage = () => {

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
		</div>
	);
};

export default HomePage;
