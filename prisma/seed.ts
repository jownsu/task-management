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
	order: number;
}

interface TaskData {
	title: string;
	description: string;
	order: number;
	subtasks: SubtaskData[];
}

interface ColumnData {
	name: string;
	order: number;
	tasks: TaskData[];
}

interface BoardData {
	name: string;
	columns: ColumnData[];
}

/**
 * DOCU: Seeds the database with initial kanban board data. <br>
 * Triggered: When running `npx prisma db seed`. <br>
 * Last Updated: December 30, 2024
 * @author Cascade
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

	/* Seed boards with columns, tasks, and subtasks using nested create */
	for (const board_data of seedData.boards as BoardData[]) {
		const board = await prisma.board.create({
			data: {
				name: board_data.name,
				userId: user.id,
				columns: {
					create: board_data.columns.map((column_data) => ({
						name: column_data.name,
						order: column_data.order,
						tasks: {
							create: column_data.tasks.map((task_data) => ({
								title: task_data.title,
								description: task_data.description,
								order: task_data.order,
								subtasks: {
									create: task_data.subtasks.map(
										(
											subtask_data,
										) => ({
											title: subtask_data.title,
											isCompleted: subtask_data.isCompleted,
											order: subtask_data.order,
										}),
									),
								},
							})),
						},
					})),
				},
			},
		});

		console.log(`✅ Created board: ${board.name}`);
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
