/* NEXT */
import type { Metadata } from "next";

/* COMPONENTS */
import Providers from "@/components/providers";

/* PLUGINS */
import { Plus_Jakarta_Sans } from "next/font/google";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/* STYLES */
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
	variable: "--font-jakarta",
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
	title: "Kanban Task Management",
	description: "Kanban Task Management"
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
					<ReactQueryDevtools initialIsOpen={false} />
				</Providers>
			</body>
		</html>
	);
}
