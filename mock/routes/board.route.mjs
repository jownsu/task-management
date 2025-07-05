/* eslint-disable no-magic-numbers */
import { faker } from "@faker-js/faker";
import { board_list_data } from "../data.mjs";

let board_list = [...board_list_data];

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

	app.post("/api/boards", (req, res) => {
		const { title, columns } = req.body;

		const new_board = {
			id: faker.string.uuid(),
			title,
			columns: columns.map(column => ({
				id: faker.string.uuid(),
				title: column.title,
				tasks: []
			}))
		}

		board_list.push(new_board);

		res.jsonp({
			status: true,
			result: new_board,
			error: null,
			message: null
		});
	});
}
