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
