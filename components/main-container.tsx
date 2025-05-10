"use client";

/* NEXT */
import { ReactNode } from "react";

/* STORE */
import { useNavigationStore } from "@/store/navigation.store";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	children: ReactNode;
}

const MainContainer = ({ children }: Props) => {
	const is_sidebar_open = useNavigationStore((state) => state.is_sidebar_open);

	return (
		<main
			className={cn("px-[16] pt-[120] duration-500 w-full", {
				["md:pl-[260] lg:pl-[300]"]: is_sidebar_open
			})}
		>
			{children}
		</main>
	);
};

export default MainContainer;
