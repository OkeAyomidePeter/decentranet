import { useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import StatusBar from './components/StatusBar.jsx'
import NodeCard from './components/NodeCard.jsx'
import NetworkMap from './components/NetworkMap.jsx'
import './index.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [nodes, setNodes] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [nodesRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/nodes`),
        fetch(`${API_BASE}/network/summary`),
      ])
      if (!nodesRes.ok || !summaryRes.ok) throw new Error('Backend unavailable')
      setNodes(await nodesRes.json())
      setSummary(await summaryRes.json())
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleHeartbeat = useCallback(async (nodeId) => {
    try {
      await fetch(`${API_BASE}/nodes/${nodeId}/heartbeat`, { method: 'POST' })
      await fetchData()
    } catch {
      // ignore
    }
  }, [fetchData])

  const handleKill = useCallback(async (nodeId) => {
    try {
      await fetch(`${API_BASE}/nodes/${nodeId}/heartbeat`, { method: 'DELETE' })
      await fetchData()
    } catch {
      // ignore
    }
  }, [fetchData])

  if (error) {
    return (
      <div className="app-loading">
        <span style={{ color: 'var(--offline)' }}>BACKEND OFFLINE — {error}</span>
      </div>
    )
  }

  if (!nodes) {
    return (
      <div className="app-loading">
        <span>CONNECTING...</span>
      </div>
    )
  }

  return (
    <div className="app">
      <StatusBar summary={summary} />
      <main className="app__grid">
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            onHeartbeat={handleHeartbeat}
            onKill={handleKill}
          />
        ))}
      </main>
      <NetworkMap nodes={nodes} />
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
