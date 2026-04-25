"use client";

/* REACT */
import { useState } from "react";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/* ICONS */
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

/* UTILITIES */
import { addMonths, formatYearMonthLabel, parseYearMonth } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";

interface Props {
	year_month: string;
	onChange: (year_month: string) => void;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * DOCU: Month picker with prev/next chevrons and a popover that lets the user jump directly to any month/year. <br>
 * Triggered: At the top of the habit-tracker board. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const MonthPicker = ({ year_month, onChange }: Props) => {
	const { year: selected_year, month_num: selected_month } = parseYearMonth(year_month);
	const [is_open, setIsOpen] = useState(false);
	const [picker_year, setPickerYear] = useState(selected_year);

	/**
	 * DOCU: Resets picker_year to the active year whenever the popover opens. <br>
	 * Triggered: On popover open/close transitions. <br>
	 * Last Updated: April 25, 2026
	 * @author Jhones
	 */
	const handleOpenChange = (open: boolean) => {
		if (open) setPickerYear(selected_year);
		setIsOpen(open);
	};

	/**
	 * DOCU: Selects a month for the current picker_year and closes the popover. <br>
	 * Triggered: When the user clicks a month button in the popover. <br>
	 * Last Updated: April 25, 2026
	 * @author Jhones
	 */
	const handleSelectMonth = (month_num: number) => {
		const month_str = String(month_num).padStart(2, "0");
		onChange(`${picker_year}-${month_str}`);
		setIsOpen(false);
	};

	return (
		<div className="flex items-center justify-center gap-[16] py-[12]">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => onChange(addMonths(year_month, -1))}
				aria-label="Previous month"
			>
				<FaChevronLeft />
			</Button>

			<Popover open={is_open} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="text-primary text-h-md font-bold hover:underline cursor-pointer"
					>
						{formatYearMonthLabel(year_month)}
					</button>
				</PopoverTrigger>
				<PopoverContent align="center" className="w-[280] p-[16] border-lines">
					<div className="flex items-center justify-between mb-[12]">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => setPickerYear((y) => y - 1)}
							aria-label="Previous year"
						>
							<FaChevronLeft />
						</Button>
						<span className="text-body-md font-bold">{picker_year}</span>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => setPickerYear((y) => y + 1)}
							aria-label="Next year"
						>
							<FaChevronRight />
						</Button>
					</div>

					<div className="grid grid-cols-3 gap-[8]">
						{MONTH_LABELS.map((label, idx) => {
							const month_num = idx + 1;
							const is_selected = picker_year === selected_year && month_num === selected_month;
							return (
								<button
									key={label}
									type="button"
									onClick={() => handleSelectMonth(month_num)}
									className={cn(
										"py-[8] rounded-md text-body-sm cursor-pointer transition-colors",
										is_selected
											? "bg-primary text-primary-foreground"
											: "hover:bg-primary/10"
									)}
								>
									{label}
								</button>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>

			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => onChange(addMonths(year_month, 1))}
				aria-label="Next month"
			>
				<FaChevronRight />
			</Button>
		</div>
	);
};

export default MonthPicker;
