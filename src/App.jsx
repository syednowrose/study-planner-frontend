import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import "./App.css";

const API = "http://localhost:8080/api";

export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [prioritySubjects, setPrioritySubjects] = useState([]);
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    difficulty: 1,
    examDate: "",
  });

  useEffect(() => {
    loadSubjects();
    loadPriority();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await axios.get(`${API}/subjects`);
      setSubjects(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadPriority = async () => {
    try {
      const res = await axios.get(`${API}/subjects/priority`);
      setPrioritySubjects(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addSubject = async () => {
    if (!form.name || !form.examDate) return;

    try {
      const res = await axios.post(`${API}/subjects`, form);
      setSubjects([...subjects, res.data]);
      setForm({ name: "", difficulty: 1, examDate: "" });
      loadPriority();
    } catch (error) {
      console.log(error);
    }
  };

  const markDone = async (id) => {
    try {
      const res = await axios.put(`${API}/subjects/${id}/complete`);
      setSubjects(subjects.map((s) => (s.id === id ? res.data : s)));
      loadPriority();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await axios.delete(`${API}/subjects/${id}`);
      setSubjects(subjects.filter((s) => s.id !== id));
      loadPriority();
    } catch (error) {
      console.log(error);
    }
  };

  const stats = useMemo(() => {
    const total = subjects.length;
    const completed = subjects.filter((s) => s.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [subjects]);

  const filteredSubjects = subjects.filter((s) => {
    const matchSearch = s.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter =
      filter === "all"
        ? true
        : filter === "completed"
        ? s.completed
        : !s.completed;

    return matchSearch && matchFilter;
  });

  return (
    <div className="app">
      <div className="topbar">
        <h1 className="title">AI Smart Study Planner</h1>

        <button className="btn" onClick={() => setDark(!dark)}>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="section">
        <h2>Dashboard</h2>
        <div className="cards">
          <Card title="Total Subjects" value={stats.total} />
          <Card title="Completed" value={stats.completed} />
          <Card title="Pending" value={stats.pending} />
        </div>
      </div>

      <div className="section">
        <h2>Analytics</h2>

        <div className="cards">
          <div className="card" style={{ height: "320px" }}>
            <h3>Completed vs Pending</h3>

            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Completed", value: stats.completed },
                    { name: "Pending", value: stats.pending }
                  ]}
                  dataKey="value"
                  outerRadius={90}
                  label
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ height: "320px" }}>
            <h3>Subject Difficulty</h3>

            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={subjects}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="difficulty" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Priority Subjects</h2>
        <div className="subject-list">
          {prioritySubjects.slice(0, 3).map((s) => (
            <div key={s.id} className="subject">
              <h3>{s.name}</h3>
              <p>Difficulty: {s.difficulty}</p>
              <p>Exam: {s.examDate}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Add Subject</h2>
        <div className="form">
          <input
            placeholder="Subject Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="number"
            min="1"
            max="5"
            value={form.difficulty}
            onChange={(e) =>
              setForm({
                ...form,
                difficulty: Number(e.target.value),
              })
            }
          />

          <input
            type="date"
            value={form.examDate}
            onChange={(e) => setForm({ ...form, examDate: e.target.value })}
          />

          <button className="btn" onClick={addSubject}>
            Add
          </button>
        </div>
      </div>

      <div className="section">
        <h2>Subjects</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Search subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="subject-list">
          {filteredSubjects.map((s) => (
            <div key={s.id} className="subject">
              <h3>{s.name}</h3>
              <p>Difficulty: {s.difficulty}</p>
              <p>Exam: {s.examDate}</p>
              <p>Status: {s.completed ? "Completed" : "Pending"}</p>

              <div className="actions">
                <button className="btn" onClick={() => markDone(s.id)}>
                  Done
                </button>

                <button className="btn" onClick={() => deleteSubject(s.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredSubjects.length === 0 && <p>No subjects found.</p>}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}