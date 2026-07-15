import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import DashboardLayout from "./components/DashboardLayout";
import Maincontenet from "./pages/Maincontenet";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Billing from "./pages/Billing";
import Menu from "./pages/Menu";
import Settings from "./pages/Settings";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route element={<Maincontenet />}>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/members"    element={<Members />} />
              <Route path="/billing"    element={<Billing />} />
              <Route path="/menu"       element={<Menu />} />
              <Route path="/attendance" element={<Menu />} />
              <Route path="/settings"   element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
    </ThemeProvider>
  );
}

export default App;