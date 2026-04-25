/**
 * DOCU: Returns the current year-month in `YYYY-MM` format using local time. <br>
 * Triggered: As the default value for the `month` URL search param. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function currentYearMonth(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

/**
 * DOCU: Parses a `YYYY-MM` string into year and month_num (1-12). Falls back to current year-month if invalid. <br>
 * Triggered: When converting the `month` URL param into numeric values. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function parseYearMonth(value: string | null | undefined): { year: number; month_num: number } {
	if (value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
		const [year_str, month_str] = value.split("-");
		return { year: Number(year_str), month_num: Number(month_str) };
	}

	const now = new Date();
	return { year: now.getFullYear(), month_num: now.getMonth() + 1 };
}

/**
 * DOCU: Returns the number of days in a given year/month (month_num is 1-12). <br>
 * Triggered: When rendering the day columns of the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function daysInMonth(year: number, month_num: number): number {
	return new Date(year, month_num, 0).getDate();
}

/**
 * DOCU: Formats a Date object as `YYYY-MM-DD` using local time. <br>
 * Triggered: When computing today's date or constructing day cell keys. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function formatLocalDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * DOCU: Builds a `YYYY-MM-DD` date string from year, month_num (1-12), and day. <br>
 * Triggered: When constructing per-cell date strings in the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function buildDateString(year: number, month_num: number, day: number): string {
	const month = String(month_num).padStart(2, "0");
	const day_str = String(day).padStart(2, "0");
	return `${year}-${month}-${day_str}`;
}

/**
 * DOCU: Adds (or subtracts) months to a `YYYY-MM` string and returns the new `YYYY-MM`. <br>
 * Triggered: When the user clicks prev/next month buttons. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function addMonths(year_month: string, delta: number): string {
	const { year, month_num } = parseYearMonth(year_month);
	const date = new Date(year, month_num - 1 + delta, 1);
	const new_year = date.getFullYear();
	const new_month = String(date.getMonth() + 1).padStart(2, "0");
	return `${new_year}-${new_month}`;
}

/**
 * DOCU: Returns the weekday letter (M/T/W/T/F/S/S) for a given year/month/day. Day-of-week index is 0=Sun, 1=Mon, ..., 6=Sat. <br>
 * Triggered: When rendering the day-letter row of the habit grid header. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function getWeekdayLetter(year: number, month_num: number, day: number): string {
	const letters = ["S", "M", "T", "W", "T", "F", "S"];
	const date = new Date(year, month_num - 1, day);
	return letters[date.getDay()];
}

/**
 * DOCU: Formats a `YYYY-MM` string as a human-readable label (e.g., "March, 2021"). <br>
 * Triggered: In the month picker header display. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function formatYearMonthLabel(year_month: string): string {
	const { year, month_num } = parseYearMonth(year_month);
	const month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	return `${month_names[month_num - 1]}, ${year}`;
}
