"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import MainContainer from "@/components/main-container";

/* PLUGINS */
import { signOut } from "next-auth/react";

const HomePage = () => {

	return (
		<MainContainer>
			<p>Home Page</p>
			<Button
				variant="destructive"
				onClick={() => signOut({ redirectTo: "/login" })}
			>
				Logout
			</Button>
		</MainContainer>
	);
};

export default HomePage;
