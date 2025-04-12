/* NEXT */
import type { Metadata } from "next";

/* PLUGINS */
import { Poppins } from "next/font/google";

/* COMPONENTS */
import Nav from "@/components/navigation/nav";
import Providers from "@/components/providers";

/* STYLES */
import "./globals.css";

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["100", "200", "300", "400","500", "600", "700"]
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
				className={`$${poppins.variable} bg-background flex flex-col gap-[16] min-h-screen`}
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
