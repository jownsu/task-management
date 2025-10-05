import { faker } from "@faker-js/faker";

// Import the mock data structure
export interface Subtask {
	id: string;
	title: string;
	is_completed: boolean;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	status: string;
	subtasks: Subtask[];
}

export interface Column {
	id: string;
	title: string;
	tasks: Task[];
}

export interface Board {
	id: string;
	title: string;
	columns: Column[];
}

// Mock data from your frontend
const board_list_data: Board[] = [
	{
		id: "1",
		title: "Platform Launch",
		columns: [
			{
				id: "1",
				title: "Todo",
				tasks: [
					{
						id: "1",
						title: "Build UI for onboarding flow",
						description: "",
						status: "Todo",
						subtasks: [
							{
								id: "1",
								title: "Sign up page",
								is_completed: true,
							},
							{
								id: "2",
								title: "Sign in page",
								is_completed: false,
							},
							{
								id: "3",
								title: "Welcome page",
								is_completed: false,
							},
						],
					},
					{
						id: "2",
						title: "Build UI for search",
						description: "",
						status: "Todo",
						subtasks: [
							{
								id: "1",
								title: "Search page",
								is_completed: false,
							},
						],
					},
					{
						id: "3",
						title: "Build settings UI",
						description: "",
						status: "Todo",
						subtasks: [
							{
								id: "1",
								title: "Account page",
								is_completed: false,
							},
							{
								id: "2",
								title: "Billing page",
								is_completed: false,
							},
						],
					},
					{
						id: "4",
						title: "QA and test all major user journeys",
						description:
							"Once we feel version one is ready, we need to rigorously test it both internally and externally to identify any major gaps.",
						status: "Todo",
						subtasks: [
							{
								id: "1",
								title: "Internal testing",
								is_completed: false,
							},
							{
								id: "2",
								title: "External testing",
								is_completed: false,
							},
						],
					},
				],
			},
			{
				id: "2",
				title: "Doing",
				tasks: [
					{
						id: "5",
						title: "Design settings and search pages",
						description: "",
						status: "Doing",
						subtasks: [
							{
								id: "1",
								title: "Settings - Account page",
								is_completed: true,
							},
							{
								id: "2",
								title: "Settings - Billing page",
								is_completed: true,
							},
							{
								id: "3",
								title: "Search page",
								is_completed: false,
							},
						],
					},
					{
						id: "6",
						title: "Add account management endpoints",
						description: "",
						status: "Doing",
						subtasks: [
							{
								id: "1",
								title: "Upgrade plan",
								is_completed: true,
							},
							{
								id: "2",
								title: "Cancel plan",
								is_completed: true,
							},
							{
								id: "3",
								title: "Update payment method",
								is_completed: false,
							},
						],
					},
					{
						id: "7",
						title: "Design onboarding flow",
						description: "",
						status: "Doing",
						subtasks: [
							{
								id: "1",
								title: "Sign up page",
								is_completed: true,
							},
							{
								id: "2",
								title: "Sign in page",
								is_completed: false,
							},
							{
								id: "3",
								title: "Welcome page",
								is_completed: false,
							},
						],
					},
					{
						id: "8",
						title: "Add search enpoints",
						description: "",
						status: "Doing",
						subtasks: [
							{
								id: "1",
								title: "Add search endpoint",
								is_completed: true,
							},
							{
								id: "2",
								title: "Define search filters",
								is_completed: false,
							},
						],
					},
					{
						id: "9",
						title: "Add authentication endpoints",
						description: "",
						status: "Doing",
						subtasks: [
							{
								id: "1",
								title: "Define user model",
								is_completed: true,
							},
							{
								id: "2",
								title: "Add auth endpoints",
								is_completed: false,
							},
						],
					},
					{
						id: "10",
						title: "Research pricing points of various competitors and trial different business models",
						description:
							"We know what we're planning to build for version one. Now we need to finalise the first pricing model we'll use. Keep iterating the subtasks until we have a coherent proposition.",
						status: "Doing",
						subtasks: [
							{
								id: "1",
								title: "Research competitor pricing and business models",
								is_completed: true,
							},
							{
								id: "2",
								title: "Outline a business model that works for our solution",
								is_completed: false,
							},
							{
								id: "3",
								title: "Talk to potential customers about our proposed solution and ask for fair price expectancy",
								is_completed: false,
							},
						],
					},
				],
			},
			{
				id: "3",
				title: "Done",
				tasks: [
					{
						id: "11",
						title: "Conduct 5 wireframe tests",
						description:
							"Ensure the layout continues to make sense and we have strong buy-in from potential users.",
						status: "Done",
						subtasks: [
							{
								id: "1",
								title: "Complete 5 wireframe prototype tests",
								is_completed: true,
							},
						],
					},
					{
						id: "12",
						title: "Create wireframe prototype",
						description:
							"Create a greyscale clickable wireframe prototype to test our asssumptions so far.",
						status: "Done",
						subtasks: [
							{
								id: "1",
								title: "Create clickable wireframe prototype in Balsamiq",
								is_completed: true,
							},
						],
					},
					{
						id: "13",
						title: "Review results of usability tests and iterate",
						description:
							"Keep iterating through the subtasks until we're clear on the core concepts for the app.",
						status: "Done",
						subtasks: [
							{
								id: "1",
								title: "Meet to review notes from previous tests and plan changes",
								is_completed: true,
							},
							{
								id: "2",
								title: "Make changes to paper prototypes",
								is_completed: true,
							},
							{
								id: "3",
								title: "Conduct 5 usability tests",
								is_completed: true,
							},
						],
					},
					{
						id: "14",
						title: "Create paper prototypes and conduct 10 usability tests with potential customers",
						description: "",
						status: "Done",
						subtasks: [
							{
								id: "1",
								title: "Create paper prototypes for version one",
								is_completed: true,
							},
							{
								id: "2",
								title: "Complete 10 usability tests",
								is_completed: true,
							},
						],
					},
					{
						id: "15",
						title: "Market discovery",
						description:
							"We need to define and refine our core product. Interviews will help us learn common pain points and help us define the strongest MVP.",
						status: "Done",
						subtasks: [
							{
								id: "1",
								title: "Interview 10 prospective customers",
								is_completed: true,
							},
						],
					},
					{
						id: "16",
						title: "Competitor analysis",
						description: "",
						status: "Done",
						subtasks: [
							{
								id: "1",
								title: "Find direct and indirect competitors",
								is_completed: true,
							},
							{
								id: "2",
								title: "SWOT analysis for each competitor",
								is_completed: true,
							},
						],
					},
					{
						id: "17",
						title: "Research the market",
						description:
							"We need to get a solid overview of the market to ensure we have up-to-date estimates of market size and demand.",
						status: "Done",
						subtasks: [
							{
								id: "1",
								title: "Write up research analysis",
								is_completed: true,
							},
							{
								id: "2",
								title: "Calculate TAM",
								is_completed: true,
							},
						],
					},
				],
			},
		],
	},
	{
		id: "2",
		title: "Marketing Plan",
		columns: [
			{
				id: "4",
				title: "Todo",
				tasks: [
					{
						id: "18",
						title: "Plan Product Hunt launch",
						description: "",
						status: "Todo",
						subtasks: [
							{
								id: "1",
								title: "Find hunter",
								is_completed: false,
							},
							{
								id: "2",
								title: "Gather assets",
								is_completed: false,
							},
							{
								id: "3",
								title: "Draft product page",
								is_completed: false,
							},
							{
								id: "4",
								title: "Notify customers",
								is_completed: false,
							},
							{
								id: "5",
								title: "Notify network",
								is_completed: false,
							},
							{
								id: "6",
								title: "Launch!",
								is_completed: false,
							},
						],
					},
					{
						id: "19",
						title: "Share on Show HN",
						description: "",
						status: "",
						subtasks: [
							{
								id: "1",
								title: "Draft out HN post",
								is_completed: false,
							},
							{
								id: "2",
								title: "Get feedback and refine",
								is_completed: false,
							},
							{
								id: "3",
								title: "Publish post",
								is_completed: false,
							},
						],
					},
					{
						id: "20",
						title: "Write launch article to publish on multiple channels",
						description: "",
						status: "",
						subtasks: [
							{
								id: "1",
								title: "Write article",
								is_completed: false,
							},
							{
								id: "2",
								title: "Publish on LinkedIn",
								is_completed: false,
							},
							{
								id: "3",
								title: "Publish on Inndie Hackers",
								is_completed: false,
							},
							{
								id: "4",
								title: "Publish on Medium",
								is_completed: false,
							},
						],
					},
				],
			},
			{
				id: "5",
				title: "Doing",
				tasks: [],
			},
			{
				id: "6",
				title: "Done",
				tasks: [],
			},
		],
	},
	{
		id: "3",
		title: "Roadmap",
		columns: [
			{
				id: "7",
				title: "Now",
				tasks: [
					{
						id: "21",
						title: "Launch version one",
						description: "",
						status: "Now",
						subtasks: [
							{
								id: "1",
								title: "Launch privately to our waitlist",
								is_completed: false,
							},
							{
								id: "2",
								title: "Launch publicly on PH, HN, etc.",
								is_completed: false,
							},
						],
					},
					{
						id: "22",
						title: "Review early feedback and plan next steps for roadmap",
						description:
							"Beyond the initial launch, we're keeping the initial roadmap completely empty. This meeting will help us plan out our next steps based on actual customer feedback.",
						status: "Now",
						subtasks: [
							{
								id: "1",
								title: "Interview 10 customers",
								is_completed: false,
							},
							{
								id: "2",
								title: "Review common customer pain points and suggestions",
								is_completed: false,
							},
							{
								id: "3",
								title: "Outline next steps for our roadmap",
								is_completed: false,
							},
						],
					},
				],
			},
			{
				id: "8",
				title: "Next",
				tasks: [],
			},
			{
				id: "9",
				title: "Later",
				tasks: [],
			},
		],
	},
];

