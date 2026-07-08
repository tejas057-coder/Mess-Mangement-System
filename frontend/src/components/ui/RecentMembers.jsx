import { useEffect, useState } from "react";

const RecentMembers = () => {

       const [members, setMembers] = useState([]);
    
      useEffect(() => {
        fetch("http://localhost:5000/members")
          .then((res) => res.json())
          .then((data) => setMembers(data))
          .catch((err) => console.log(err));
      }, []);
    
    
    
 return (
    <div style={styles.recentMembers}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardHeaderTitle}>Recent Members</h2>
          <p style={styles.cardHeaderText}>Latest member registrations</p>
        </div>

        <button style={styles.viewBtn}>View All</button>
      </div>

      <table style={styles.table}>
        <thead style={styles.tableHead}>
          <tr>
            <th style={styles.th}>Serial No</th>
            <th style={styles.th}>Member</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Fee</th>
            <th style={styles.th}>Date</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member) => (
              <tr key={member.id} style={styles.tableRow}>
                  
              <td style={styles.td}>{member.id}</td>
              
              <td style={styles.td}>{member.name}</td>
             <td style={styles.td}>{member.phone}</td>
                  <td style={styles.td}>₹{member.fee}</td>
              <td style={styles.td}>{member.starting_date}</td>
                  
              <td style={styles.td}>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const styles = {
  recentMembers: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardHeaderTitle: {
    margin: 0,
  },

  cardHeaderText: {
    color: "gray",
    marginTop: "4px",
  },

  viewBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHead: {
    background: "#f8fafc",
  },

  th: {
    padding: "15px",
    textAlign: "left",
  },

  td: {
    padding: "15px",
    textAlign: "left",
  },

  tableRow: {
    borderTop: "1px solid #eee",
  },

  memberInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },

  status: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },

  active: {
    background: "#dcfce7",
    color: "#15803d",
  },

  pending: {
    background: "#fef3c7",
    color: "#b45309",
  },
};



export default RecentMembers;