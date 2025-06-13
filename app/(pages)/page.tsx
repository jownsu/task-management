"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";

const HomePage = () => {

	return (
		<div className="container">
			<p>Home Page</p>
			<Button
				variant="destructive"
			>
				Logout
			</Button>
		</div>
	);
};

export default HomePage;
