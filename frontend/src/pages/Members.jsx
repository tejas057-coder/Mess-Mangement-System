import { useEffect, useState } from "react";

function Members() {
  // const members = [
  //   {
  //     id: 1,
  //     // name: "Rahul Sharma",
  //     room: "101",
  //     phone: "9876543210",
  //     status: "Active",
  //   },
  //   {
  //     id: 2,
  //     // name: "Amit Verma",
  //     room: "102",
  //     phone: "9876501234",
  //     status: "Active",
  //   },
  //   {
  //     id: 3,
  //     // name: "Rohit Patil",
  //     room: "103",
  //     phone: "9876512345",
  //     status: "Pending",
  //   },
  //   {
  //     id: 4,
  //     // name: "Sahil Gupta",
  //     room: "104",
  //     phone: "9876523456",
  //     status: "Active",
  //   },
  // ];

   const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.log(err));
  }, []);



  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h1 style={styles.heading}>Members</h1>

        <button style={styles.button}>
          + Add Member
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Mobile Number</th>
            <th style={styles.th}>Starting Date</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td style={styles.td}>{member.id}</td>
              <td style={styles.td}>{member.name}</td>
              <td style={styles.td}>{member.phone}</td>
              <td style={styles.td}>{member.starting_date} </td>
            </tr>
          ))}
        </tbody>
      </table>

      
      
    </div >
  );
}


const styles = {
  container: {
    padding: "20px",
  },

  heading: {
    fontSize: "30px",
    fontWeight: "bold",
    marginBottom: "25px",
    color: "#1f2937",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  th: {
    background: "#2563eb",
    color: "white",
    padding: "15px",
    textAlign: "left",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #eee",
  },

  active: {
    color: "green",
    fontWeight: "bold",
  },

  pending: {
    color: "orange",
    fontWeight: "bold",
  },
};


export default Members;