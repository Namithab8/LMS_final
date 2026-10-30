import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaUserCheck, FaChartBar, FaBook, FaUsersCog } from 'react-icons/fa';
import { request } from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const COLORS = ['#4dabf7', '#ff6b6b', '#51cf66', '#fbbf24', '#a78bfa'];

export default function ReportStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await request('/dashboard/admin');
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
  const userStats = stats.usersByRole || [];

  const activityStats = [
    { month: 'Jan', users: Math.floor(stats.totalUsers * 0.2) },
    { month: 'Feb', users: Math.floor(stats.totalUsers * 0.35) },
    { month: 'Mar', users: Math.floor(stats.totalUsers * 0.5) },
    { month: 'Apr', users: Math.floor(stats.totalUsers * 0.4) },
    { month: 'May', users: Math.floor(stats.totalUsers * 0.6) },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f0f4f8, #d9e2ec)',
        paddingTop: '60px',
        paddingBottom: '60px',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Container>
        <h1
          className="text-center mb-5"
          style={{ fontSize: '2.5rem', fontWeight: '700', color: '#34495e' }}
        >
          Reports & Statistics
        </h1>

        {/* Top Stats Cards */}
        <Row className="mb-5 g-4">
          <Col md={4}>
            <Card className="shadow-sm rounded-4 py-4 text-center">
              <FaUsers size={40} className="mb-2" color="#4dabf7" />
              <h2>{stats.totalUsers}</h2>
              <p style={{ fontWeight: '500' }}>Total Users</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm rounded-4 py-4 text-center">
              <FaUserCheck size={40} className="mb-2" color="#ff6b6b" />
              <h2>{stats.pendingApprovals}</h2>
              <p style={{ fontWeight: '500' }}>Pending Approvals</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm rounded-4 py-4 text-center">
              <FaChartBar size={40} className="mb-2" color="#51cf66" />
              <h2>{stats.activeStudents}</h2>
              <p style={{ fontWeight: '500' }}>Active Students</p>
            </Card>
          </Col>
        </Row>

        {/* Additional Stats */}
        <Row className="mb-5 g-4">
          <Col md={3}>
            <Card className="shadow-sm rounded-4 py-3 text-center">
              <FaBook size={32} className="mb-2" color="#a78bfa" />
              <h3>{stats.totalBooks}</h3>
              <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Total Books</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm rounded-4 py-3 text-center">
              <FaBook size={32} className="mb-2" color="#51cf66" />
              <h3>{stats.totalAvailableBooks}</h3>
              <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Available Books</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm rounded-4 py-3 text-center">
              <FaUsersCog size={32} className="mb-2" color="#fbbf24" />
              <h3>{stats.totalMembers}</h3>
              <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Total Members</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm rounded-4 py-3 text-center">
              <FaUserCheck size={32} className="mb-2" color="#ff6b6b" />
              <h3>{stats.pendingMembershipRequests}</h3>
              <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Membership Requests</p>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="shadow-sm rounded-4 p-4">
              <h5 className="text-center mb-3">User Distribution by Role</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {userStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-sm rounded-4 p-4">
              <h5 className="text-center mb-3">Monthly Activity</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityStats}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#4dabf7" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
