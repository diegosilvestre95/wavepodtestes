import { fmt } from '../../lib/utils'

export default function StatCard({ label, value, subtext, color = 'var(--wp-yellow)', prefix = 'R$' }) {
  return (
    <div className="ipad-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="label-caps" style={{ color }}>{label}</div>
      <div className="value-xl">
        {prefix} {typeof value === 'number' ? fmt(value) : value}
      </div>
      {subtext && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{subtext}</div>}
      <div style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        width: 3, 
        background: color 
      }}></div>
    </div>
  )
}
