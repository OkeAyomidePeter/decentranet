const STATUS_COLORS = {
  online: 'var(--online)',
  offline: 'var(--offline)',
  degraded: 'var(--degraded)',
}

function formatTimestamp(ts) {
  if (ts === null || ts === undefined) return 'never'
  const seconds = Math.floor((Date.now() / 1000) - ts)
  if (seconds < 0) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}

function ResourceBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="node-card__resource">
      <div className="node-card__resource-label">
        <span>{label}</span>
        <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
      </div>
      <div className="node-card__resource-track">
        <div
          className="node-card__resource-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function NodeCard({ node, onHeartbeat, onKill }) {
  const statusColor = STATUS_COLORS[node.status] || 'var(--text-muted)'
  const isBlinking = node.status === 'online'
  const isOffline = node.status === 'offline'

  return (
    <div
      className="node-card"
      data-offline={isOffline || undefined}
    >
      <div className="node-card__header">
        <h2 className="node-card__name">{node.name}</h2>
        <span className="node-card__region">{node.region}</span>
      </div>

      <div className="node-card__status-row">
        <span
          className="node-card__dot"
          style={{
            background: statusColor,
            animation: isBlinking ? 'blink 1.2s infinite' : 'none',
          }}
        />
        <span style={{ color: statusColor, textTransform: 'uppercase' }}>
          {node.status}
        </span>
      </div>

      <div className="node-card__details">
        <div className="node-card__detail">
          <span className="node-card__detail-label">SUBNET</span>
          <span>{node.subnet}</span>
        </div>
        <div className="node-card__detail">
          <span className="node-card__detail-label">NODE IP</span>
          <span>{node.node_ip}</span>
        </div>
        <div className="node-card__detail">
          <span className="node-card__detail-label">HEARTBEAT</span>
          <span>{formatTimestamp(node.last_heartbeat)}</span>
        </div>
      </div>

      <div className="node-card__resources">
        <ResourceBar
          label="CPU"
          value={node.resources.cpu_usage}
          max={100}
          color="var(--online)"
        />
        <ResourceBar
          label="MEM"
          value={node.resources.memory_usage}
          max={100}
          color="var(--degraded)"
        />
        <ResourceBar
          label="STO"
          value={node.resources.storage_used_gb}
          max={500}
          color="var(--text-muted)"
        />
      </div>

      <div className="node-card__actions">
        <button
          className="node-card__btn"
          onClick={() => onHeartbeat(node.id)}
        >
          [ SEND HEARTBEAT ]
        </button>
        <button
          className="node-card__btn node-card__btn--kill"
          onClick={() => onKill(node.id)}
        >
          [ KILL NODE ]
        </button>
      </div>
    </div>
  )
}
