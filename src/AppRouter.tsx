import * as React from 'react';
import { RouterProvider, Outlet, createHashRouter } from 'react-router-dom';

// Layout & Pages
import Layout from './components/Layout/Index';
import ModernDashboard from './components/Dashboard/Index';
import ProjectDetails from './components/Detail Page/Index';
import ReportpowerBi from './components/PowerBI/ReportpowerBi';

export default function AppRouter() {
  const routes = [
    {
      element: <Layout><Outlet /></Layout>,
      children: [
        { path: '/', element: <ModernDashboard /> },
        { path: '/details/:projectId', element: <ProjectDetails /> },
        { path: '/power-bi', element: <ReportpowerBi /> }, // <-- Power BI route
      ],
    },
  ];

  const router = createHashRouter(routes);
  return <RouterProvider router={router} />;
}
