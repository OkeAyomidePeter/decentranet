# DecentraNet POC — Project Specification
> Practical Skills Assessment | IRT-242 Inter Routing Technology  
> Client: CraftValley Hub | Student: Peter (Invictus)

---

## Overview

DecentraNet is a proof-of-concept decentralized cloud platform. Three regional compute nodes are connected over a simulated Cisco network (Packet Tracer), managed by a Python/FastAPI backend, and monitored via a React/Vite dashboard. Everything runs locally on one machine.

This is not an MVP. It is a concept demonstrator. The goal is to show:
- Network layer: OSPF routing, NAT, ACLs, PPP/CHAP (Packet Tracer)
- Application layer: node registration, heartbeat, lifecycle (Python)
- Monitoring layer: real-time node status dashboard (React)

---

## Repository Structure

```
decentranet-poc/
├── network/
│   └── decentranet.pkt          # Cisco Packet Tracer topology file
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

---

## Network Layer (Packet Tracer — Reference Only)

> This layer is pre-built manually. The coding agent does not touch the PKT file.
> The node IPs below must match exactly what is configured in the PKT file.

### Node Subnet Map

| Node | Site | Subnet | Router LAN IP | PC IP |
|------|------|--------|--------------|-------|
| node-hq | HQ | 192.168.10.0/24 | 192.168.10.1 | 192.168.10.10 |
| node-a | Node-A | 192.168.20.0/24 | 192.168.20.1 | 192.168.20.10 |
| node-b | Node-B | 192.168.30.0/24 | 192.168.30.1 | 192.168.30.10 |

### WAN Links

| Link | Subnet | HQ End | Remote End |
|------|--------|--------|------------|
| HQ ↔ NodeA | 10.0.12.0/30 | 10.0.12.1 | 10.0.12.2 |
| HQ ↔ NodeB | 10.0.13.0/30 | 10.0.13.1 | 10.0.13.2 |

### Protocols Configured in PKT

- **OSPF** — Process 1, Area 0, all three routers
- **PPP with CHAP** — On all serial WAN links, password: `decentranet`
- **NAT Overload (PAT)** — On R-HQ, ACL 1 covers all three LAN subnets
- **Extended ACL 100** — Blocks Telnet (port 23) inbound on R-HQ WAN interfaces
- **Clock rate** — 64000 on both DCE ends (R-HQ serial interfaces)

---

## Backend Specification (Python / FastAPI)

### Runtime

- Python 3.11+
- FastAPI
- Uvicorn
- No database — state lives in memory (this is a POC)

### requirements.txt

```
fastapi==0.111.0
uvicorn==0.29.0
```

### Node Data Model

Each node is a dictionary with the following shape:

```python
{
    "id": str,               # "node-hq" | "node-a" | "node-b"
    "name": str,             # Display name e.g. "HQ Node"
    "subnet": str,           # "192.168.10.0/24"
    "router_ip": str,        # "192.168.10.1"
    "node_ip": str,          # "192.168.10.10"
    "region": str,           # "Headquarters" | "Region A" | "Region B"
    "status": str,           # "online" | "offline" | "degraded"
    "last_heartbeat": float, # Unix timestamp, None if never seen
    "registered_at": float,  # Unix timestamp
    "resources": {
        "cpu_usage": float,  # 0-100, randomized on heartbeat
        "memory_usage": float,
        "storage_used_gb": float,
        "uptime_seconds": int
    }
}
```

### Initial Node Seeds

Hardcode these three nodes at startup. They represent the three PKT sites:

```python
NODES = {
    "node-hq": {
        "id": "node-hq",
        "name": "HQ Node",
        "subnet": "192.168.10.0/24",
        "router_ip": "192.168.10.1",
        "node_ip": "192.168.10.10",
        "region": "Headquarters",
        "status": "offline",
        "last_heartbeat": None,
        "registered_at": time.time(),
        "resources": {
            "cpu_usage": 0,
            "memory_usage": 0,
            "storage_used_gb": 0,
            "uptime_seconds": 0
        }
    },
    "node-a": {
        "id": "node-a",
        "name": "Region A Node",
        "subnet": "192.168.20.0/24",
        "router_ip": "192.168.20.1",
        "node_ip": "192.168.20.10",
        "region": "Region A",
        "status": "offline",
        "last_heartbeat": None,
        "registered_at": time.time(),
        "resources": {
            "cpu_usage": 0,
            "memory_usage": 0,
            "storage_used_gb": 0,
            "uptime_seconds": 0
        }
    },
    "node-b": {
        "id": "node-b",
        "name": "Region B Node",
        "subnet": "192.168.30.0/24",
        "router_ip": "192.168.30.1",
        "node_ip": "192.168.30.10",
        "region": "Region B",
        "status": "offline",
        "last_heartbeat": None,
        "registered_at": time.time(),
        "resources": {
            "cpu_usage": 0,
            "memory_usage": 0,
            "storage_used_gb": 0,
            "uptime_seconds": 0
        }
    }
}
```

### API Endpoints

#### GET /nodes
Returns all nodes as a list.

```
Response 200:
[
  { ...node object },
  { ...node object },
  { ...node object }
]
```

#### GET /nodes/{node_id}
Returns a single node by ID.

```
Response 200: { ...node object }
Response 404: { "detail": "Node not found" }
```

#### POST /nodes/{node_id}/heartbeat
Simulates a node sending a heartbeat. Updates last_heartbeat, sets status to "online", randomizes resource metrics.

```
Response 200:
{
  "message": "Heartbeat received",
  "node_id": "node-hq",
  "timestamp": 1718000000.0
}
```

On heartbeat, generate random resources:
- cpu_usage: random float 5.0 to 85.0, rounded to 1 decimal
- memory_usage: random float 10.0 to 90.0, rounded to 1 decimal
- storage_used_gb: random float 50.0 to 480.0, rounded to 1 decimal
- uptime_seconds: increment by a random int between 10 and 60

#### GET /network/summary
Returns a summary of the overall network state.

```
Response 200:
{
  "total_nodes": 3,
  "online": int,
  "offline": int,
  "degraded": int,
  "network_health": "healthy" | "degraded" | "critical"
}
```

network_health logic:
- "healthy" if all 3 nodes online
- "degraded" if 1 or 2 nodes online
- "critical" if 0 nodes online

#### DELETE /nodes/{node_id}/heartbeat
Simulates a node going offline. Sets status to "offline", clears last_heartbeat.

```
Response 200:
{
  "message": "Node marked offline",
  "node_id": "node-a"
}
```

### Background Task — Heartbeat Monitor

Run a background thread that checks every 5 seconds. If a node's `last_heartbeat` is more than 15 seconds ago, set its status to "offline". If it is between 10 and 15 seconds ago, set it to "degraded".

```python
import threading, time

