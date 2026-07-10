import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;