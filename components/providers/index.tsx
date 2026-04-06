/* REACT */
import { PropsWithChildren } from "react";

/* COMPONENTS */
import QueryClientProvider from "@/components/providers/query-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ThemedToaster from "@/components/providers/themed-toaster";

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
				<ThemedToaster />
			</ThemeProvider>
		</SessionProvider>
	);
};

export default Providers;
