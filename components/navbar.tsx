/* COMPONENTS */
import { Button } from "@/components/ui/button";
import NavMobile from "@/components/side-nav/nav-mobile";

/* ICONS */
import IconKanban from "@/components/kanban-icon";
import Ellipsis from "@/public/icon-ellipsis.svg";
import { FaPlus } from "react-icons/fa";

const Navbar = () => {
	return (
		<nav className="flex bg-foreground h-[64] md:h-[81] lg:h-[96] px-[24] justify-between z-[99] fixed w-full">
			<div className="gap-[24] hidden md:flex">
				<div className="border-r-2 border-background pr-[24] flex">
					<IconKanban />
				</div>
				<h1 className="self-center text-xl">Platform Launch</h1>
			</div>

			<NavMobile />

			<div className="self-center flex items-center gap-[16] md:gap-[24]">
				<Button
					type="button"
					className="text-md h-[32] w-[48] md:w-fit md:h-[48] md:!px-[24]"
				>
					<FaPlus className="size-[12]" />{" "}
					<span className="hidden md:block">Add New Task</span>
				</Button>
				<button>
					<Ellipsis />
				</button>
			</div>
		</nav>
	);
};

export default Navbar;
