"use client";

/* COMPONENTS */
import { Switch } from "@/components/ui/switch";

/* PLUGINS */
import { useTheme } from "next-themes";
import { ClassNameValue } from "tailwind-merge";

/* ICONS */
import IconDarkMode from "@/public/icon-dark-mode.svg";
import IconLightMode from "@/public/icon-light-mode.svg";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	className?: ClassNameValue;
}

const ThemeSwitch = ({ className }: Props) => {
	const { theme, setTheme } = useTheme();

	return (
		<div
			className={cn(
				"flex items-center bg-background h-[48] rounded-md justify-center gap-[24]", className
			)}
		>
			<IconLightMode />
			<Switch
				checked={theme === "dark"}
				onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
			/>
			<IconDarkMode />
		</div>
	);
};

export default ThemeSwitch;
