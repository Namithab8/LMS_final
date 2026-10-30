import React, { useState } from 'react';
import { Container, Card, Button, Form, Row, Col, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    course: "",
    avatar: "https://placehold.co/150x150", // default avatar
  });

  const [editMode, setEditMode] = useState(true); // start in edit mode
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imgURL = URL.createObjectURL(e.target.files[0]);
      setFormData({ ...formData, avatar: imgURL });
    }
  };

  const handleSave = () => {
    setUser(formData);
    setEditMode(false);

    const msg = document.getElementById("save-msg");
    if (msg) {
      msg.style.display = "block";
      setTimeout(() => (msg.style.display = "none"), 3000);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "50px",
        paddingBottom: "50px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1,
        }}
      ></div>

      <Container style={{ position: "relative", zIndex: 2 }}>
        <h2
          className="text-white text-center mb-5"
          style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.7)" }}
        >
          My Profile
        </h2>

        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-lg rounded-4 text-center p-4 bg-light">
              <div
                style={{
                  width: 120,
                  height: 120,
                  margin: "0 auto 15px auto",
                  overflow: "hidden",
                  borderRadius: "50%",
                  border: "3px solid #0d6efd",
                }}
              >
                <Image
                  src={formData.avatar || "https://placehold.co/150x150"}
                  roundedCircle
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {editMode ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      placeholder="Enter your name"
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      placeholder="Enter your email"
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Course</Form.Label>
                    <Form.Control
                      type="text"
                      name="course"
                      value={formData.course}
                      placeholder="Enter your course"
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Upload Profile Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between">
                    <Button variant="success" onClick={handleSave}>
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <h4 className="mb-2">{user.name || "Your Name"}</h4>
                  <h6 className="mb-2">{user.email || "you@example.com"}</h6>
                  <p className="mb-3">
                    {user.course || "Your course will appear here"}
                  </p>
                  <Button variant="primary" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                </>
              )}
            </Card>

            <div
              id="save-msg"
              style={{
                display: "none",
                marginTop: "15px",
                color: "darkgreen",
                fontWeight: "600",
                textAlign: "center",
                fontSize: "16px",
              }}
            >
              &#10003; Profile updated successfully!
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
