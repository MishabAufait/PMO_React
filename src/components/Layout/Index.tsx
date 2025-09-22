import * as React from 'react'
import Sidebar from './Sidebar'

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f7fb', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 0 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 24px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}


