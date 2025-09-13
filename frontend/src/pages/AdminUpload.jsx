import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { FaChartBar, FaUpload, FaUserCircle, FaBell, FaEnvelope, FaTable, FaList, FaCog, FaSignOutAlt, FaFilePdf, FaCheckCircle, FaUsers, FaShoppingCart, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function AdminUpload() {
  const [form, setForm] = useState({ from: "", to: "", amount: "", type: "planned", steps: [{ number: 1, text: "", pdf: null }] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState([]);
  const [selectedBudgetIdx, setSelectedBudgetIdx] = useState(null);
  const [editSteps, setEditSteps] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStepChange = (idx, field, value) => {
    const newSteps = form.steps.map((step, sidx) =>
      sidx === idx ? { ...step, [field]: field === "number" ? Number(value) : value } : step
    );
    setForm({ ...form, steps: newSteps });
  };
  
  // Update step for existing adminData
  const updateStep = async (rowId, stepIdx, field, value) => {
    try {
      const row = adminData.find(r => r.id === rowId);
      if (!row) return;
      const updatedSteps = row.steps.map((step, idx) =>
        idx === stepIdx ? { ...step, [field]: value } : step
      );
      // If updating PDF, upload and get URL
      let finalSteps = updatedSteps;
      if (field === "pdf" && value) {
        const storageRef = ref(storage, `budgetSteps/${Date.now()}_${stepIdx}_${value.name}`);
        await uploadBytes(storageRef, value);
        const url = await getDownloadURL(storageRef);
        finalSteps = updatedSteps.map((step, idx) =>
          idx === stepIdx ? { ...step, pdfUrl: url } : step
        );
      }
      // Update Firestore
      await addDoc(collection(db, "budgetFlows"), {
        ...row,
        steps: finalSteps,
        date: new Date().toISOString().slice(0, 10)
      });
      setSuccess("Step updated successfully!");
    } catch (err) {
      setError("Step update failed. " + err.message);
    }
  };

  const handleStepFile = (idx, file) => {
    const newSteps = form.steps.map((step, sidx) =>
      sidx === idx ? { ...step, pdf: file } : step
    );
    setForm({ ...form, steps: newSteps });
  };

  const addStep = () => {
    setForm({ ...form, steps: [...form.steps, { number: form.steps.length + 1, text: "" }] });
  };

  const removeStep = idx => {
    setForm({ ...form, steps: form.steps.filter((_, sidx) => sidx !== idx) });
  };

  useEffect(() => {
    // Listen to all admin uploads, ordered by date desc
    const q = query(collection(db, "budgetFlows"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setAdminData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Select a budget entry to update steps
  const handleSelectBudget = (idx) => {
    setSelectedBudgetIdx(idx);
    setEditSteps(adminData[idx]?.steps ? [...adminData[idx].steps] : []);
  };

  // Update step fields
  const handleEditStepChange = (stepIdx, field, value) => {
    const newSteps = editSteps.map((step, sidx) =>
      sidx === stepIdx ? { ...step, [field]: value } : step
    );
    setEditSteps(newSteps);
  };

  // Save updated steps to Firestore
  const saveStepsUpdate = async () => {
    if (selectedBudgetIdx === null) return;
    try {
      const budget = adminData[selectedBudgetIdx];
      await addDoc(collection(db, "budgetFlows"), {
        ...budget,
        steps: editSteps,
        date: new Date().toISOString().slice(0, 10)
      });
      setSuccess("Steps updated successfully!");
      setSelectedBudgetIdx(null);
      setEditSteps(null);
    } catch (err) {
      setError("Step update failed. " + err.message);
    }
  };

  const cancelStepsUpdate = () => {
    setSelectedBudgetIdx(null);
    setEditSteps(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      // Upload PDFs for each step and get URLs
      const stepsWithUrls = await Promise.all(form.steps.filter(s => s.text.trim() !== "").map(async (step, idx) => {
        if (step.pdf) {
          const storageRef = ref(storage, `budgetSteps/${Date.now()}_${idx}_${step.pdf.name}`);
          await uploadBytes(storageRef, step.pdf);
          const url = await getDownloadURL(storageRef);
          return { ...step, pdfUrl: url };
        }
        return { ...step };
      }));
      await addDoc(collection(db, "budgetFlows"), {
        from: form.from,
        to: form.to,
        amount: Number(form.amount),
        type: form.type,
        date: new Date().toISOString().slice(0, 10),
        steps: stepsWithUrls
      });
      setSuccess("Data uploaded successfully!");
      setForm({ from: "", to: "", amount: "", type: "planned", steps: [{ number: 1, text: "", pdf: null }] });
    } catch (err) {
      setError("Upload failed. " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: "#23272f", color: "#fff", padding: "24px 0", boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}>
        <div style={{ fontWeight: 700, fontSize: "1.5rem", color: "#ff4d4f", textAlign: "center", marginBottom: 32 }}>target</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 12, background: "#1a1d23", borderLeft: "4px solid #ff4d4f", fontWeight: 600 }}><FaChartBar /> Dashboard</li>
          <li style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}><FaTable /> Charts</li>
          <li style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}><FaList /> Forms</li>
          <li style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}><FaCog /> Settings</li>
          <li style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}><FaSignOutAlt /> Logout</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px 40px" }}>
        {/* Topbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div></div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <FaEnvelope size={20} style={{ color: "#23272f" }} />
            <FaBell size={20} style={{ color: "#23272f" }} />
            <FaUserCircle size={28} style={{ color: "#23272f" }} />
            <span style={{ fontWeight: 600, color: "#23272f" }}>John Doe</span>
          </div>
        </div>

        {/* Card Grid */}
        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <div style={{ flex: 1, background: "#ff4d4f", color: "#fff", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <FaArrowDown size={32} />
            <div style={{ fontSize: "2rem", fontWeight: 700, margin: "12px 0" }}>{adminData.length}</div>
            <div style={{ fontWeight: 600 }}>REVENUE</div>
          </div>
          <div style={{ flex: 1, background: "#ffa726", color: "#fff", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <FaShoppingCart size={32} />
            <div style={{ fontSize: "2rem", fontWeight: 700, margin: "12px 0" }}>{adminData.filter(d => d.type === "planned").length}</div>
            <div style={{ fontWeight: 600 }}>SALES</div>
          </div>
          <div style={{ flex: 1, background: "#42a5f5", color: "#fff", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <FaChartBar size={32} />
            <div style={{ fontSize: "2rem", fontWeight: 700, margin: "12px 0" }}>{adminData.filter(d => d.type === "actual").length}</div>
            <div style={{ fontWeight: 600 }}>PRODUCTS</div>
          </div>
          <div style={{ flex: 1, background: "#66bb6a", color: "#fff", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <FaUsers size={32} />
            <div style={{ fontSize: "2rem", fontWeight: 700, margin: "12px 0" }}>{adminData.reduce((acc, d) => acc + Number(d.amount || 0), 0)}</div>
            <div style={{ fontWeight: 600 }}>VISITS</div>
          </div>
        </div>

        {/* Upload Form */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 32, marginBottom: 32 }}>
          <h2 style={{ textAlign: "center", marginBottom: 24, color: "#23272f" }}>Upload Budget Details</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label>From:</label>
                <input name="from" value={form.from} onChange={handleChange} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label>To:</label>
                <input name="to" value={form.to} onChange={handleChange} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Amount:</label>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Type:</label>
                <select name="type" value={form.type} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}>
                  <option value="planned">Planned</option>
                  <option value="actual">Actual</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label>Budget Steps:</label>
              {form.steps.map((step, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input
                    type="number"
                    min={1}
                    value={step.number}
                    onChange={e => handleStepChange(idx, "number", e.target.value)}
                    style={{ width: 50, padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
                    placeholder="Step No."
                  />
                  <input
                    type="text"
                    value={step.text}
                    onChange={e => handleStepChange(idx, "text", e.target.value)}
                    style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
                    placeholder={`Step ${step.number} details`}
                  />
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => handleStepFile(idx, e.target.files[0])}
                    style={{ width: 120 }}
                  />
                  {form.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)} style={{ background: "#e63946", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addStep} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", marginTop: 4 }}>Add Step</button>
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, borderRadius: 6, background: "#0077b6", color: "#fff", border: "none", fontWeight: 600, marginTop: 16 }}>
              {loading ? "Uploading..." : "Upload"}
            </button>
            {success && <div style={{ color: "#10b981", marginTop: 16 }}>{success}</div>}
            {error && <div style={{ color: "#e63946", marginTop: 16 }}>{error}</div>}
          </form>
        </div>

         {/* Previous Data Table */}
         <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 24, marginBottom: 32 }}>
           <h3 style={{ marginBottom: 16, color: "#23272f" }}>Previous Data Added</h3>
           <div style={{ overflowX: "auto" }}>
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead>
                 <tr style={{ background: "#f1f5f9" }}>
                   <th style={{ padding: 10, border: "1px solid #ddd" }}>Date</th>
                   <th style={{ padding: 10, border: "1px solid #ddd" }}>From</th>
                   <th style={{ padding: 10, border: "1px solid #ddd" }}>To</th>
                   <th style={{ padding: 10, border: "1px solid #ddd" }}>Amount</th>
                   <th style={{ padding: 10, border: "1px solid #ddd" }}>Type</th>
                   <th style={{ padding: 10, border: "1px solid #ddd" }}>Update Steps</th>
                 </tr>
               </thead>
               <tbody>
                 {adminData.map((row, idx) => (
                   <tr key={row.id || idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                     <td style={{ padding: 10, border: "1px solid #eee" }}>{row.date}</td>
                     <td style={{ padding: 10, border: "1px solid #eee" }}>{row.from}</td>
                     <td style={{ padding: 10, border: "1px solid #eee" }}>{row.to}</td>
                     <td style={{ padding: 10, border: "1px solid #eee" }}>{row.amount}</td>
                     <td style={{ padding: 10, border: "1px solid #eee" }}>{row.type}</td>
                     <td style={{ padding: 10, border: "1px solid #eee" }}>
                       <button onClick={() => handleSelectBudget(idx)} style={{ background: "#ffa726", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px" }}>Update Steps</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           {/* Separate section for updating steps */}
           {editSteps && (
             <div style={{ marginTop: 24, background: "#f1f5f9", borderRadius: 8, padding: 24 }}>
               <h4 style={{ marginBottom: 12 }}>Update Steps for Budget Entry</h4>
               {editSteps.map((step, sidx) => (
                 <div key={sidx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                   <input type="number" min={1} value={step.number} onChange={e => handleEditStepChange(sidx, "number", e.target.value)} style={{ width: 50, padding: 6, borderRadius: 6, border: "1px solid #ccc" }} />
                   <input type="text" value={step.text} onChange={e => handleEditStepChange(sidx, "text", e.target.value)} style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #ccc" }} />
                   <select value={step.status || "pending"} onChange={e => handleEditStepChange(sidx, "status", e.target.value)} style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}>
                     <option value="pending">Pending</option>
                     <option value="approved">Approved</option>
                     <option value="rejected">Rejected</option>
                   </select>
                 </div>
               ))}
               <button onClick={saveStepsUpdate} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", marginRight: 8 }}>Save Steps</button>
               <button onClick={cancelStepsUpdate} style={{ background: "#e63946", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px" }}>Cancel</button>
             </div>
           )}
         </div>

        {/* Modification History */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 24 }}>
          <h3 style={{ marginBottom: 16, color: "#23272f" }}>Modification History</h3>
          <ul style={{ background: "#f1f5f9", borderRadius: 8, padding: 16 }}>
            {adminData.map((row, idx) => (
              <li key={row.id || idx} style={{ marginBottom: 10, color: "#333" }}>
                <strong>{row.date}:</strong> {row.type === "actual" ? "Actual" : "Planned"} budget from <strong>{row.from}</strong> to <strong>{row.to}</strong> amount <strong>${row.amount}</strong>
                {row.steps && row.steps.length > 0 && (
                  <ul style={{ marginTop: 6, marginLeft: 16, color: "#555", fontSize: "0.95em" }}>
                    {row.steps.map((step, sidx) => (
                      <li key={sidx}>
                        Step {step.number}: {step.text}
                        {step.pdfUrl && (
                          <a href={step.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: "#0077b6", textDecoration: "underline" }}><FaFilePdf style={{ marginRight: 4 }} />View PDF</a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
