"use client";

/* NEXT */
import { ReactNode } from "react";

/* PLUGINS */
import { ClassValue } from "clsx";

/* STORE */
import { useNavigationStore } from "@/store/navigation.store";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	children: ReactNode;
	className?: ClassValue;
}

const MainContainer = ({ children, className }: Props) => {
	const is_sidebar_open = useNavigationStore((state) => state.is_sidebar_open);

	return (
		<main
			className={cn("duration-500 w-full", {
				["md:pl-[260] lg:pl-[300]"]: is_sidebar_open
			}, className)}
		>
			{children}
		</main>
	);
};

export default MainContainer;
