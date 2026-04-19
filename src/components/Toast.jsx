import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toasts } = useApp()
  return (
    <>
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span style={{ color: 'var(--green)', fontSize: 16 }}>{t.icon}</span>
          {t.msg}
        </div>
      ))}
    </>
  )
}
