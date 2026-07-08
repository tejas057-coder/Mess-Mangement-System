import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", members: 75 },
  { month: "Feb", members: 82 },
  { month: "Mar", members: 90 },
  { month: "Apr", members: 98 },
  { month: "May", members: 108 },
  { month: "Jun", members: 118 },
  { month: "Jul", members: 128 },
];

const MemberGrowth = () => {
  return (
    <div style={styles.growthCard}>
      <div style={styles.growthHeader}>
        <div>
          <h3 style={styles.growthHeaderTitle}>Member Growth</h3>
          <p style={styles.growthHeaderText}>Monthly active members</p>
        </div>

        <span style={styles.growthBadge}>+42%</span>
      </div>

      <h1 style={styles.growthNumber}>128</h1>

      <p style={styles.growthText}>Active Members</p>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <Tooltip />

            <Line
              type="monotone"
              dataKey="members"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


const styles = {
  growthCard: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
  },

  growthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  growthHeaderTitle: {
    margin: 0,
  },

  growthHeaderText: {
    color: "gray",
    marginTop: "4px",
  },

  growthBadge: {
    background: "#dbeafe",
    color: "#2563eb",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  growthNumber: {
    marginTop: "18px",
    fontSize: "42px",
  },

  growthText: {
    color: "gray",
    marginBottom: "18px",
  },

  chartContainer: {
    width: "100%",
    height: "180px",
  },
};


export default MemberGrowth;