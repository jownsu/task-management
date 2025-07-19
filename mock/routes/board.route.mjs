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

	app.put("/api/boards/:board_id", (req, res) => {
		const { board_id } = req.params;
		const { title, columns } = req.body;

		let updated_board = {};

		board_list = board_list.map(board => {
			if(board.id === board_id){
				
				let existing_columns = [];
				let new_columns = [];

				columns.map(column => {
					if(column.is_new){
						new_columns.push({
							...column,
							id: faker.string.uuid(),
							tasks: []
						});
						return;
					}
					existing_columns.push(column);
				});

				let updated_columns = existing_columns.map(existing_column => ({
					...existing_column,
					tasks: board.columns.find(column => column.id === existing_column.id)?.tasks || []
				}));

				updated_columns = [...updated_columns, ...new_columns];

				updated_board = {
					...board,
					title,
					columns: updated_columns
				}

				return {
					id: board.id,
					title,
					columns: updated_columns
				}
			}

			return board;
		})

		res.jsonp({
			status: true,
			result: updated_board,
			error: null,
			message: null
		});
	});

	app.delete("/api/boards/:board_id/columns/:column_id", (req, res) => {
		const { board_id, column_id } = req.params;

		board_list = board_list.map(board => {
			if(board.id === board_id){
				return {
					...board,
					columns: board.columns.filter(column => column.id !== column_id)
				}
			}

			return board;
		})

		res.jsonp({
			status: true,
			result: null,
			error: null,
			message: "Column deleted successfully"
		});
	});

	app.delete("/api/boards/:board_id", (req, res) => {
		const { board_id } = req.params;

		board_list = board_list.filter(board => board.id !== board_id);

		res.jsonp({
			status: true,
			result: null,
			error: null,
			message: "Board deleted successfully"
		});
	});
}
