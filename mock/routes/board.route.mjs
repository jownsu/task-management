/* eslint-disable no-magic-numbers */
import { faker } from "@faker-js/faker";

export const board_list = Array.from({ length: 7 }, () => ({
	id: faker.string.uuid(),
	title: faker.lorem.word(),
	columns: Array.from({ length: 3 }, () => ({
		id: faker.string.uuid(),
		title: faker.lorem.word(),	
		tasks: Array.from({ length: 7 }, () => ({
			id: faker.string.uuid(),
			title: faker.lorem.word(),
			total_subtask: 5,
			completed_sub_task: faker.number.int({ min: 1, max: 3 }),
		}))
	}))
}))

export default function boardRoutes(app) {

	app.get("/api/boards", (req, res) => {
		res.jsonp({
			status: true,
			result: board_list.map(board => ({ id: board.id, title: board.title })),
			error: null,
			message: null
		});
	});

	app.get("/api/boards/:board_id", (req, res) => {
		const { board_id } = req.params;

		res.jsonp({
			status: true,
			result: board_list.find((board) => board.id === board_id),
			error: null,
			message: null
		});
	});
}
