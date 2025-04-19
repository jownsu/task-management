/* NEXT */
import type { Metadata } from "next";

/* PLUGINS */
import { Plus_Jakarta_Sans } from "next/font/google";

/* COMPONENTS */
import Providers from "@/components/providers";
import Navbar from "@/components/navigation/navbar";
import SideNav from "@/components/navigation/side-nav";
import MainContainer from "@/components/main-container";

/* STYLES */
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
	variable: "--font-jakarta",
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
	title: "Nextjs with drizzle template",
	description: "Nextjs with drizzle template"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${jakarta.variable} bg-background flex flex-col gap-[16] min-h-screen`}
			>
				<Providers>
					<Navbar />
					<div className="flex h-full flex-1">
						<SideNav />
						<MainContainer>
							{children}
						</MainContainer>
					</div>
				</Providers>
			</body>
		</html>
	);
}
