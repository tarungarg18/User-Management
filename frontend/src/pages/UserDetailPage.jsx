import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { callApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

function showDate(text) {
  if (!text) return "-";
  return new Date(text).toLocaleString();
}

export default function UserDetailPage() {
  const { id } = useParams();
  const go = useNavigate();
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadOneNow() {
    try {
      const d = await callApi(`/users/${id}`, "GET", null, token);
      setData(d);
      setName(d.name);
      setEmail(d.email);
      setRole(d.role);
      setStatus(d.status);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadOneNow();
  }, [id]);

  async function updateNow(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      await callApi(`/users/${id}`, "PATCH", { name, email, role, status }, token);
      setMessage("User updated");
      await loadOneNow();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deactivateNow() {
    setError("");
    try {
      await callApi(`/users/${id}`, "DELETE", null, token);
      go("/users");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!data) {
    return (
      <Card className="shadow-sm border-0">
        <Card.Body className="text-center py-4">
          {error ? <Alert variant="danger" className="mb-0">{error}</Alert> : <Spinner animation="border" />}
        </Card.Body>
      </Card>
    );
  }

  const managerEditRole = user?.role === "manager";

  return (
    <>
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center">
            <div>
              <h4 className="mb-1">User Detail</h4>
              <div className="text-muted">{data.email}</div>
            </div>
            <Badge bg={status === "active" ? "success" : "secondary"}>{status}</Badge>
          </div>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Form onSubmit={updateNow}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select value={role} onChange={(e) => setRole(e.target.value)} disabled={managerEditRole}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mt-3">
              <Button type="submit" disabled={busy}>{busy ? "Updating..." : "Update User"}</Button>
              {user?.role === "admin" && (
                <Button variant="outline-danger" onClick={deactivateNow}>Deactivate User</Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6>Audit Timeline</h6>
              <p className="mb-2"><strong>Created:</strong> {showDate(data.createdAt)}</p>
              <p className="mb-0"><strong>Updated:</strong> {showDate(data.updatedAt)}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6>Audit Users</h6>
              <p className="mb-2"><strong>Created By:</strong> {data.createdBy?.name || "-"} ({data.createdBy?.email || "-"})</p>
              <p className="mb-0"><strong>Updated By:</strong> {data.updatedBy?.name || "-"} ({data.updatedBy?.email || "-"})</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
