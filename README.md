# Haramayaa University Muslims Jame'a Registration

Full-stack web app to register, store, and list members.

- Frontend: `index1.html`, `style1.css`, `scrpt1.js`
- Backend: `server.js` (Express), data persisted to `data/registrations.json`

## Local Development
1. Install Node.js LTS
2. Install deps: `npm install`
3. Start server: `npm start`
4. Open: `http://localhost:3000/index1.html`

## API
- `GET /api/registrations` — list all
- `POST /api/register` — create a record

## Deployment
- Use `DATA_DIR` env var for persistent disk (e.g., `/data` on Render). Attach a Persistent Disk and set `DATA_DIR=/data`.
