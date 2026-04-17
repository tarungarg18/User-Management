import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { callApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

function dateText(v) {
  if (!v) return "-";
  return new Date(v).toLocaleString();
}

export default function ProfilePage() {
  const { token, user, refreshMyData } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadMeNow() {
    try {
      const me = await callApi("/users/me", "GET", null, token);
      setInfo(me);
      setName(me.name);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadMeNow();
  }, []);

  async function updateProfileNow(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);

    try {
      const body = { name };
      if (password.trim()) body.password = password;
      await callApi("/users/me", "PATCH", body, token);
      await refreshMyData();
      await loadMeNow();
      setPassword("");
      setMsg("Profile updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!info) {
    return (
      <Card className="shadow-sm border-0">
        <Card.Body className="text-center py-4">
          {error ? <Alert variant="danger" className="mb-0">{error}</Alert> : <Spinner animation="border" />}
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h4 className="mb-1">My Profile</h4>
              <div className="text-muted">{info.email}</div>
            </div>
            <div className="d-flex gap-2">
              <Badge bg="primary" className="text-capitalize">{info.role}</Badge>
              <Badge bg={info.status === "active" ? "success" : "secondary"}>{info.status}</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {msg && <Alert variant="success">{msg}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Form onSubmit={updateProfileNow}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Leave blank if not changing"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" className="mt-3" disabled={busy}>{busy ? "Updating..." : "Update Profile"}</Button>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6>Audit Timeline</h6>
              <p className="mb-2"><strong>Created:</strong> {dateText(info.createdAt)}</p>
              <p className="mb-0"><strong>Updated:</strong> {dateText(info.updatedAt)}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6>Account Info</h6>
              <p className="mb-2"><strong>Name:</strong> {info.name}</p>
              <p className="mb-2"><strong>Email:</strong> {info.email}</p>
              <p className="mb-0"><strong>Role:</strong> {info.role}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
