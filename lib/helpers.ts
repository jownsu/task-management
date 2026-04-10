/**
 * DOCU: Returns white or dark text color based on background luminance for contrast. <br>
 * Triggered: When rendering tag pills to ensure readability. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export function getContrastColor(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}

/**
 * DOCU: Sorts items by their position in an order array. <br>
 * Triggered: When formatting responses that need ordered items (columns, tasks, subtasks). <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export function sortByIdOrder<T extends { id: string }>(items: T[], order_ids: string[]): T[] {
	const map = new Map(items.map((item) => [item.id, item]));
	return order_ids.reduce<T[]>((sorted, id) => {
		const item = map.get(id);
		if (item) sorted.push(item);
		return sorted;
	}, []);
}
