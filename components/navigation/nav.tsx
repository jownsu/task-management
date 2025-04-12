/* NEXT */
import Link from "next/link";

/* PLUGINS */
import { LogIn } from "lucide-react";

/* COMPONENTS */
import Logo from "@/components/navigation/logo";
import UserButton from "@/components/navigation/user-button";
import { Button } from "@/components/ui/button";

/* ACTIONS */
import { auth } from "@/server/auth";

const Nav = async () => {
	const session = await auth();

	return (
		<header className="bg-card-foreground py-[16] px-0">
			<nav className="container">
				<ul className="flex justify-between items-center">
					<li>
						<Link href={"/"} aria-label="sprout and scribble logo">
							<Logo />
						</Link>
					</li>
					<li>
						{session ? (
							<UserButton user={session?.user} />
						) : (
							<Button asChild>
								<Link href={"/auth/login"} className="text-background">
									<LogIn /> <span>Login</span>
								</Link>
							</Button>
						)}
					</li>
				</ul>
			</nav>
		</header>
	);
};

export default Nav;
