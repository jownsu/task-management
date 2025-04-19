/* NEXT */
import type { Metadata } from "next";

/* COMPONENTS */
import Providers from "@/components/providers";

/* PLUGINS */
import { Plus_Jakarta_Sans } from "next/font/google";

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
					{children}
				</Providers>
			</body>
		</html>
	);
}
