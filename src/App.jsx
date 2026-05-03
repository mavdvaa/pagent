import React, { useState, useEffect, useRef } from "react";


const API_URL = "http://localhost:3000";

export default function AgentClient() {
  const [nodeId] = useState("MONITOR-" + Math.floor(Math.random() * 1000));
  const [isActive, setIsActive] = useState(true);
  const [activeTasks, setActiveTasks] = useState([]);
  const [cpuLoad, setCpuLoad] = useState(0);
  const [logs, setLogs] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null); 

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 8)]);
  };

const loggedJobs = useRef(new Set());

const updateStatus = async () => {
    if (!isActive) return;
    try {
        const res = await fetch(`${API_URL}/tasks?userId=all`);
        const data = await res.json();

        const processing = data.tasks?.filter(t => t.in_progress === true) || [];
        
        processing.forEach(task => {
            if (!loggedJobs.current.has(task.job_id)) {
                addLog(`[${task.type}] Воркер начал выполнение #${task.job_id.substring(0, 8)}`);
                loggedJobs.current.add(task.job_id);
            }
        });

        if (processing.length === 0) loggedJobs.current.clear();

        setActiveTasks(processing);
        setCpuLoad(Math.round(data.realCpu || 0));
        setTotalCompleted(data.stats?.total_tasks || 0); 

    } catch (err) {
        setActiveTasks([]);
    }
};

  useEffect(() => {
    updateStatus();

    const interval = setInterval(() => {
      updateStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, activeTasks]); 

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isActive ? '#22c55e' : '#ef4444',
            boxShadow: isActive ? '0 0 10px #22c55e' : 'none'
          }}></div>
          <strong>МОНИТОР</strong>
        </div>
        <button onClick={() => setIsActive(!isActive)} style={{ ...styles.btn, background: isActive ? "#ef4444" : "#22c55e" }}>
          {isActive ? "ПАУЗА" : "ЗАПУСК"}
        </button>
      </div>

      <div style={styles.displayCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
          <span style={styles.label}>Выполняемые задачи: </span>
        </div>

        {activeTasks.length > 0 ? (
          activeTasks.map(task => (
            <div key={task.job_id} style={styles.taskRow}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 'bold' }}>JOB #{task.job_id.substring(0, 12)}...</span>
                <span style={styles.tag}>{task.type}</span>
              </div>
              <div style={styles.loaderBg}>
                <div className="moveBar" style={styles.loaderFill}></div>
              </div>
              <div style={{ fontSize: '10px', marginTop: 8, color: '#3b82f6' }}>SYNC: DATA_IN_PROGRESS_REDIS</div>
            </div>
          ))
        ) : (
          <div style={styles.idleState}>
            <div style={{ fontSize: '1.2rem', marginBottom: 10 }}>📡</div>
            ОЧЕРЕДЬ В REDIS ПУСТА
          </div>
        )}
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.miniCard}><small>CPU</small><div style={styles.statVal}>{cpuLoad}%</div></div>
        <div style={styles.miniCard}><small>ВЫПОЛНЕНО ЗАДАЧ:</small><div style={styles.statVal}>{totalCompleted}</div></div>
      </div>

      <div style={styles.console}>
        <div style={styles.consoleHeader}>ЗАДАЧИ В ОЧЕРЕДИ</div>
        <div style={styles.logContainer}>
          {logs.map((l, i) => (
            <div key={i} style={{ ...styles.logLine, opacity: i === 0 ? 1 : 0.3 }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 450, margin: "40px auto", padding: "30px", background: "#0f172a", color: "#f8fafc", borderRadius: "24px", fontFamily: "monospace", border: "1px solid #1e293b", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  btn: { border: "none", padding: "8px 16px", borderRadius: "10px", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "11px" },
  displayCard: { background: "#020617", padding: "20px", borderRadius: "16px", border: "1px solid #1e293b", marginBottom: "20px", minHeight: "140px" },
  label: { fontSize: "10px", color: "#64748b", letterSpacing: "1px" },
  taskRow: { marginBottom: "20px" },
  tag: { background: "#1e293b", color: "#3b82f6", padding: "2px 8px", borderRadius: "4px", fontSize: "10px" },
  loaderBg: { height: "6px", background: "#1e293b", borderRadius: "10px", overflow: "hidden" },
  loaderFill: { height: "100%", width: "40%", background: "#3b82f6", borderRadius: "10px" },
  idleState: { textAlign: "center", color: "#475569", fontSize: "12px", paddingTop: "20px" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" },
  miniCard: { background: "#020617", padding: "15px", borderRadius: "12px", border: "1px solid #1e293b", textAlign: "center" },
  statVal: { fontSize: "1.4rem", fontWeight: "bold", marginTop: "5px" },
  console: { background: "#020617", padding: "15px", borderRadius: "12px", height: "160px", overflow: "hidden", border: "1px solid #1e293b" },
  consoleHeader: { fontSize: "10px", color: "#475569", marginBottom: "10px", borderBottom: "1px solid #1e293b", paddingBottom: "5px" },
  logLine: { fontSize: "11px", marginBottom: "4px", whiteSpace: "nowrap" }
};
