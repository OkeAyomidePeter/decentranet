function getStatusColor(node) {
  if (!node) return 'var(--offline)'
  if (node.status === 'online') return 'var(--online)'
  if (node.status === 'degraded') return 'var(--degraded)'
  return 'var(--offline)'
}

function isOnline(node) {
  return node && node.status === 'online'
}

export default function NetworkMap({ nodes }) {
  const nodeMap = {}
  if (nodes) {
    nodes.forEach((n) => { nodeMap[n.id] = n })
  }

  const hq = nodeMap['node-hq']
  const nodeA = nodeMap['node-a']
  const nodeB = nodeMap['node-b']

  const linkAColor = isOnline(hq) && isOnline(nodeA) ? 'var(--online)' : 'var(--offline)'
  const linkBColor = isOnline(hq) && isOnline(nodeB) ? 'var(--online)' : 'var(--offline)'

  return (
    <div className="network-map">
      <svg viewBox="0 0 600 320" className="network-map__svg">
        <defs>
          <marker id="arrow-on" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--online)" />
          </marker>
          <marker id="arrow-off" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--offline)" />
          </marker>
        </defs>

        <line
          x1="150" y1="100" x2="300" y2="200"
          stroke={linkAColor}
          strokeWidth="2"
          markerEnd={isOnline(hq) && isOnline(nodeA) ? 'url(#arrow-on)' : 'url(#arrow-off)'}
        />
        <text x="170" y="140" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
          PPP/CHAP | OSPF
        </text>
        <text x="170" y="152" fill={linkAColor} fontSize="9" fontFamily="var(--font-mono)">
          10.0.12.0/30
        </text>

        <line
          x1="450" y1="100" x2="300" y2="200"
          stroke={linkBColor}
          strokeWidth="2"
          markerEnd={isOnline(hq) && isOnline(nodeB) ? 'url(#arrow-on)' : 'url(#arrow-off)'}
        />
        <text x="330" y="140" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
          PPP/CHAP | OSPF
        </text>
        <text x="330" y="152" fill={linkBColor} fontSize="9" fontFamily="var(--font-mono)">
          10.0.13.0/30
        </text>

        <circle cx="150" cy="100" r="18" fill={getStatusColor(nodeA)} opacity="0.9" />
        <circle cx="150" cy="100" r="14" fill="var(--bg)" />
        <circle cx="150" cy="100" r="10" fill={getStatusColor(nodeA)} />
        <text x="150" y="135" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
          Node-A
        </text>
        <text x="150" y="148" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
          192.168.20.0/24
        </text>

        <circle cx="450" cy="100" r="18" fill={getStatusColor(nodeB)} opacity="0.9" />
        <circle cx="450" cy="100" r="14" fill="var(--bg)" />
        <circle cx="450" cy="100" r="10" fill={getStatusColor(nodeB)} />
        <text x="450" y="135" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
          Node-B
        </text>
        <text x="450" y="148" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
          192.168.30.0/24
        </text>

        <circle cx="300" cy="200" r="22" fill={getStatusColor(hq)} opacity="0.9" />
        <circle cx="300" cy="200" r="17" fill="var(--bg)" />
        <circle cx="300" cy="200" r="12" fill={getStatusColor(hq)} />
        <text x="300" y="240" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
          HQ (R-HQ)
        </text>
        <text x="300" y="253" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
          192.168.10.0/24
        </text>
      </svg>
    </div>
  )
}
