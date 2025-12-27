import jsonServer from "json-server";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "../db/db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// endpoint test
server.get("/", (req, res) => {
  res.json({ status: "JSON Server running" });
});

server.use("/api", router);

server.listen(3001, () => {
  console.log("🚀 JSON Server running at http://localhost:3001");
});
