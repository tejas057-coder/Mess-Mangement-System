import {
  FaUsers,
  FaBed,
  FaRupeeSign,
  FaUtensils,
} from "react-icons/fa";

function Card() {
  const cards = [
    {
      title: "Total Members",
      value: "120",
      icon: <FaUsers />,
      color: "#2563eb",
    },
    {
      title: "Available Rooms",
      value: "45",
      icon: <FaBed />,
      color: "#16a34a",
    },
    {
      title: "Monthly Revenue",
      value: "₹52,300",
      icon: <FaRupeeSign />,
      color: "#f59e0b",
    },
    {
      title: "Meals Today",
      value: "108",
      icon: <FaUtensils />,
      color: "#ef4444",
    },
  ];

  

  return (
    <div style={styles.container}>
      {cards.map((card) => (
        <div key={card.title} style={styles.card}>
          <div style={styles.left}>
            <span style={styles.title}>{card.title}</span>
            <span style={styles.value}>{card.value}</span>
          </div>

          <div
            style={{
              ...styles.iconBox,
              background: card.color,
            }}
              >{card.icon}
            </div>
        </div>
      ))}
    </div>
  );
}



const styles = {
    container: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "20px",
        marginTop: "20px",
      margin :"10px",
    },

    card: {
      background: "#fff",
      borderRadius: "18px",
      padding: "25px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      transition: "0.3s",
    },

    left: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    title: {
      fontSize: "15px",
      color: "#6b7280",
      fontWeight: "500",
    },

    value: {
      fontSize: "30px",
      fontWeight: "700",
      color: "#111827",
    },

    iconBox: {
      width: "65px",
      height: "65px",
      borderRadius: "15px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontSize: "28px",
    },
  };

export default Card;