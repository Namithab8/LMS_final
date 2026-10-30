// src/pages/student/Report.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FaBook, FaBookOpen, FaExclamationCircle, FaClock, FaMoneyBillWave } from "react-icons/fa";
import { request } from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = ["#4dabf7", "#51cf66", "#ff6b6b", "#fbbf24"];

export default function Report() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await request('/dashboard/student');
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger p-4">
        <p>{error}</p>
      </div>
    );
  }

  // Prepare chart data
  const studentStats = [
    { name: "Available Books", value: stats.totalAvailableBooks },
    { name: "Borrowed Books", value: stats.borrowedBooks },
    { name: "Overdue Books", value: stats.overdueBooks },
    { name: "Pending Requests", value: stats.pendingRequests },
  ].filter(item => item.value > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "24px",
        paddingBottom: "24px",
        fontFamily: "'Poppins', sans-serif",
        background:
          "radial-gradient(circle at top left, #e0f2fe 0, transparent 45%), radial-gradient(circle at bottom right, #fee2e2 0, transparent 45%), #f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
      }}
    >
      <Container fluid style={{ maxWidth: "1300px" }}>
        <Card
          className="border-0 shadow-lg"
          style={{
            borderRadius: "24px",
            padding: "22px 26px 20px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.97), rgba(249,250,251,0.99))",
            minHeight: "78vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            className="text-center mb-3"
            style={{
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "0.02em",
            }}
          >
            My Library Overview
          </h2>
          <p
            className="text-center text-muted mb-4"
            style={{ fontSize: "0.95rem" }}
          >
            Snapshot of your available, borrowed, and overdue books.
          </p>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Row className="g-4 mb-4">
              <Col lg={3} md={4} sm={6} xs={12}>
                <Card
                  className="border-0 h-100"
                  style={{
                    borderRadius: "18px",
                    padding: "18px 10px",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
                    boxShadow: "0 10px 24px rgba(59,130,246,0.16)",
                  }}
                >
                  <FaBook size={38} className="mb-2" color="#1d4ed8" />
                  <h3
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                      color: "#111827",
                    }}
                  >
                    {stats.totalAvailableBooks}
                  </h3>
                  <p
                    style={{
                      fontWeight: 500,
                      marginBottom: 0,
                      color: "#374151",
                    }}
                  >
                    Books Available
                  </p>
                </Card>
              </Col>

              <Col lg={3} md={4} sm={6} xs={12}>
                <Card
                  className="border-0 h-100"
                  style={{
                    borderRadius: "18px",
                    padding: "18px 10px",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #dcfce7, #ffffff)",
                    boxShadow: "0 10px 24px rgba(34,197,94,0.16)",
                  }}
                >
                  <FaBookOpen size={38} className="mb-2" color="#16a34a" />
                  <h3
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                      color: "#111827",
                    }}
                  >
                    {stats.borrowedBooks}
                  </h3>
                  <p
                    style={{
                      fontWeight: 500,
                      marginBottom: 0,
                      color: "#374151",
                    }}
                  >
                    Books Borrowed
                  </p>
                </Card>
              </Col>

              <Col lg={3} md={4} sm={6} xs={12}>
                <Card
                  className="border-0 h-100"
                  style={{
                    borderRadius: "18px",
                    padding: "18px 10px",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #fee2e2, #ffffff)",
                    boxShadow: "0 10px 24px rgba(239,68,68,0.18)",
                  }}
                >
                  <FaExclamationCircle
                    size={38}
                    className="mb-2"
                    color="#dc2626"
                  />
                  <h3
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                      color: "#111827",
                    }}
                  >
                    {stats.overdueBooks}
                  </h3>
                  <p
                    style={{
                      fontWeight: 500,
                      marginBottom: 0,
                      color: "#374151",
                    }}
                  >
                    Overdue Books
                  </p>
                </Card>
              </Col>

              <Col lg={3} md={4} sm={6} xs={12}>
                <Card
                  className="border-0 h-100"
                  style={{
                    borderRadius: "18px",
                    padding: "18px 10px",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #fef3c7, #ffffff)",
                    boxShadow: "0 10px 24px rgba(251,191,36,0.18)",
                  }}
                >
                  <FaMoneyBillWave
                    size={38}
                    className="mb-2"
                    color="#d97706"
                  />
                  <h3
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                      color: "#111827",
                    }}
                  >
                    ₹{stats.totalOutstandingFine}
                  </h3>
                  <p
                    style={{
                      fontWeight: 500,
                      marginBottom: 0,
                      color: "#374151",
                    }}
                  >
                    Outstanding Fine
                  </p>
                </Card>
              </Col>
            </Row>

            <Row className="align-items-stretch g-4" style={{ flex: 1 }}>
              <Col lg={7} md={7} xs={12}>
                <Card
                  className="border-0 h-100"
                  style={{
                    borderRadius: "18px",
                    padding: "18px 10px",
                    boxShadow: "0 14px 32px rgba(15,23,42,0.12)",
                  }}
                >
                  <h5
                    className="text-center mb-3"
                    style={{ fontWeight: 600, color: "#111827" }}
                  >
                    Books distribution
                  </h5>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={studentStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                      >
                        {studentStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={24} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col lg={5} md={5} xs={12}>
                <Card
                  className="border-0 h-100"
                  style={{
                    borderRadius: "18px",
                    padding: "18px 18px",
                    background:
                      "linear-gradient(135deg, #e0f2fe, #ecfeff)",
                    color: "#0f172a",
                    boxShadow: "0 14px 32px rgba(37,99,235,0.18)",
                  }}
                >
                  <h5
                    style={{
                      fontWeight: 600,
                      marginBottom: 10,
                      color: "#0f172a",
                    }}
                  >
                    Quick Insights
                  </h5>
                  <ul
                    style={{
                      listStyle: "none",
                      paddingLeft: 0,
                      marginBottom: 4,
                      fontSize: "0.94rem",
                    }}
                  >
                    <li className="mb-2">
                      • You currently have <strong>{stats.borrowedBooks}</strong> books checked out.
                    </li>
                    <li className="mb-2">
                      • <strong>{stats.overdueBooks}</strong> book{stats.overdueBooks !== 1 ? 's are' : ' is'} overdue, return {stats.overdueBooks !== 1 ? 'them' : 'it'} soon to avoid extra fines.
                    </li>
                    <li className="mb-2">
                      • You have <strong>{stats.pendingRequests}</strong> pending book request{stats.pendingRequests !== 1 ? 's' : ''}.
                    </li>
                    <li className="mb-0">
                      • Outstanding fine: <strong>₹{stats.totalOutstandingFine}</strong>
                    </li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>
    </div>
  );
}
