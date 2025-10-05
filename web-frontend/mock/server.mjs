/* eslint-disable no-magic-numbers */
import jsonServer from "json-server";
import boardRoutes from "./routes/board.route.mjs";

const server = jsonServer.create();
const middlewares = jsonServer.defaults({ noCors: true });
const PORT = 3001;

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	res.header("Access-Control-Allow-Headers", "*");
	res.header("Access-Control-Allow-Methods", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
	next();
});

/* ROUTES */
boardRoutes(server);

server.listen(PORT, () => {
	console.log(`JSON Server is running at PORT: ${PORT}`);
});
