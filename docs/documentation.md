# DecentraNet POC — Documentation Report

## 1. Introduction

DecentraNet is a proof-of-concept decentralized cloud platform built for CraftValley Hub. It demonstrates how three regional compute nodes can be connected over a Cisco-routed network, managed by a Python/FastAPI application layer, and monitored through a real-time React dashboard. The project simulates a distributed infrastructure on a single machine, showcasing OSI Layer 1-7 concepts through a unified demonstration.

## 2. Skill Outcome

This project demonstrates the student's ability to design and implement a multi-layer network infrastructure encompassing:

- Network layer configuration (OSPF, NAT, ACLs, PPP/CHAP) in Cisco Packet Tracer
- REST API development with FastAPI for node registration, heartbeat, and lifecycle management
- Real-time frontend monitoring with React and Vite
- Containerization with Docker and multi-service orchestration with Docker Compose
- Understanding of distributed systems concepts including heartbeat-based failure detection

## 3. Problem Statement

CraftValley Hub needs a way to demonstrate how decentralized compute resources can be managed and monitored across geographically separated sites. The challenge is to show how network routing, application-layer node management, and real-time monitoring work together as a cohesive system without requiring actual cloud infrastructure.

## 4. Problem Effect

Without this demonstrator, stakeholders cannot visualize how a decentralized cloud platform operates. The abstract concepts of OSPF routing, node heartbeats, and network health monitoring remain disconnected. This makes it difficult to communicate the value proposition of a decentralized architecture to non-technical decision-makers.

## 5. Proposed Solution

DecentraNet addresses this with three integrated layers:

- **Network Layer**: A Cisco Packet Tracer topology with three routers running OSPF, connected over serial WAN links with PPP/CHAP authentication, NAT overload, and ACL security.
- **Application Layer**: A Python FastAPI backend that maintains an in-memory registry of three nodes, handles heartbeat events, randomizes resource metrics, and detects node failures through a background monitor.
- **Monitoring Layer**: A React/Vite dashboard that polls the backend every 3 seconds, displaying node status, resource utilization, and an SVG network topology map.

## 6. Network Design

### Topology

The network consists of three sites: Headquarters (HQ), Region A, and Region B. Each site has a router and a LAN segment. HQ connects to both remote sites via serial WAN links.

### OSPF over Static Routing

OSPF (Open Shortest Path First) was chosen over static routing because:

- It provides automatic route discovery and convergence when links change
- It demonstrates a real-world IGP (Interior Gateway Protocol) used in enterprise networks
- It scales better than static routing when additional nodes would be added

All three routers participate in OSPF Process 1, Area 0 (backbone area).

### PAT (NAT Overload)

Port Address Translation was chosen because:

- It allows all three LAN subnets to share a single public IP address for outbound traffic
- It conserves IPv4 address space, demonstrating real-world ISP constraints
- ACL 1 is used to identify which internal networks are eligible for translation

### ACL Rules

Extended ACL 100 blocks Telnet (TCP port 23) inbound on R-HQ's WAN interfaces. This demonstrates:

- Security best practices by restricting management access
- Understanding of extended ACL syntax (protocol, source, destination, port)
- Application of ACLs in the correct direction (inbound on external interfaces)

## 7. Application Layer Design

### Heartbeat Mechanism

The heartbeat system maps to real distributed systems concepts seen in etcd, Consul, and Kubernetes:

- Nodes periodically send heartbeats to the central registry, simulating liveness probes
- Resource metrics (CPU, memory, storage, uptime) are randomized on each heartbeat to simulate realistic telemetry
- The background monitor implements a failure detection window (10s degraded, 15s offline) similar to real-world leader election timeouts

This models a control plane pattern where a central coordinator maintains cluster state without requiring a distributed consensus protocol — appropriate for a POC.

## 8. Mapping to OSI Model

| OSI Layer | What Covers It |
|-----------|---------------|
| Layer 1 — Physical | Serial/Ethernet cables in Packet Tracer |
| Layer 2 — Data Link | PPP encapsulation on WAN links |
| Layer 3 — Network | OSPF routing, IP addressing, NAT |
| Layer 4 — Transport | TCP/UDP implicit in Packet Tracer pings and ACL port rules |
| Layer 5 — Session | PPP CHAP authentication session |
| Layer 6 — Presentation | Not explicitly demonstrated (noted in limitations) |
| Layer 7 — Application | Python FastAPI node registry and heartbeat system |

## 9. Limitations

- **Simulated environment**: The Packet Tracer network does not physically exist — it is a software simulation. Pings, routing updates, and link states are emulated.
- **No real integration**: The Python backend does not actually communicate with the Packet Tracer topology. Node IPs are configured to match but there is no live network probing.
- **No database**: All node state is held in memory and lost on restart. This is intentional for a POC but not production-ready.
- **No WebSockets**: The dashboard uses polling (3-second intervals) rather than push-based updates, which is less efficient but simpler to implement.
- **Layer 6 gap**: The Presentation Layer (encryption, encoding) is not explicitly demonstrated in this project.

## 10. Conclusion

DecentraNet successfully demonstrates a multi-layer decentralized cloud platform concept. The project bridges network infrastructure (OSPF, NAT, PPP/CHAP), application services (FastAPI node management), and user interface (React dashboard) into a single coherent demonstration. It provides CraftValley Hub with a tangible artifact for illustrating how distributed compute resources can be orchestrated and monitored across geographically separated sites.
