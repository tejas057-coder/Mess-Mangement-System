import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const Maincontenet = () => {
  return (
    <div style={styles.right}>
      <Navbar />
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

const styles = {
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
    minWidth: 0,
    overflowX: "hidden",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
    minWidth: 0,
  },
};

export default Maincontenet;