// In-memory data store (like your mock server)
let board_list: Board[] = [...board_list_data];

// Get all boards (list view)
export function getAllBoards(): { id: string; title: string }[] {
	return board_list.map((board) => ({
		id: board.id,
		title: board.title,
	}));
}

// Get board by ID
export function getBoardById(boardId: string): Board | undefined {
	return board_list.find((board) => board.id === boardId);
}

// Create new board
export function createBoard(
	title: string,
	columns: { title: string }[],
): Board {
	const newBoard: Board = {
		id: faker.string.uuid(),
		title,
		columns: columns.map((column) => ({
			id: faker.string.uuid(),
			title: column.title,
			tasks: [],
		})),
	};

	board_list.push(newBoard);
	return newBoard;
}

// Update board
export function updateBoard(
	boardId: string,
	title: string,
	columns: any[],
): Board | null {
	let updatedBoard: Board | null = null;

	board_list = board_list.map((board) => {
		if (board.id === boardId) {
			let existingColumns: any[] = [];
			let newColumns: any[] = [];

			columns.forEach((column) => {
				if (column.is_new) {
					newColumns.push({
						...column,
						id: faker.string.uuid(),
						tasks: [],
					});
					return;
				}
				existingColumns.push(column);
			});

			let updatedColumns = existingColumns.map((existingColumn) => ({
				...existingColumn,
				tasks:
					board.columns.find(
						(column) => column.id === existingColumn.id,
					)?.tasks || [],
			}));

			updatedColumns = [...updatedColumns, ...newColumns];

			updatedBoard = {
				...board,
				title,
				columns: updatedColumns,
			};

			return {
				id: board.id,
				title,
				columns: updatedColumns,
			};
		}

		return board;
	});

	return updatedBoard;
}

