# DecentraNet POC

DecentraNet is a proof-of-concept decentralized cloud platform demonstrating how three regional compute nodes connect over a Cisco-routed network, managed by a Python/FastAPI backend, and monitored via a React/Vite dashboard. This is a concept demonstrator — not an MVP.

## Project Structure

```
decentranet-poc/
├── network/
│   ├── decentranet.pkt          # Cisco Packet Tracer topology file
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── NodeCard.jsx
│   │   │   ├── NetworkMap.jsx
│   │   │   └── StatusBar.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
├── docs/
│   └── documentation.md         # Written report for submission
├── docker-compose.yml
└── README.md
```

## Requirements

- **Cisco Packet Tracer** (for the `.pkt` network simulation file)
- **Docker + Docker Compose** (recommended for running backend + frontend)
- **OR**: Python 3.11+ and Node 20+ (if running without Docker)

## Running with Docker

```bash
git clone <repo>
cd decentranet-poc
docker compose up
```

Then open **http://localhost:3000** in your browser.

## Running without Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000**.

## Opening the Network Simulation

1. Install [Cisco Packet Tracer](https://www.netacad.com/courses/packet-tracer)
2. Open `network/decentranet.pkt`
3. Verify OSPF neighbors with `show ip ospf neighbor` on R-HQ

## How to Demo It

1. Open the dashboard at **http://localhost:3000**
2. All nodes start **offline**
3. Click `[ SEND HEARTBEAT ]` on each node to bring them online
4. Watch the network map update in real time
5. Click `[ KILL NODE ]` to simulate a link failure
6. Watch the node go **degraded** then **offline** automatically
