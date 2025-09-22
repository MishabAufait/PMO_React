import * as React from 'react'
import { HomeOutlined } from '@ant-design/icons'

export default function Sidebar() {
  return (
    <aside style={{ width: 72, background: '#ffffff', borderRight: '1px solid #eef0f4', paddingTop: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1677ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          PM
        </div>
        <HomeOutlined style={{ fontSize: 20, color: '#6b7280' }} />
      </div>
    </aside>
  )
}


