import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { callApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function UsersPage() {
  const { token, user } = useAuth();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newStatus, setNewStatus] = useState("active");
  const [createBusy, setCreateBusy] = useState(false);

  async function loadUsersNow(nextPage = page) {
    setLoading(true);
    setError("");

    const query = new URLSearchParams({
      page: String(nextPage),
      limit: "8",
      search,
      role,
      status
    });

    try {
      const data = await callApi(`/users?${query.toString()}`, "GET", null, token);
      setList(data.data || []);
      setMeta({ total: data.total || 0, totalPages: data.totalPages || 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsersNow();
  }, [page, role, status]);

  async function submitSearch(e) {
    e.preventDefault();
    setPage(1);
    await loadUsersNow(1);
  }

  function resetCreateForm() {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("user");
    setNewStatus("active");
  }

  async function createNow(e) {
    e.preventDefault();
    if (user?.role !== "admin") return;

    setCreateBusy(true);
    setError("");

    try {
      await callApi(
        "/users",
        "POST",
        {
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          status: newStatus
        },
        token
      );

      resetCreateForm();
      setShowCreate(false);
      await loadUsersNow();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateBusy(false);
    }
  }

  return (
    <>
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
            <div>
              <h4 className="mb-0">Users</h4>
              <div className="text-muted small">Manage users with filters and role-based access</div>
            </div>
            {user?.role === "admin" && (
              <Button onClick={() => setShowCreate(true)}>Create User</Button>
            )}
          </div>

          <Form onSubmit={submitSearch}>
            <Row className="g-2">
              <Col md={5}>
                <Form.Control
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button type="submit" className="w-100">Apply</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><Badge bg="primary" className="text-capitalize">{u.role}</Badge></td>
                    <td>
                      <Badge bg={u.status === "active" ? "success" : "secondary"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button as={Link} to={`/users/${u.id}`} size="sm" variant="outline-primary">View</Button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No users found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
        <div className="text-muted small">Total users: {meta.total}</div>
        <Pagination className="mb-0">
          <Pagination.Prev disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
          <Pagination.Item active>{page}</Pagination.Item>
          <Pagination.Next disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} />
        </Pagination>
      </div>

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={createNow}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control value={newName} onChange={(e) => setNewName(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </Form.Group>
            <Row className="g-2">
              <Col>
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={createBusy}>{createBusy ? "Creating..." : "Create User"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