def monitor_nodes():
    while True:
        now = time.time()
        for node in NODES.values():
            if node["last_heartbeat"] is None:
                continue
            elapsed = now - node["last_heartbeat"]
            if elapsed > 15:
                node["status"] = "offline"
            elif elapsed > 10:
                node["status"] = "degraded"
        time.sleep(5)

threading.Thread(target=monitor_nodes, daemon=True).start()
```

### CORS

Enable CORS for all origins during development:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Run Command

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Dockerfile (backend)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Frontend Specification (React / Vite)

### Stack

- React 18
- Vite
- Plain CSS (no Tailwind, no component library)
- Fetch API for data (no axios)

### package.json dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.2.0"
  }
}
```

### Design Direction

**Aesthetic: Dark industrial terminal.** Like a real network operations center, not a SaaS dashboard.

- Background: near-black `#0a0c0f`
- Surface: dark panels `#111318`
- Border: subtle `#1e2228`
- Online accent: sharp green `#00ff88`
- Offline accent: muted red `#ff3b3b`
- Degraded accent: amber `#ffaa00`
- Text primary: `#e8eaed`
- Text muted: `#6b7280`
- Font: `'JetBrains Mono'` or `'Fira Code'` from Google Fonts for all text — monospace throughout
- No rounded corners on cards (sharp edges, 2px borders)
- Status indicators: blinking dot for online nodes
- No shadows — use border contrast instead

### Component Breakdown

#### App.jsx

Root component. Responsibilities:
- Fetch `/nodes` every 3 seconds using setInterval in useEffect
- Fetch `/network/summary` every 3 seconds
- Pass data down to child components
- Handle loading state (show "CONNECTING..." on first load)
- Layout: full viewport, dark background, top StatusBar, main grid of NodeCards, bottom NetworkMap

```
Layout:
┌─────────────────────────────────┐
│         StatusBar               │
├─────────────────────────────────┤
│  NodeCard  NodeCard  NodeCard   │
├─────────────────────────────────┤
│         NetworkMap              │
└─────────────────────────────────┘
```

#### StatusBar.jsx

Props: `{ summary }`

Displays across the top:
- Left: `DECENTRANET // NODE MONITOR` in monospace, small caps
- Center: `NODES: 3/3 ONLINE` or appropriate count
- Right: `NETWORK: HEALTHY` with color matching health status
- A thin animated scan line effect under the bar (CSS animation)

#### NodeCard.jsx

Props: `{ node, onHeartbeat, onKill }`

Displays:
- Node name in large mono text
- Region label
- Status indicator: blinking green dot if online, static red if offline, amber if degraded
- Subnet and node IP
- Resource bars (cpu, memory, storage) — thin horizontal bars, filled with accent color
- Last heartbeat timestamp (e.g. "2s ago" or "never")
- Two buttons:
  - `[ SEND HEARTBEAT ]` — calls POST /nodes/{id}/heartbeat
  - `[ KILL NODE ]` — calls DELETE /nodes/{id}/heartbeat
- When offline: card gets a subtle red border, opacity drops slightly
- Buttons are styled like terminal commands — monospace, bordered, no fill

#### NetworkMap.jsx

Props: `{ nodes }`

A simple SVG diagram showing the three nodes and their connections to HQ. Not an interactive graph library — hand-coded SVG.

