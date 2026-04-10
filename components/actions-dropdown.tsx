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
	onEditTagsClick?: () => void;
	onDeleteClick?: () => void;
}

const ActionOptions = ({ onEditClick, onEditTagsClick, onDeleteClick, name }: Props) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="size-[25] grid place-items-center cursor-pointer shrink-0">
				<Ellipsis />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[192] z-[300]" align="end" sideOffset={15}>
				<DropdownMenuItem
					className="text-medium-grey"
					onClick={() => onEditClick?.()}
				>
					Edit {name}
				</DropdownMenuItem>
				{onEditTagsClick && (
					<DropdownMenuItem
						className="text-medium-grey"
						onClick={() => onEditTagsClick()}
					>
						Edit Tags
					</DropdownMenuItem>
				)}
				<DropdownMenuItem variant="destructive" onClick={() => onDeleteClick?.()}>
					Delete {name}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ActionOptions;
