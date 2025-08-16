import * as React from "react";

import { cn } from "@/lib/utils";

interface Props {
	error?: string;
	floating_error?: boolean;
}

function Textarea({ className, error, floating_error, ...props }: React.ComponentProps<"textarea"> & Props) {
	return (
		<div className="flex flex-col w-full gap-[8] relative">
			<textarea
				data-slot="textarea"
				aria-invalid={!!error}
				className={cn(
					"border-lines !text-b-lg placeholder:text-black/25 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:placeholder:text-white/25 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-[16] py-[8] text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					className
				)}
				{...props}
			/>
			{
				error && (
					<p 
						className={cn("text-destructive !text-b-lg", {
							["absolute top-[10] right-[16]"]: floating_error
						})}
					>
						{error}
					</p>
				)
			}
		</div>
	);
}

export { Textarea };
