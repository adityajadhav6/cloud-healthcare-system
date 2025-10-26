import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Import Chart.js components
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Styles Object --- (Moved outside component for proper scope)
const styles = {
    page: { minHeight: "100vh", display: "flex", flexDirection: "row", background: "linear-gradient(90deg,#071021,#0f1724)", color: "#E6EEF3", fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", },
    sidebar: { width: 320, minWidth: 260, padding: "2rem 1.5rem", borderRight: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", boxSizing: "border-box", },
    logo: { fontSize: 28, fontWeight: 800, color: "#60a5fa", textShadow: "0 6px 18px rgba(96,165,250,0.12)", marginBottom: '1rem' },
    counts: { marginTop: 8, color: "rgba(230,238,243,0.78)", fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '1rem', marginBottom: '1rem' },
    menuButton: (active) => ({ padding: "0.9rem 1rem", borderRadius: 10, border: "none", background: active ? "linear-gradient(90deg,#1e3a8a,#2563eb)" : "transparent", color: active ? "#fff" : "rgba(230,238,243,0.9)", textAlign: "left", cursor: "pointer", width: "100%", boxShadow: active ? "0 8px 20px rgba(37,99,235,0.12)" : "none", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '0.5rem' }),
    contentWrap: { flex: 1, padding: "2rem", overflowY: "auto", boxSizing: "border-box", },
    panel: { background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", padding: "1.5rem", borderRadius: 12, boxShadow: "0 6px 30px rgba(2,6,23,0.6)", marginBottom: '1.5rem'},
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 700, color: "#a5f3fc" },
    smallBtn: { padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "#374151", color: "#fff", fontSize: 13, transition: 'background-color 0.2s ease' },
    table: { width: "100%", borderCollapse: "collapse", overflowX: "auto", marginTop: 16 },
    th: { padding: "12px 14px", textAlign: "left", textTransform: "uppercase", fontSize: 12, letterSpacing: 1, background: "#1f2937", color: "#bfdbfe", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap", },
    td: { padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap", color: "#E6EEF3", fontSize: 14, verticalAlign: 'middle'},
    dangerBtn: { background: "#ef4444", color: "#fff", padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, transition: 'background-color 0.2s ease' },
    infoRow: { marginBottom: 16, color: "rgba(230,238,243,0.8)", fontSize: 15, lineHeight: 1.6 },
    errorBanner: { background: "#b91c1c", color: "#fff", padding: "12px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500 },
    statCard: { background: '#0b1220', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 160 },
    statCardTitle: { fontSize: 14, color: '#93c5fd', fontWeight: 600, marginBottom: '0.25rem' },
    statCardValue: { fontSize: 22, color: '#E6EEF3', fontWeight: 700 },
    // Modal Styles
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
    modalContent: { background: '#1e293b', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '700px', color: '#e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'},
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' },
    modalTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#cbd5e1' },
    modalCloseButton: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 },
    modalBody: { maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem', },
    modalPre: { whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.875rem', background: '#334155', padding: '1rem', borderRadius: '8px' },
    modalMainButton: { width: '100%', marginTop: '1.5rem', background: '#2563eb', color: '#fff', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s ease', ':hover': { background: '#1d4ed8' } },
    modalEhrContent: { fontSize: '0.95rem', lineHeight: 1.7, color: '#cbd5e1' },
    modalEhrTitle: { fontSize: '1.2rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' },
    modalEhrSeparator: { border: 0, borderTop: '1px solid #475569', margin: '1rem 0' },
    modalEhrList: { listStyle: 'disc', marginLeft: '1.5rem', marginTop: '0.5rem' }
};

// --- Reusable Components ---
const Sidebar = ({ handleLogout, currentView, setView }) => (
  <div style={styles.sidebar}>
    <div style={styles.logo}>MediCare Admin</div>
     {/* Counts are now inside AdminDashboard */}
    <nav className="flex flex-col space-y-2 mt-4"> {/* Added mt-4 */}
      <button style={styles.menuButton(currentView === "menu")} onClick={() => setView("menu")}>🏠 Menu</button>
      <button style={styles.menuButton(currentView === "doctors")} onClick={() => setView("doctors")}>🩺 Doctors</button>
      <button style={styles.menuButton(currentView === "patients")} onClick={() => setView("patients")}>🧍 Patients</button>
      <button style={styles.menuButton(currentView === "ehrs")} onClick={() => setView("ehrs")}>📋 EHRs</button>
      <button style={styles.menuButton(currentView === "appointments")} onClick={() => setView("appointments")}>🗓️ Appointments</button>
    </nav>
    <div className="flex-grow"></div> {/* Pushes controls to bottom */}
    <div style={{ fontSize: 13, color: "rgba(230,238,243,0.6)" }}>
       <div style={{ marginBottom: 8 }}>Backend: {import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}</div>
       <button
           style={{ ...styles.smallBtn, width: "100%" }}
           onClick={() => window.location.reload()} // Simple page reload for refresh
       >
           Refresh Page
       </button>
       <button style={{ ...styles.smallBtn, width: '100%', background: '#dc2626', marginTop: 8 }} onClick={handleLogout}>
          Logout
       </button>
    </div>
  </div>
);


const StatCard = ({ title, value, icon }) => (
    <div style={styles.statCard}>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <div>
            <p style={styles.statCardTitle}>{title}</p>
            <p style={styles.statCardValue}>{value}</p>
        </div>
    </div>
);

const DetailModal = ({ title, data, type, onClose, doctors = [], patients = [] }) => { // Added doctors/patients for lookup

    const findNameById = (id, list) => {
        const item = list.find(p => p.id === id);
        return item ? item.name : `ID: ${id}`;
    };

    const renderEHRDetails = (ehrData) => {
        // Find names using the passed lists
        const patientName = findNameById(ehrData.patient_id ?? ehrData.user_id, patients);
        const doctorName = findNameById(ehrData.doctor_id ?? ehrData.created_by, doctors);

        let conditionsText = "None Reported";
        if (Array.isArray(ehrData.conditions) && ehrData.conditions.length > 0) {
            conditionsText = ehrData.conditions.join(', ');
        } else if (typeof ehrData.conditions === 'string' && ehrData.conditions) {
            conditionsText = ehrData.conditions; // Already a string
        }

        return (
            <div style={styles.modalEhrContent}>
                <h3 style={styles.modalEhrTitle}>Patient: {patientName}</h3>
                <p><strong>EHR Record ID:</strong> {ehrData.ehr_id}</p>
                <p><strong>Created by:</strong> Dr. {doctorName}</p>
                <hr style={styles.modalEhrSeparator} />
                <p><strong>Age:</strong> {ehrData.age || 'N/A'}</p>
                <p><strong>Gender:</strong> {ehrData.gender || 'N/A'}</p>
                <p><strong>Blood Group:</strong> {ehrData.blood_group || 'N/A'}</p>
                <hr style={styles.modalEhrSeparator} />
                <p><strong>Conditions:</strong> {conditionsText}</p>
            </div>
        );
    };

    const renderAppointmentDetails = (apptData) => {
        const appTime = apptData.appointment_time ? new Date(apptData.appointment_time + 'Z').toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', hour12: false }) : 'N/A';
        // Find names
        const patientName = findNameById(apptData.patient_id, patients);
        const doctorName = findNameById(apptData.doctor_id, doctors);

        return (
             <div style={styles.modalEhrContent}>
                 <p><strong>Appointment ID:</strong> {apptData.id}</p>
                 <p><strong>Patient:</strong> {patientName}</p>
                 <p><strong>Doctor:</strong> Dr. {doctorName}</p>
                 <hr style={styles.modalEhrSeparator} />
                 <p><strong>Time:</strong> {appTime}</p>
                 <p><strong>Status:</strong> {apptData.status || 'N/A'}</p>
                 <p><strong>Reason:</strong> {apptData.reason || 'N/A'}</p>
             </div>
        );
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>{title}</h2>
                    <button onClick={onClose} style={styles.modalCloseButton}>&times;</button>
                </div>
                <div style={styles.modalBody}>
                    {type === 'ehr' && data ? renderEHRDetails(data) : null}
                    {type === 'appointment' && data ? renderAppointmentDetails(data) : null}
                    {type !== 'ehr' && type !== 'appointment' && data ? (
                        <pre style={styles.modalPre}>{JSON.stringify(data, null, 2)}</pre>
                    ) : null}
                     {!data && <p>No data available.</p>}
                </div>
                 <button onClick={onClose} style={styles.modalMainButton}>Close</button>
            </div>
        </div>
    );
};


// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
  const [view, setView] = useState("menu");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [ehrs, setEhrs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingView, setLoadingView] = useState(false);
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState({ name: "Admin" });
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [detailModalTitle, setDetailModalTitle] = useState("");
  const [detailModalType, setDetailModalType] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token") || "";

  const authHeader = () => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const fetchData = async (endpoint, setter, specificLoadingSetter = setLoadingView) => {
    if (!['doctors', 'patients', 'ehrs', 'appointments'].includes(endpoint)) {
        console.error(`Invalid endpoint requested: ${endpoint}`);
        setError(`Internal configuration error: Invalid endpoint ${endpoint}`);
        return;
    }
    specificLoadingSetter(true);
    // Keep existing error until success
    try {
      const response = await axios.get(`${API_BASE}/api/admin/${endpoint}`, {
        headers: authHeader(),
      });
      let dataArray = [];
      if (Array.isArray(response.data)) { dataArray = response.data; }
      else if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data[endpoint])) { dataArray = response.data[endpoint]; }
          else if (Array.isArray(response.data.results)) { dataArray = response.data.results; }
          else if (Array.isArray(response.data.data)) { dataArray = response.data.data; }
          // Handle specific case for EHRs if backend returns {"ehrs": [...]}
          else if (endpoint === 'ehrs' && Array.isArray(response.data.ehrs)) { dataArray = response.data.ehrs; }
          // Handle specific case for appointments if backend returns {"appointments": [...]}
          else if (endpoint === 'appointments' && Array.isArray(response.data.appointments)) { dataArray = response.data.appointments; }
      }
      setter(dataArray);
      setError(""); // Clear error on success

    } catch (err) {
      console.error("fetchData Error:", endpoint, err);
      let errorMsg = `Failed to fetch ${endpoint}.`;
      if (err.response) {
          errorMsg += ` Status: ${err.response.status} - ${err.response.data?.msg || err.response.data?.error || 'Server error'}`;
          if (err.response.status === 401 || err.response.status === 403) {
             errorMsg += " Please log in again or check permissions.";
             // Force logout on critical auth errors
             localStorage.clear();
             navigate("/login");
          }
      } else if (err.request) {
           errorMsg += " Network Error or server not responding.";
      } else {
           errorMsg += ` ${err.message}`;
      }
      setError(errorMsg);
      // Don't clear data on error, keep the old data visible
      // setter([]);
    } finally {
      specificLoadingSetter(false);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
     if (role !== 'admin') {
         localStorage.clear();
         navigate("/login");
         return;
     }
    setAdminInfo({ name: name || "Admin" });

    (async () => {
        setLoadingInitial(true);
        setError("");
        // Use Promise.allSettled to allow some requests to fail without stopping others
        const results = await Promise.allSettled([
            fetchData("doctors", setDoctors, setLoadingInitial),
            fetchData("patients", setPatients, setLoadingInitial),
            fetchData("ehrs", setEhrs, setLoadingInitial),
            fetchData("appointments", setAppointments, setLoadingInitial),
        ]);
        // Check if any critical request failed (optional)
        results.forEach(result => {
            if (result.status === 'rejected') {
                console.error("Initial fetch failed for one or more resources.");
                // Error is already set within fetchData
            }
        });
        setLoadingInitial(false); // Set initial loading false after all fetches attempt
    })();
  }, [navigate]);

  const handleDelete = async (type, id, setter) => {
    const idFieldName = type === 'ehr' ? 'ehr_id' : 'id';
    const endpointType = type === 'appointment' ? 'appointments' : type;

    if (!window.confirm(`Are you sure you want to delete this ${type} (ID: ${id})? This cannot be undone.`)) return;

    try {
        const token = getToken();
        const deleteEndpoint = `${API_BASE}/api/admin/${endpointType}/${id}`;
        await axios.delete(deleteEndpoint, { headers: { Authorization: `Bearer ${token}` } });
        setter(prevList => prevList.filter((item) => item[idFieldName] !== id));
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
    } catch (err) {
        console.error("Delete Error:", type, id, err);
        alert(`Error deleting ${type}: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  const openDetailModal = (item, title, type) => {
      setSelectedDetailItem(item);
      setDetailModalTitle(title);
      setDetailModalType(type);
  };

  const ehrPerDoctorData = (doctors.length > 0 && ehrs.length > 0) ? {
      labels: doctors.map(d => `Dr. ${d.name} (ID: ${d.id})`),
      datasets: [{
          label: '# of EHR Records Created',
          data: doctors.map(d => ehrs.filter(e => e.doctor_id === d.id || e.created_by === d.id).length),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
      }]
  } : { labels: [], datasets: [] };

  const chartOptions = {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, title: { display: true, text: 'EHR Records Created per Doctor', color: '#E6EEF3', font: { size: 16 } } },
      scales: { y: { ticks: { color: '#cbd5e1', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }, x: { beginAtZero: true, ticks: { color: '#cbd5e1', stepSize: 1 }, grid: { color: 'rgba(255, 255, 255, 0.05)' } } }
  };

  const renderLoading = () => <div style={{ padding: '20px', textAlign: 'center', fontSize: 16 }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <Sidebar handleLogout={handleLogout} currentView={view} setView={setView} />

      <div style={styles.contentWrap}>
        {error && <div style={styles.errorBanner}>{error}</div>}

        {loadingInitial ? renderLoading() : (
          <>
            {/* MENU Page */}
            {view === "menu" && (
                 <div style={styles.panel}>
                     <div style={styles.headerRow}> <div style={styles.title}>System Overview</div> </div>
                     <div style={styles.infoRow}> Welcome, {adminInfo.name}. Select an option from the menu. </div>
                     <div style={{ display: "flex", flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                         <StatCard title="Total Doctors" value={doctors.length} icon="🩺"/>
                         <StatCard title="Total Patients" value={patients.length} icon="🧍"/>
                         <StatCard title="Total EHRs" value={ehrs.length} icon="📋"/>
                         <StatCard title="Total Appointments" value={appointments.length} icon="🗓️"/>
                     </div>
                     <div style={{marginTop: '2rem'}}>
                          <h3 style={{...styles.title, color: '#e2e8f0', marginBottom: '1rem', fontSize: '1.25rem'}}>Analytics: EHR Records per Doctor</h3>
                          {(doctors.length > 0) ? (
                              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '1rem', borderRadius: '8px', height: '300px' }}>
                                   <Bar options={chartOptions} data={ehrPerDoctorData} />
                              </div>
                          ) : ( <p style={{color: '#9ca3af', marginTop: '1rem'}}>No doctor data available to display chart.</p> )}
                     </div>
                 </div>
            )}

            {/* DOCTORS Table */}
            {view === "doctors" && (
              <div style={styles.panel}>
                <div style={styles.headerRow}>
                  <div style={styles.title}>Doctors ({doctors.length})</div>
                  <button style={styles.smallBtn} onClick={() => fetchData("doctors", setDoctors)} disabled={loadingView}> {loadingView ? 'Loading...' : 'Reload'} </button>
                </div>
                {loadingView ? renderLoading() : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead> <tr> <th style={styles.th}>ID</th> <th style={styles.th}>Name</th> <th style={styles.th}>Email</th> <th style={styles.th}>Actions</th> </tr> </thead>
                      <tbody>
                        {doctors.length === 0 ? ( <tr><td style={styles.td} colSpan={4}>No doctors found.</td></tr> ) : doctors.map(d => (
                          <tr key={d.id}>
                            <td style={styles.td}>{d.id}</td> <td style={styles.td}>{d.name}</td> <td style={styles.td}>{d.email}</td>
                            <td style={styles.td}> <button style={styles.dangerBtn} onClick={() => handleDelete("doctor", d.id, setDoctors)}>Delete</button> </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PATIENTS Table */}
            {view === "patients" && (
               <div style={styles.panel}>
                 <div style={styles.headerRow}> <div style={styles.title}>Patients ({patients.length})</div> <button style={styles.smallBtn} onClick={() => fetchData("patients", setPatients)} disabled={loadingView}>{loadingView ? 'Loading...' : 'Reload'}</button> </div>
                 {loadingView ? renderLoading() : (
                   <div style={{ overflowX: "auto" }}>
                     <table style={styles.table}>
                       <thead> <tr> <th style={styles.th}>ID</th> <th style={styles.th}>Name</th> <th style={styles.th}>Email</th> <th style={styles.th}>Actions</th> </tr> </thead>
                       <tbody>
                         {patients.length === 0 ? ( <tr><td style={styles.td} colSpan={4}>No patients found.</td></tr> ) : patients.map(p => (
                           <tr key={p.id}>
                             <td style={styles.td}>{p.id}</td> <td style={styles.td}>{p.name}</td> <td style={styles.td}>{p.email}</td>
                             <td style={styles.td}> <button style={styles.dangerBtn} onClick={() => handleDelete("patient", p.id, setPatients)}>Delete</button> </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
            )}

            {/* EHRs Table */}
            {view === "ehrs" && (
              <div style={styles.panel}>
                <div style={styles.headerRow}> <div style={styles.title}>EHR Records ({ehrs.length})</div> <button style={styles.smallBtn} onClick={() => fetchData("ehrs", setEhrs)} disabled={loadingView}>{loadingView ? 'Loading...' : 'Reload'}</button> </div>
                {loadingView ? renderLoading() : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead> <tr> <th style={styles.th}>EHR ID</th> <th style={styles.th}>Patient ID</th> <th style={styles.th}>Doctor ID</th> <th style={styles.th}>Patient Name</th> <th style={styles.th}>Conditions</th> <th style={styles.th}>Actions</th> </tr> </thead>
                      <tbody>
                        {ehrs.length === 0 ? ( <tr><td style={styles.td} colSpan={6}>No EHRs found.</td></tr> ) : ehrs.map(e => (
                          <tr key={e.ehr_id}>
                            <td style={styles.td}>{e.ehr_id}</td>
                            <td style={styles.td}>{e.patient_id ?? e.user_id ?? "-"}</td>
                            <td style={styles.td}>{e.doctor_id ?? e.created_by ?? "-"}</td>
                            <td style={styles.td}>{e.name ?? "N/A"}</td>
                            <td style={styles.td} title={Array.isArray(e.conditions) ? e.conditions.join(', ') : e.conditions}>
                                {Array.isArray(e.conditions) ? (e.conditions.join(', ').length > 30 ? e.conditions.join(', ').substring(0, 30) + '...' : e.conditions.join(', ')) : (typeof e.conditions === 'string' && e.conditions.length > 30 ? e.conditions.substring(0, 30) + '...' : e.conditions || 'None')}
                            </td>
                            <td style={styles.td}>
                              <button style={{...styles.smallBtn, background: '#1d4ed8', marginRight: 8}} onClick={() => openDetailModal(e, `EHR Record Details (ID: ${e.ehr_id})`, 'ehr')}>View</button>
                              <button style={styles.dangerBtn} onClick={() => handleDelete("ehr", e.ehr_id, setEhrs)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Appointments Table */}
            {view === "appointments" && (
              <div style={styles.panel}>
                <div style={styles.headerRow}> <div style={styles.title}>All Appointments ({appointments.length})</div> <button style={styles.smallBtn} onClick={() => fetchData("appointments", setAppointments)} disabled={loadingView}>{loadingView ? 'Loading...' : 'Reload'}</button> </div>
                {loadingView ? renderLoading() : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead> <tr> <th style={styles.th}>Appt ID</th> <th style={styles.th}>Patient ID</th> <th style={styles.th}>Doctor ID</th> <th style={styles.th}>Time</th> <th style={styles.th}>Reason</th> <th style={styles.th}>Status</th> <th style={styles.th}>Actions</th> </tr> </thead>
                      <tbody>
                        {appointments.length === 0 ? ( <tr><td style={styles.td} colSpan={7}>No appointments found.</td></tr> ) : appointments.map(app => {
                            const appTime = app.appointment_time ? new Date(app.appointment_time + 'Z').toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : 'N/A';
                            return (
                               <tr key={app.id}>
                                    <td style={styles.td}>{app.id}</td>
                                    <td style={styles.td}>{app.patient_id ?? "-"}</td>
                                    <td style={styles.td}>{app.doctor_id ?? "-"}</td>
                                    <td style={styles.td}>{appTime}</td>
                                    <td style={styles.td} title={app.reason}>{app.reason ? (app.reason.length > 30 ? app.reason.substring(0, 30) + '...' : app.reason) : 'N/A'}</td>
                                    <td style={styles.td}>{app.status || 'N/A'}</td>
                                    <td style={styles.td}>
                                         <button style={{...styles.smallBtn, background: '#1d4ed8'}} onClick={() => openDetailModal(app, `Appointment Details (ID: ${app.id})`, 'appointment')}>View</button>
                                         {/* Optional: Add admin delete button for appointments */}
                                         {/* <button style={{...styles.dangerBtn, marginLeft: 8}} onClick={() => handleDelete("appointment", app.id, setAppointments)}>Delete</button> */}
                                    </td>
                               </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

       {/* Detail Modal - Pass doctors and patients lists for name lookups */}
       {selectedDetailItem && <DetailModal title={detailModalTitle} data={selectedDetailItem} type={detailModalType} onClose={() => setSelectedDetailItem(null)} doctors={doctors} patients={patients} />}
    </div>
  );
};

export default AdminDashboard;