"use client";

/* REACT */
import { useEffect, useState } from "react";

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
	const [is_checked, setChecked] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setChecked(theme === "dark");
	}, [theme]);

	return (
		<div
			className={cn(
				"flex items-center bg-background h-[48] rounded-md justify-center gap-[24]",
				className
			)}
		>
			<IconLightMode />
			<Switch
				checked={is_checked}
				onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
			/>
			<IconDarkMode />
		</div>
	);
};

export default ThemeSwitch;
