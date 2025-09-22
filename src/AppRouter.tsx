import * as React from 'react'
import { RouterProvider, Outlet, createHashRouter } from 'react-router-dom'

// Layout & Pages
import Layout from './components/Layout/Index'
import ModernDashboard from './components/Dashboard/Index'

export default function AppRouter() {
  const routes = [
    {
      element: <Layout><Outlet /></Layout>,
      children: [
        { path: '/', element: <ModernDashboard /> },
      ],
    },
  ]

  const router = createHashRouter(routes)
  return <RouterProvider router={router} />
}
