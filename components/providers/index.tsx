/* NEXT */
import { PropsWithChildren } from "react";

/* COMPONENTS */
import QueryClientProvider from "@/components/providers/query-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

/* PLUGINS */
import { SessionProvider } from "next-auth/react";

const Providers = ({ children }: PropsWithChildren) => {
	return (
		<SessionProvider>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				enableSystem
				disableTransitionOnChange
			>
				<QueryClientProvider>{children}</QueryClientProvider>
			</ThemeProvider>
		</SessionProvider>
	);
};

export default Providers;
