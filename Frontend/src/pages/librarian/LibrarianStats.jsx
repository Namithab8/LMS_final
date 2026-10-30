// src/pages/librarian/LibrarianStats.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { FaBook, FaBookOpen, FaExclamationTriangle, FaClipboardList, FaUsers } from "react-icons/fa";
import { request } from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LibrarianStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await request('/dashboard/librarian');
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

  return (
    <div style={{ minHeight: '400px' }}>
      <h3 className="mb-4" style={{ fontWeight: 700, color: '#111827' }}>
        Library Overview
      </h3>
      <Row className="g-4">
        <Col md={3} sm={6}>
          <Card className="shadow-sm rounded-4 py-4 text-center" style={{ background: 'linear-gradient(135deg, #e3f2fd, #ffffff)' }}>
            <FaBook size={40} className="mb-2" color="#1d4ed8" />
            <h2>{stats.totalBooks}</h2>
            <p style={{ fontWeight: '500' }}>Total Books</p>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm rounded-4 py-4 text-center" style={{ background: 'linear-gradient(135deg, #dcfce7, #ffffff)' }}>
            <FaBookOpen size={40} className="mb-2" color="#16a34a" />
            <h2>{stats.totalAvailableBooks}</h2>
            <p style={{ fontWeight: '500' }}>Available Books</p>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm rounded-4 py-4 text-center" style={{ background: 'linear-gradient(135deg, #fef3c7, #ffffff)' }}>
            <FaClipboardList size={40} className="mb-2" color="#d97706" />
            <h2>{stats.totalBorrowed}</h2>
            <p style={{ fontWeight: '500' }}>Books Borrowed</p>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm rounded-4 py-4 text-center" style={{ background: 'linear-gradient(135deg, #fee2e2, #ffffff)' }}>
            <FaExclamationTriangle size={40} className="mb-2" color="#dc2626" />
            <h2>{stats.totalOverdue}</h2>
            <p style={{ fontWeight: '500' }}>Overdue Books</p>
          </Card>
        </Col>
      </Row>
      <Row className="g-4 mt-4">
        <Col md={6}>
          <Card className="shadow-sm rounded-4 py-3 text-center" style={{ background: 'linear-gradient(135deg, #e0e7ff, #ffffff)' }}>
            <FaUsers size={32} className="mb-2" color="#4f46e5" />
            <h3>{stats.totalStudents}</h3>
            <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Active Students</p>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm rounded-4 py-3 text-center" style={{ background: 'linear-gradient(135deg, #fce7f3, #ffffff)' }}>
            <FaClipboardList size={32} className="mb-2" color="#db2777" />
            <h3>{stats.pendingRequests}</h3>
            <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Pending Requests</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
