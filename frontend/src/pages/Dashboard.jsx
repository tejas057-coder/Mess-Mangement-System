import React from "react";
import Card from "../components/ui/Card";
import RecentMembers from "../components/ui/RecentMembers";
import MemberGrowth from "../components/ui/MemberGrowth";
import QuickSummary from "../components/ui/QuickSummary";

const Dashboard = () => {
  return (
    <div style={styles.page}>
      <Card />

      <div style={styles.dashboard}>
        <div style={styles.dashboardLeft}>
          <RecentMembers />
        </div>

        <div style={styles.dashboardRight}>
          <MemberGrowth />
          <QuickSummary />
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: "#ffffff",
    minHeight: "100vh",
    maxHeight:"200vh",
    padding: "24px",
  },

  dashboard: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
    marginTop: "24px",
    alignItems: "start",
  },

  dashboardLeft: {
    display: "flex",
    flexDirection: "column",
  },

  dashboardRight: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
};

export default Dashboard;