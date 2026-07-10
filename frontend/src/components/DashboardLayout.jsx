import Sidebar from './Sidebar'
import { Outlet } from "react-router-dom";

function DashboardLayout() {
    return (
        <div style={layoutStyles.appLayout}>
            <Sidebar />
            <main style={layoutStyles.appMain}>
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;

const layoutStyles = {
    appLayout: {
        display: "flex",
        minHeight: "100dvh",
        background: "#f8fafc",
    },
    appMain: {
        flex: 1,
        minWidth: 0,
        overflowX: "hidden",
        padding: window.innerWidth < 768 ? "76px 12px 16px" : "24px",
    },
};