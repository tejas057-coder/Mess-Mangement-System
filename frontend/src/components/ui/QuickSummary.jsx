const QuickSummary = () => {
  const occupancy = 79.6;

  return (
    <div style={styles.summaryCard}>
      <h3 style={styles.summaryTitle}>Quick Summary</h3>

      <p style={styles.summarySubtitle}>
        Today's mess statistics
      </p>

      <div style={styles.summaryItem}>
        <span>🥗 Veg Meals</span>
        <strong style={styles.summaryItemValue}>64</strong>
      </div>

      <div style={styles.summaryItem}>
        <span>🍗 Non Veg Meals</span>
        <strong style={styles.summaryItemValue}>38</strong>
      </div>

      <div style={styles.summaryItem}>
        <span>🚫 Absent Today</span>
        <strong style={styles.summaryItemValue}>26</strong>
      </div>

      <div style={styles.occupancy}>
        <div style={styles.occupancyHeader}>
          <span>Occupancy</span>
          <strong style={styles.summaryItemValue}>{occupancy}%</strong>
        </div>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${occupancy}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};



const styles = {
  summaryCard: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    borderRadius: "18px",
    padding: "22px",
  },

  summaryTitle: {
    margin: 0,
  },

  summarySubtitle: {
    color: "rgba(255,255,255,.8)",
    margin: "8px 0 22px",
  },

  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  summaryItemValue: {
    fontSize: "18px",
  },

  occupancy: {
    marginTop: "20px",
  },

  occupancyHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  progressBar: {
    height: "10px",
    background: "rgba(255,255,255,.25)",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "white",
    borderRadius: "20px",
  },
};



export default QuickSummary;