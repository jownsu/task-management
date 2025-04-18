/* NEXT */
import type { Metadata } from "next";

/* PLUGINS */
import { Plus_Jakarta_Sans } from "next/font/google";

/* COMPONENTS */
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";
import SideNav from "@/components/side-nav/side-nav";

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
					<main className="flex h-full flex-1">
						<SideNav />
						<div className="px-[16] pt-[120]">{children}</div>
					</main>
				</Providers>
			</body>
		</html>
	);
}
