import { Badge, Card, Col, Row } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <h4 className="mb-1">Dashboard</h4>
          <p className="text-muted mb-0">Welcome, {user?.name}</p>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Account</h5>
              <p className="mb-2"><strong>Email:</strong> {user?.email}</p>
              <p className="mb-2">
                <strong>Role:</strong> <Badge bg="primary" className="text-capitalize">{user?.role}</Badge>
              </p>
              <p className="mb-0">
                <strong>Status:</strong> <Badge bg={user?.status === "active" ? "success" : "secondary"}>{user?.status}</Badge>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Access Permissions</h5>
              {user?.role === "admin" && <p className="mb-0">You can create, update, deactivate users and assign roles.</p>}
              {user?.role === "manager" && <p className="mb-0">You can view all users and update non-admin users.</p>}
              {user?.role === "user" && <p className="mb-0">You can view and update your own profile only.</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
