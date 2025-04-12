/* NEXT */
import type { Metadata } from "next";

/* PLUGINS */
import { Plus_Jakarta_Sans } from "next/font/google";

/* COMPONENTS */
import Nav from "@/components/navigation/nav";
import Providers from "@/components/providers";

/* STYLES */
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
	variable: "--font-jakarta",
	subsets: ["latin"],
	weight: ["200", "300", "400","500", "600", "700"]
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
					<Nav />
					<main className="px-[16] flex h-full flex-1">
						{children}
					</main>
				</Providers>
			</body>
		</html>
	);
}