Layout:
- HQ node in the center
- Node-A top-left, Node-B top-right
- Lines between HQ and each node
- Line color: green if both endpoints online, red if either offline
- Small circles at each node position, filled with status color
- Labels: node name + subnet below each circle
- WAN link labels: "PPP/CHAP | OSPF" on the lines

This does not need to be complex. It is a static SVG that reacts to node status colors. Keep it clean.

### API Base URL

```javascript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"
```

### Polling Logic in App.jsx

```javascript
useEffect(() => {
  const fetchData = async () => {
    const [nodesRes, summaryRes] = await Promise.all([
      fetch(`${API_BASE}/nodes`),
      fetch(`${API_BASE}/network/summary`)
    ])
    setNodes(await nodesRes.json())
    setSummary(await summaryRes.json())
  }
  fetchData()
  const interval = setInterval(fetchData, 3000)
  return () => clearInterval(interval)
}, [])
```

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
```

### Dockerfile (frontend)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

---

## Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
    restart: unless-stopped
```

---

## README.md Requirements

The README must include:

### Sections
1. **What is this** — 3 sentences max
2. **Project structure** — copy the folder tree from this spec
3. **Requirements**
   - Cisco Packet Tracer (for the .pkt file)
   - Docker + Docker Compose (for backend + frontend)
   - OR: Python 3.11+ and Node 20+ if running without Docker
4. **Running with Docker**
```bash
git clone <repo>
cd decentranet-poc
docker compose up
```
Then open http://localhost:3000

5. **Running without Docker**
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

6. **Opening the network simulation**
   - Install Cisco Packet Tracer
   - Open `network/decentranet.pkt`
   - Verify OSPF neighbors with `show ip ospf neighbor` on R-HQ

7. **How to demo it**
   - Open the dashboard at localhost:3000
   - All nodes start offline
   - Click SEND HEARTBEAT on each node to bring them online
   - Watch the network map update
   - Click KILL NODE to simulate a link failure
   - Watch the node go degraded then offline automatically

---

## Documentation Report (docs/documentation.md)

The documentation file is a written report for submission. It must cover:

1. **Introduction** — what DecentraNet is, what CraftValley Hub asked for
2. **Skill Outcome** — what the student demonstrates
3. **Problem Statement** — the network problem being solved
4. **Problem Effect** — what happens without this infrastructure
5. **Proposed Solution** — overview of all three layers
6. **Network Design** — explain the PKT topology, justify OSPF over static routing, explain why PAT was chosen, explain the ACL rules
7. **Application Layer Design** — explain why heartbeats map to real distributed systems concepts, explain the offline detection logic
8. **Mapping to OSI Model** — table showing which part of the project covers which OSI layer
9. **Limitations** — this is a simulation, the Python does not actually communicate with Packet Tracer, the network is emulated not real
10. **Conclusion** — what was achieved

---

## OSI Layer Coverage Map

| OSI Layer | What Covers It |
|-----------|---------------|
| Layer 1 — Physical | Serial/Ethernet cables in Packet Tracer |
| Layer 2 — Data Link | PPP encapsulation on WAN links |
| Layer 3 — Network | OSPF routing, IP addressing, NAT |
| Layer 4 — Transport | TCP/UDP implicit in Packet Tracer pings and ACL port rules |
| Layer 5 — Session | PPP CHAP authentication session |
| Layer 6 — Presentation | Not explicitly demonstrated (noted in limitations) |
| Layer 7 — Application | Python FastAPI node registry and heartbeat system |

---

## Build Order for Coding Agent

Follow this exact sequence:

1. Create folder structure
2. Write `backend/main.py` — seed nodes, all endpoints, background monitor, CORS
3. Write `backend/requirements.txt`
4. Write `backend/Dockerfile`
5. Write `frontend/package.json`
6. Write `frontend/vite.config.js`
7. Write `frontend/index.html` — load JetBrains Mono from Google Fonts here
8. Write `frontend/src/index.css` — global resets, CSS variables, base styles
9. Write `frontend/src/components/StatusBar.jsx`
10. Write `frontend/src/components/NodeCard.jsx`
11. Write `frontend/src/components/NetworkMap.jsx`
12. Write `frontend/src/App.jsx` — compose everything, polling logic
13. Write `frontend/Dockerfile`
14. Write `docker-compose.yml`
15. Write `README.md`
16. Write `docs/documentation.md`

Do not skip steps or reorder. The component files must exist before App.jsx imports them.

---

## Constraints and Rules

- No external UI libraries (no MUI, no Chakra, no Tailwind)
- No database — all state in memory in Python
- No WebSockets — polling only, every 3 seconds
- No TypeScript — plain JavaScript and Python only
- Frontend must work without Docker (npm run dev)
- Backend must work without Docker (uvicorn directly)
- The PKT file is not generated by code — it is a static file in `/network/`
- All node IPs must match the PKT file exactly
- CORS must be open (`*`) — this is a local development POC

---

*Spec version 1.0 — DecentraNet POC | IRT-242 | CraftValley Hub*
