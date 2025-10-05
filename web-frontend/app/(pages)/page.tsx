"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import MainContainer from "@/components/main-container";

const HomePage = () => {

	return (
		<MainContainer>
			<p>Home Page</p>
			<Button
				variant="destructive"
			>
				Logout
			</Button>
		</MainContainer>
	);
};

export default HomePage;
