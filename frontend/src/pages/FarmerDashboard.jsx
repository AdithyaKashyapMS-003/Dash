import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ScatterChart, Scatter
} from "recharts";
import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaChartBar,
  FaTasks,
  FaCalendarAlt,
  FaEnvelope,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaUserTie,
  FaSyncAlt
} from 'react-icons/fa';

export default function FarmerDashboard() {
  const [budgetFlows, setBudgetFlows] = useState([]);
  const [budgetFlows2, setBudgetFlows2] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "budgetFlows"), (snapshot) => {
      setBudgetFlows(snapshot.docs.map(doc => doc.data()));
    });

    const unsub2 = onSnapshot(collection(db, "budgetFlows2"), (snapshot) => {
      setBudgetFlows2(snapshot.docs.map(doc => doc.data()));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const filteredFlows = budgetFlows.filter(
    flow =>
      flow.from.toLowerCase().includes(search.toLowerCase()) ||
      flow.to.toLowerCase().includes(search.toLowerCase()) ||
      flow.amount.toString().includes(search)
  );

  const filteredFlows2 = budgetFlows2.filter(
    flow =>
      flow.from.toLowerCase().includes(search.toLowerCase()) ||
      flow.to.toLowerCase().includes(search.toLowerCase()) ||
      flow.amount.toString().includes(search)
  );

  // Only keep the latest actual amount per vendor
  const actualVendorMap = {};
  [...filteredFlows, ...filteredFlows2].forEach(flow => {
    if (flow.type === 'actual') {
      actualVendorMap[flow.to] = flow.amount;
    }
  });
  const actualFlows = Object.entries(actualVendorMap).map(([to, amount]) => ({ to, amount }));
  const chartData = actualFlows.map(flow => ({
    name: flow.to,
    amount: flow.amount
  }));

  const timeSeriesData = [...filteredFlows, ...filteredFlows2].reduce((acc, flow) => {
    const date = flow.date || "2023-09-13";
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.amount += flow.amount;
    } else {
      acc.push({ date, amount: flow.amount });
    }
    return acc;
  }, []);

  // Dynamically generate comparisonData from filtered budget flows
  const allFlows = [...filteredFlows, ...filteredFlows2];
  const departmentMap = {};
  allFlows.forEach(flow => {
    const dept = flow.to;
    if (!departmentMap[dept]) {
      departmentMap[dept] = { name: dept, planned: 0, actual: 0 };
    }
    if (flow.type === 'planned') {
      departmentMap[dept].planned += flow.amount;
    }
    if (flow.type === 'actual') {
      // Only keep the latest actual amount per vendor
      departmentMap[dept].actual = flow.amount;
    }
  });
  const comparisonData = Object.values(departmentMap).sort((a, b) => a.name.localeCompare(b.name));

  // Heatmap: frequency = number of actual modifications per vendor (uncertainty)
  const actualFrequencyMap = {};
  [...filteredFlows, ...filteredFlows2].forEach(flow => {
    if (flow.type === 'actual') {
      actualFrequencyMap[flow.to] = (actualFrequencyMap[flow.to] || 0) + 1;
    }
  });
  const heatmapData = Object.entries(actualVendorMap).map(([vendor, amount]) => ({ vendor, frequency: actualFrequencyMap[vendor] || 1 }));

  const users = [
    { name: "Hakeem Chan", email: "lobortis.augue@natque.com", id: "#9265", date: "03.26.2022", status: "Successful" },
    { name: "Orli J. Goodman", email: "pede@at.com", id: "#8545", date: "08.02.2021", status: "Pending" }
  ];

  const handleNodeClick = (flow) => {
    setSelectedFlow(flow);
  };

  const closeModal = () => {
    setSelectedFlow(null);
  };

  return (
  <div style={{
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: darkMode ? "#18181b" : "#e6f0ff"
  }}>
      {/* Sidebar */}
      <aside style={{
        width: "260px",
        backgroundColor: darkMode ? "#23272f" : "#0f172a",
        color: "#fff",
        padding: "20px",
        height: "128vh"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>DASHLY</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ padding: "12px 0", display: "flex", alignItems: "center", cursor: "pointer" }}>
            <FaChartBar style={{ marginRight: "10px" }} /> Dashboard
          </li>
          <li style={{ padding: "12px 0", display: "flex", alignItems: "center", cursor: "pointer" }}>
            <FaTasks style={{ marginRight: "10px" }} /> Projects
          </li>
          <li style={{ padding: "12px 0", display: "flex", alignItems: "center", cursor: "pointer" }}>
            <FaCalendarAlt style={{ marginRight: "10px" }} /> Calendar
          </li>
          <li style={{ padding: "12px 0", display: "flex", alignItems: "center", cursor: "pointer" }}>
            <FaEnvelope style={{ marginRight: "10px" }} /> Messages
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: "30px",
        backgroundColor: darkMode ? "#18181b" : undefined,
        color: darkMode ? "#f3f4f6" : undefined
      }}>
        {/* Top Bar */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "10px 15px 10px 40px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                width: "300px",
                fontSize: "14px",
                color: darkMode ? "#fff" : "#23272f",
                background: darkMode ? "#23272f" : "#fff"
              }}
            />
            <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: "18px" }} />
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: darkMode ? "#23272f" : "#fff",
                color: darkMode ? "#f3f4f6" : "#23272f",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <FaBell size={20} style={{ cursor: "pointer" }} />
            <FaUserCircle size={30} style={{ cursor: "pointer" }} />
          </div>
        </div>
        {/* Info Cards */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          {[
            {
              title: "Total Actual Budget",
              value: `$${actualFlows.reduce((sum, flow) => sum + flow.amount, 0)}`,
              subtitle: "Across all actual flows",
              icon: <FaMoneyBillWave size={28} style={{ color: "#10b981", marginBottom: 4 }} />
            },
            {
              title: "Actual Transactions",
              value: `${actualFlows.length}`,
              subtitle: "Ongoing actual budget activities",
              icon: <FaExchangeAlt size={28} style={{ color: "#3b82f6", marginBottom: 4 }} />
            },
            {
              title: "Top Actual Vendor",
              value: (() => {
                const vendorData = actualFlows.reduce((acc, flow) => {
                  acc[flow.to] = (acc[flow.to] || 0) + flow.amount;
                  return acc;
                }, {});
                const top = Object.entries(vendorData).sort((a, b) => b[1] - a[1])[0];
                return top ? `${top[0]} – $${top[1]}` : "No data";
              })(),
              subtitle: "Highest actual allocation",
              icon: <FaUserTie size={28} style={{ color: "#f7c948", marginBottom: 4 }} />
            },
            {
              title: "Adjustment Frequency",
              value: `${heatmapData.reduce((sum, item) => sum + item.frequency, 0)}`,
              subtitle: "Total adjustments recorded",
              icon: <FaSyncAlt size={28} style={{ color: "#ef4444", marginBottom: 4 }} />
            }
          ].map((card, idx) => (
            <div key={idx} style={{
              flex: 1,
              background: darkMode ? "#23272f" : "#fff",
              padding: "10px 8px",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: "100px",
              maxHeight: "120px",
              justifyContent: "center",
              overflow: "hidden"
            }}>
              <div style={{ marginBottom: 2 }}>{card.icon}</div>
              <h4 style={{ color: "#555", marginBottom: "4px", textAlign: "center", fontSize: "0.95rem", fontWeight: 600 }}>{card.title}</h4>
              <h2 style={{
                color: "#0077b6",
                textAlign: "center",
                fontSize: card.title === "Top Actual Vendor" ? "0.95rem" : "1.3rem",
                fontWeight: card.title === "Top Actual Vendor" ? 500 : 700,
                marginBottom: card.title === "Top Actual Vendor" ? "2px" : "6px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%"
              }}>{card.value}</h2>
              <small style={{
                color: "#888",
                textAlign: "center",
                fontSize: card.title === "Top Actual Vendor" ? "0.7rem" : "0.85rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%"
              }}>{card.subtitle}</small>
            </div>
          ))}
        </div>

        {/* Combined Flow Visualization and Summary */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>

          {/* Budget Flow Visualization */}
          <div style={{
            background: darkMode ? "#23272f" : "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            width: "50%",
            position: "relative",
            height: "300px",
            overflow: "hidden"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#0077b6" }}>Budget Flow Visualization</h3>

            {actualFlows.map((flow, idx, arr) => (
              <div
                key={`flow-actual-${idx}`}
                onClick={() => handleNodeClick(flow)}
                style={{
                  position: "absolute",
                  top: `${50 + idx * (200 / (arr.length || 1))}px`,
                  width: `${flow.amount / 50}px`,
                  height: "10px",
                  borderRadius: "50px",
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  animation: `move-actual-${idx} 10s linear infinite`,
                  animationDelay: `${idx}s`,
                  boxShadow: "0 0 8px #10b981",
                  cursor: "pointer"
                }}
                title={`${flow.from} → ${flow.to} (${flow.amount})`}
              >
                <span style={{
                  position: "absolute",
                  left: "100%",
                  paddingLeft: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#023e8a",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  whiteSpace: "nowrap"
                }}>
                  {flow.from} → {flow.to} ({flow.amount})
                </span>
              </div>
            ))}

            <style>
              {`
        ${actualFlows.map((flow, idx) => `
          @keyframes move-actual-${idx} {
            0% { transform: translateX(-120%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(120%); }
          }
        `).join("")}
      `}
            </style>
          </div>

          {/* Flow Summary */}
          <div style={{
            background: darkMode ? "#23272f" : "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            width: "50%",
            height: "300px"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#0077b6" }}>Flow Summary</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>


        {/* Combined Time-Series and Comparison */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>

          {/* Budget Distribution Pie Chart */}
          <div style={{
            background: darkMode ? "#23272f" : "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            width: "50%",
            height: "300px"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#0077b6" }}>Budget Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name }) => name}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={["#3b82f6", "#10b981", "#f7c948", "#e63946", "#60a5fa", "#34d399"][idx % 6]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Comparison */}
          <div style={{
            background: darkMode ? "#23272f" : "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            width: "50%",
            height: "300px"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#0077b6" }}>Budget Comparison</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#3b82f6" />
                <Bar dataKey="actual" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>



        {/* Heatmap */}
        <div style={{
          background: darkMode ? "#23272f" : "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          marginBottom: "30px"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#0077b6" }}>Frequent Adjustments Heatmap</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <XAxis dataKey="vendor" type="category" />
              <YAxis dataKey="frequency" />
              <Tooltip />
              <Scatter name="Adjustments" data={heatmapData} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>


      </main>

      {/* Modal for 9-Step Diagram */}
      {selectedFlow && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            width: "80%",
            maxWidth: "800px",
            backgroundColor: darkMode ? "#23272f" : "#fff",
            color: darkMode ? "#f3f4f6" : undefined,
            borderRadius: "10px",
            padding: "20px",
            position: "relative"
          }}>
            <button onClick={closeModal} style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer"
            }}>✖</button>

            <h2 style={{ textAlign: "center", color: "#0077b6" }}>Budget Details</h2>
            <p style={{ textAlign: "center", color: "#333" }}>
              {selectedFlow.from} → {selectedFlow.to} (${selectedFlow.amount})
            </p>

            {/* Step Details */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "15px",
              marginTop: "20px"
            }}>
              {[
                "Initiation: Budget request created",
                <span key="step2">
                  Approval: Checked by manager <br />
                  <a href="https://prsindia.org/files/budget/budget_primer/Union%20Budget%20Primer_0.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                    View related PDF
                  </a>

                </span>,
                "Allocation: Funds assigned",
                "Processing: Transactions started",
                "Verification: Amount verified",
                <span key="step2">
                  Adjustment in Budgets <br />
                  <a href="https://prsindia.org/files/budget/budget_primer/Union%20Budget%20Primer_0.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                    View related Reports
                  </a>

                </span>,
                "Transfer: Payment released",
                "Confirmation: Receipt acknowledged",
                "Completion: Flow closed successfully"
              ].map((detail, idx) => (
                <div key={idx} style={{
                  padding: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  textAlign: "center",
                  background: idx % 2 === 0 ? "#f1f5f9" : "#fff"
                }}>
                  <h4 style={{ marginBottom: "10px", color: "#333" }}>Step {idx + 1}</h4>
                  <p style={{ fontSize: "14px", color: "#555" }}>{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
