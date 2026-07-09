import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Members from "./pages/Members.jsx";
import Billing from './pages/Billing.jsx'
import Attendance from "./pages/Attendence.jsx"
import Settings from "./pages/Settings.jsx"


function App() {
  return (

      <BrowserRouter>
     
      <div style={styles.container}>
        <Sidebar />

          <div style={styles.right}>
          <Navbar />
          
            <Routes >
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

      </div>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
        
         </BrowserRouter>
  );
}


const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f5f7fb",
  },

  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
};


export default App;













//     https://www.figma.com/make/Nr7dbO73Ofma2CWwEL43hI/Design-Mess-Management-Dashboard?t=ERW70XN9iKnuNU8D-0