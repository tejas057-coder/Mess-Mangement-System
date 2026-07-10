import { FaUsers, FaBed, FaRupeeSign, FaUtensils } from "react-icons/fa";

function Card({ totalMembers, availableRooms, monthlyRevenue, mealsToday }) {
  const cards = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: <FaUsers />,
      color: "linear-gradient(135deg, #b46ac9, #8b5cf6)",
    },
    {
      title: "Available Rooms",
      value: availableRooms,
      icon: <FaBed />,
      color: "linear-gradient(135deg, #7dd37f, #22c55e)",
    },
    {
      title: "Monthly Revenue",
      value: `₹${monthlyRevenue}`,
      icon: <FaRupeeSign />,
      color: "linear-gradient(135deg, #76b7e8, #3b82f6)",
    },
    {
      title: "Meals Today",
      value: mealsToday,
      icon: <FaUtensils />,
      color: "linear-gradient(135deg, #df6c9d, #e11d48)",
    },
  ];

  return (
    <div style={styles.container}>
      {cards.map((card) => (
        <div key={card.title} style={{ ...styles.card, background: card.color }}>
          <div style={styles.left}>
            <span style={styles.title}>{card.title}</span>
            <span style={styles.value}>{card.value}</span>
          </div>

          <div style={styles.iconBox}>{card.icon}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    margin: "20px 10px 0",
  },
  card: {
    position: "relative",
    minHeight: "100px",
    borderRadius: "28px",
    padding: "22px",
    color: "#fff",
    overflow: "hidden",
    boxShadow: "0 18px 30px rgba(15, 23, 42, 0.16)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1,
  },
  title: {
    fontSize: "16px",
    fontWeight: 700,
    opacity: 0.96,
    letterSpacing: "0.01em",
  },
  value: {
    fontSize: "54px",
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },
  iconBox: {
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: "26px",
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(8px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
    zIndex: 1,
  },
};

export default Card;