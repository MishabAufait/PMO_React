import * as React from 'react'
import Sidebar from './Sidebar'

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100%', background: '#f6f7fb' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 16 }}>
        {children}
      </main>
    </div>
  )
}


