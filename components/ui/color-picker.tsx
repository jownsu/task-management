"use client";

/* REACT */
import { useState } from "react";

/* COMPONENTS */
import { Button } from "@/components/ui/button";

/* PLUGINS */
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { HexColorPicker, HexColorInput } from "react-colorful";

/* CONSTANTS */
import { PRESET_COLUMN_COLORS } from "@/constants";

/* ICONS */
import { IoColorPaletteOutline } from "react-icons/io5";

/* PLUGINS */
import { ClassValue } from "clsx";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface ColorPickerProps {
	value: string;
	onChange: (color: string) => void;
	disabled?: boolean;
	className?: ClassValue
}

/**
 * DOCU: Reusable color picker with preset color swatches and a custom hex color picker. <br>
 * Triggered: When rendered inside a form that requires color selection. <br>
 * Last Updated: April 06, 2026
 * @author Jhones
 */
const ColorPicker = ({ value, onChange, disabled, className }: ColorPickerProps) => {
	const [is_open, setIsOpen] = useState(false);
	const [show_picker, setShowPicker] = useState(false);
	const [picker_color, setPickerColor] = useState(value);

	const is_preset = PRESET_COLUMN_COLORS.some((color) => color.toUpperCase() === picker_color.toUpperCase());

	/**
	 * DOCU: Handles selection of a preset color and closes the popover. <br>
	 * Triggered: On click of a preset color circle. <br>
	 * Last Updated: April 06, 2026
	 * @author Jhones
	 */
	const handlePresetSelect = (color: string) => {
		onChange(color);
		setPickerColor(color);
		setShowPicker(false);
		setIsOpen(false);
	};

	/**
	 * DOCU: Confirms the custom picker color and closes the popover. <br>
	 * Triggered: On click of the "Select" button in the custom picker. <br>
	 * Last Updated: April 06, 2026
	 * @author Jhones
	 */
	const handlePickerSelect = () => {
		onChange(picker_color);
		setIsOpen(false);
	};

	return (
		<PopoverPrimitive.Root open={is_open} onOpenChange={(open) => { setIsOpen(open); if (open) setPickerColor(value); }}>
			<PopoverPrimitive.Trigger asChild disabled={disabled}>
				<button
					type="button"
					className={cn("size-[26] shrink-0 rounded-full border border-lines-light dark:border-lines-dark cursor-pointer transition-shadow hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", className)}
					style={{ backgroundColor: value }}
					aria-label="Pick a color"
				/>
			</PopoverPrimitive.Trigger>
			{/* No Portal — renders inline so Radix Dialog modal does not block pointer events */}
			<PopoverPrimitive.Content
				align="start"
				sideOffset={4}
				className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-[232] origin-(--radix-popover-content-transform-origin) rounded-md border p-[12] shadow-md outline-hidden"
			>
				<div className="flex flex-col gap-[12]">
					{/* Preset Colors + Picker Toggle */}
					<div className="flex items-center gap-[8]">
						{PRESET_COLUMN_COLORS.map((color) => (
							<button
								key={color}
								type="button"
								className={cn(
									"size-[28] rounded-full cursor-pointer transition-all hover:scale-110 focus-visible:outline-none",
									picker_color.toUpperCase() === color.toUpperCase() && "ring-2 ring-offset-2 ring-primary dark:ring-offset-dark-grey"
								)}
								style={{ backgroundColor: color }}
								onClick={() => handlePresetSelect(color)}
								aria-label={`Select color ${color}`}
							/>
						))}
						{/* Picker Toggle */}
						<button
							type="button"
							className={cn(
								"size-[28] rounded-full cursor-pointer transition-all hover:scale-110 focus-visible:outline-none flex items-center justify-center border border-lines-light dark:border-lines-dark",
								show_picker && !is_preset && "ring-2 ring-offset-2 ring-primary dark:ring-offset-dark-grey"
							)}
							style={!is_preset ? { backgroundColor: picker_color } : undefined}
							onClick={() => setShowPicker((prev) => !prev)}
							aria-label="Open custom color picker"
						>
							{is_preset && <IoColorPaletteOutline className="size-[14] text-medium-grey" />}
						</button>
					</div>

					{/* Custom Color Picker */}
					{show_picker && (
						<div className="flex flex-col gap-[8]">
							<HexColorPicker color={picker_color} onChange={setPickerColor} />
							<div className="flex items-center gap-[8]">
								<span className="text-body-md text-medium-grey">#</span>
								<HexColorInput
									color={picker_color}
									onChange={setPickerColor}
									prefixed={false}
									className="w-full rounded-md border border-lines-light dark:border-lines-dark bg-transparent px-[8] py-[4] text-body-md focus:outline-none focus:ring-1 focus:ring-primary"
									aria-label="Hex color value"
								/>
							</div>
							<Button type="button" size="sm" className="w-full" onClick={handlePickerSelect}>
								Select
							</Button>
						</div>
					)}
				</div>
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Root>
	);
};

export default ColorPicker;
