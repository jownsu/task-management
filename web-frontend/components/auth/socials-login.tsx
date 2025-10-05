"use client";

/* NEXT */
import { useRouter } from "next/navigation";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardTitle
} from "@/components/ui/card";
import KanbanIcon from "@/components/kanban-icon";


const SocialsLogin = () => {
	const router = useRouter();

	return (
		<Card className="flex flex-col items-center max-w-[560] w-full mx-auto gap-[21] border-none">
			<CardTitle className="t-[21]"><KanbanIcon /></CardTitle>
			<CardContent className="w-full flex flex-col gap-[12]">
				<Button
					className="flex gap-[16] w-full h-[53] rounded-lg text-md"
					onClick={() => router.push("/")}
				>
					Log in with Google
				</Button>
			</CardContent>
		</Card>
	);
};

export default SocialsLogin;
