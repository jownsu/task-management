"use client";

/* PLUGINS */
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardTitle
} from "@/components/ui/card";

/* ACTIONS */
import { signIn } from "next-auth/react";

const SocialsLogin = () => {
	return (
		<Card className="flex flex-col items-center max-w-[400] min-w-[400] mx-auto gap-[21]">
			<CardTitle className="t-[21]">Login</CardTitle>
			<CardContent className="w-full flex flex-col gap-[12]">
				<Button
					variant="outline"
					className="flex gap-[16] w-full"
					onClick={() =>
						signIn("google", {
							redirect: false,
							redirectTo: "/"
						})
					}
				>
					Sign in with Google
					<FcGoogle className="size-[16]" />
				</Button>
				<Button
					variant="outline"
					className="flex gap-[16] w-full"
					onClick={() =>
						signIn("github", {
							redirect: false,
							redirectTo: "/"
						})
					}
				>
					Sign in with Github
					<FaGithub className="size-[16]" />
				</Button>
			</CardContent>
		</Card>
	);
};

export default SocialsLogin;
