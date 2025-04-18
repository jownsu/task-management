/* COMPONENTS */
import { Switch } from "@/components/ui/switch";

/* PLUGINS */
import { useTheme } from "next-themes";

/* ICONS */
import IconDarkMode from "@/public/icon-dark-mode.svg";
import IconLightMode from "@/public/icon-light-mode.svg";

const ThemeSwitch = () => {
	const { theme, setTheme } = useTheme();

	return (
		<div className="flex items-center bg-background h-[48] rounded-md justify-center gap-[24]">
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
