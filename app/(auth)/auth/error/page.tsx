/* NEXT */
import Link from "next/link";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import FlowBoardIcon from "@/components/flowboard-icon";

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
	Configuration: {
		title: "Login failed",
		message: "Your browser may be blocking cookies required for login. Please try a different login method or use another browser.",
	},
	AccessDenied: {
		title: "Access denied",
		message: "You do not have access to this resource.",
	},
	Verification: {
		title: "Verification failed",
		message: "The verification link may have expired or already been used.",
	},
	Default: {
		title: "Something went wrong",
		message: "An unexpected error occurred during authentication. Please try again.",
	},
};

/**
 * DOCU: This page displays authentication error messages from Auth.js. <br>
 * Triggered: When Auth.js redirects to the custom error page on auth failure. <br>
 * Last Updated: March 14, 2026
 * @author Jhones
 */
const AuthErrorPage = async ({ searchParams }: { searchParams: Promise<{ error?: string }> }) => {
	const { error } = await searchParams;
	const { title, message } = ERROR_MESSAGES[error ?? ""] || ERROR_MESSAGES["Default"];

	return (
		<div className="flex min-h-screen w-full items-center justify-center px-[16]">
			<Card className="mx-auto flex w-full max-w-[560] flex-col items-center gap-[21] border-none">
				<CardTitle className="t-[21]">
					<FlowBoardIcon />
				</CardTitle>
				<CardContent className="flex w-full flex-col items-center gap-[24]">
					<div className="flex flex-col items-center gap-[8]">
						<h1 className="!text-h-lg">{title}</h1>
						<p className="text-medium-grey !text-b-lg text-center">{message}</p>
					</div>
					<Button asChild className="h-[53] w-full rounded-lg text-md">
						<Link href="/login">Try a Different Login Method</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default AuthErrorPage;
