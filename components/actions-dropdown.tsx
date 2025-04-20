/* COMPONENTS */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

/* ICONS */
import Ellipsis from "@/public/icon-ellipsis.svg";

interface Props {
	name?: string;
	onEditClick?: () => void;
	onDeleteClick?: () => void;
}

const ActionOptions = ({ onEditClick, onDeleteClick, name }: Props) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="size-[25] grid place-items-center cursor-pointer">
				<Ellipsis />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[192]" align="end" sideOffset={15}>
				<DropdownMenuItem
					className="text-medium-grey"
					onClick={() => onEditClick?.()}
				>
					Edit {name}
				</DropdownMenuItem>
				<DropdownMenuItem variant="destructive" onClick={() => onDeleteClick?.()}>
					Delete {name}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ActionOptions;
