import threading
import time
import random

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
            "uptime_seconds": 0,
        },
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
            "uptime_seconds": 0,
        },
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
            "uptime_seconds": 0,
        },
    },
}

app = FastAPI(title="DecentraNet API", version="1.0.0")


@app.get("/")
def root():
    return {"service": "DecentraNet API", "status": "running", "version": "1.0.0"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/nodes")
def get_nodes():
    return list(NODES.values())


@app.get("/nodes/{node_id}")
def get_node(node_id: str):
    node = NODES.get(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@app.post("/nodes/{node_id}/heartbeat")
def heartbeat(node_id: str):
    node = NODES.get(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")

    node["status"] = "online"
    node["last_heartbeat"] = time.time()
    node["resources"]["cpu_usage"] = round(random.uniform(5.0, 85.0), 1)
    node["resources"]["memory_usage"] = round(random.uniform(10.0, 90.0), 1)
    node["resources"]["storage_used_gb"] = round(random.uniform(50.0, 480.0), 1)
    node["resources"]["uptime_seconds"] += random.randint(10, 60)

    return {
        "message": "Heartbeat received",
        "node_id": node_id,
        "timestamp": time.time(),
    }


@app.get("/network/summary")
def network_summary():
    total = len(NODES)
    online = sum(1 for n in NODES.values() if n["status"] == "online")
    offline = sum(1 for n in NODES.values() if n["status"] == "offline")
    degraded = sum(1 for n in NODES.values() if n["status"] == "degraded")

    if online == total:
        health = "healthy"
    elif online > 0:
        health = "degraded"
    else:
        health = "critical"

    return {
        "total_nodes": total,
        "online": online,
        "offline": offline,
        "degraded": degraded,
        "network_health": health,
    }


@app.delete("/nodes/{node_id}/heartbeat")
def kill_node(node_id: str):
    node = NODES.get(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")

    node["status"] = "offline"
    node["last_heartbeat"] = None

    return {"message": "Node marked offline", "node_id": node_id}


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
