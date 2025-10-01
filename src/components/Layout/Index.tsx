import * as React from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const location = useLocation();

  const isDetailsPage = location.pathname.startsWith("/details/");
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: isDetailsPage ? "#fff" : "#f6f7fb",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, padding: 0 }}>
        <div style={{ margin: '0 auto', padding: '20px 24px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
