const STATUS_COLORS = {
  healthy: 'var(--online)',
  degraded: 'var(--degraded)',
  critical: 'var(--offline)',
}

export default function StatusBar({ summary }) {
  if (!summary) return null

  const healthColor = STATUS_COLORS[summary.network_health] || 'var(--text-muted)'

  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <span className="status-bar__title">DECENTRANET // NODE MONITOR</span>
      </div>
      <div className="status-bar__center">
        <span>NODES: {summary.online}/{summary.total_nodes} ONLINE</span>
      </div>
      <div className="status-bar__right" style={{ color: healthColor }}>
        <span>NETWORK: {summary.network_health.toUpperCase()}</span>
      </div>
      <div className="status-bar__scan" />
    </div>
  )
}