// Delete board
export function deleteBoard(boardId: string): boolean {
	const initialLength = board_list.length;
	board_list = board_list.filter((board) => board.id !== boardId);
	return board_list.length < initialLength;
}

// Delete column
export function deleteColumn(boardId: string, columnId: string): boolean {
	let deleted = false;

	board_list = board_list.map((board) => {
		if (board.id === boardId) {
			const initialLength = board.columns.length;
			const updatedColumns = board.columns.filter(
				(column) => column.id !== columnId,
			);
			deleted = initialLength > updatedColumns.length;

			return {
				...board,
				columns: updatedColumns,
			};
		}
		return board;
	});

	return deleted;
}

// Update subtask
export function updateSubtask(
	boardId: string,
	columnId: string,
	taskId: string,
	subtaskId: string,
	isCompleted: boolean,
): boolean {
	const board = board_list.find((board) => board.id === boardId);
	if (!board) return false;

	const column = board.columns.find((col) => col.id === columnId);
	if (!column) return false;

	const task = column.tasks.find((t) => t.id === taskId);
	if (!task) return false;

	const subtaskIndex = task.subtasks.findIndex((st) => st.id === subtaskId);
	if (subtaskIndex === -1) return false;

	task.subtasks[subtaskIndex].is_completed = isCompleted;
	return true;
}

// Get all data (for debugging)
export function getAllData(): Board[] {
	return board_list;
}

// Reset data to initial state
export function resetData(): void {
	board_list = [...board_list_data];
}
