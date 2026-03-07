import { PrismaClient } from "@/lib/generated/prisma/client";
import seedData from "./seed-data.json";
import { PrismaPg } from "@prisma/adapter-pg";
import { ENV } from "@/constants/env";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface SubtaskData {
	title: string;
	isCompleted: boolean;
}

interface TaskData {
	title: string;
	description: string;
	subtasks: SubtaskData[];
}

interface ColumnData {
	name: string;
	tasks: TaskData[];
}

interface BoardData {
	name: string;
	columns: ColumnData[];
}

/**
 * DOCU: Seeds the database with initial kanban board data. <br>
 * Triggered: When running `npx prisma db seed`. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
async function main() {
	console.log("🌱 Starting seed...");

	/* Hash demo user password */
	const hashed_password = await bcrypt.hash("Password@1", 10);

	/* Create a demo user */
	const user = await prisma.user.upsert({
		where: { email: "demo@gmail.com" },
		update: { password: hashed_password },
		create: {
			email: "demo@gmail.com",
			name: "Demo User",
			password: hashed_password,
		},
	});

	console.log(`✅ Created user: ${user.email}`);

	/* Delete existing boards for clean seed */
	await prisma.board.deleteMany({
		where: { userId: user.id },
	});

	/* Seed boards with columns, tasks, and subtasks */
	for (const board_data of seedData.boards as BoardData[]) {
		const board = await prisma.board.create({
			data: {
				name: board_data.name,
				userId: user.id
			}
		});

		const column_ids: string[] = [];

		for (const column_data of board_data.columns) {
			const column = await prisma.column.create({
				data: {
					name: column_data.name,
					boardId: board.id
				}
			});

			column_ids.push(column.id);

			const task_ids: string[] = [];

			for (const task_data of column_data.tasks) {
				const task = await prisma.task.create({
					data: {
						title: task_data.title,
						description: task_data.description,
						columnId: column.id
					}
				});

				const subtask_ids: string[] = [];

				for (const subtask_data of task_data.subtasks) {
					const subtask = await prisma.subtask.create({
						data: {
							title: subtask_data.title,
							isCompleted: subtask_data.isCompleted,
							taskId: task.id
						}
					});
					subtask_ids.push(subtask.id);
				}

				/* Set the subtask order on the task */
				await prisma.task.update({
					where: { id: task.id },
					data: { subtaskOrder: subtask_ids }
				});

				task_ids.push(task.id);
			}

			/* Set the task order on the column */
			await prisma.column.update({
				where: { id: column.id },
				data: { taskOrder: task_ids }
			});
		}

		/* Set the column order on the board */
		await prisma.board.update({
			where: { id: board.id },
			data: { columnOrder: column_ids }
		});

		console.log(`✅ Created board: ${board_data.name}`);
	}

	console.log("🌱 Seed completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
