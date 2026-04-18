/* COMPONENTS */
import MainContainer from "@/components/main-container";
import Navbar from "@/components/navigation/navbar";
import HabitTrackerBoard from "@/components/board/habit-tracker-board";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

/* QUERIES */
import { prefetchHabitTrackerBoard } from "@/hooks/queries/habit-tracker-board.query";

interface Props {
	params: {
		board_id: string;
	}
}

/**
 * DOCU: Habit-tracker board detail page. <br>
 * Triggered: On navigation to /habits/[board_id]. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const HabitTrackerPage = async ({ params }: Props) => {
	const { board_id } = (await params) as { board_id: string };
	const { dehydrated_state } = await prefetchHabitTrackerBoard(board_id);

	return (
		<HydrationBoundary state={dehydrated_state}>
			<Navbar />

			<MainContainer>
				<HabitTrackerBoard />
			</MainContainer>
		</HydrationBoundary>
	);
};

export default HabitTrackerPage;
