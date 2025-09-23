import * as React from 'react'
import { RouterProvider, Outlet, createHashRouter } from 'react-router-dom'

// Layout & Pages
import Layout from './components/Layout/Index'
import ModernDashboard from './components/Dashboard/Index'
import ProjectDetails from './components/Detail Page/Index'


export default function AppRouter() {
  const routes = [
    {
      element: <Layout><Outlet /></Layout>,
      children: [
        { path: '/', element: <ModernDashboard /> },
        { path: '/details/:projectId', element: <ProjectDetails projectId={1}/> },
      ],
    },
  ]

  const router = createHashRouter(routes)
  return <RouterProvider router={router} />
}
