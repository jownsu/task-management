"use client";

/* PLUGINS */
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

const ThemedToaster = () => {
	const { theme } = useTheme();

	return <Toaster richColors position="bottom-right" theme={theme as "light" | "dark"} />;
};

export default ThemedToaster;
