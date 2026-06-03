import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
// Use the root directory pola-db.json
const router = jsonServer.router(path.join(__dirname, '../pola-db.json'));
const middlewares = jsonServer.defaults();

// Enable CORS
server.use(middlewares);

// Setup custom routes if needed
// We want /api/registrations to map to /registrations in the DB
server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}));

server.use(router);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
