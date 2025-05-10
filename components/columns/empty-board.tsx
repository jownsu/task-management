import CreateColumnButton from "@/components/columns/create-column-button";

const EmptyBoard = () => {
	return (
		<div className="w-full h-full flex items-center justify-center flex-col gap-[24] lg:gap-[32]">
			<h2 className="text-h-lg text-medium-grey text-center">This board is empty. Create a new column to get started.</h2>
			<CreateColumnButton />
		</div>
	);
};

export default EmptyBoard;
