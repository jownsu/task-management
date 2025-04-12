"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardTitle
} from "@/components/ui/card";
import KanbanIcon from "@/components/kanban-icon";

/* ACTIONS */
import { signIn } from "next-auth/react";

const SocialsLogin = () => {
	return (
		<Card className="flex flex-col items-center max-w-[560] w-full mx-auto gap-[21] border-none">
			<CardTitle className="t-[21]"><KanbanIcon /></CardTitle>
			<CardContent className="w-full flex flex-col gap-[12]">
				<Button
					className="flex gap-[16] w-full h-[53] rounded-lg text-md"
					onClick={() =>
						signIn("google", {
							redirect: false,
							redirectTo: "/"
						})
					}
				>
					Log in with Google
				</Button>
			</CardContent>
		</Card>
	);
};

export default SocialsLogin;
