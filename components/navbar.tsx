/* COMPONENTS */
import KanbanIcon from "@/components/kanban-icon";
import { Button } from "@/components/ui/button";

/* ICONS */
import Ellipsis from "@/public/icon-ellipsis.svg";

const Navbar = () => {
	return (
		<nav className="flex bg-foreground h-[96] px-[24] justify-between">
			<div className="flex gap-[24]">
				<KanbanIcon />
				<span className="w-[2] bg-background"></span>
				<h1 className="self-center text-black text-xl">Platform Launch</h1>
			</div>

			<div className="self-center flex items-center gap-[24]">
				<Button type="button" className="text-md" size="lg">
					+ Add new task
				</Button>
				<button>
					<Ellipsis />
				</button>
			</div>
		</nav>
	);
};

export default Navbar;
