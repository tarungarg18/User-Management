import { Badge, Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopNav() {
  const { user, clearSession } = useAuth();
  const go = useNavigate();

  function logoutNow() {
    clearSession();
    go("/login");
  }

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-semibold">Purple Merit Panel</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            {(user?.role === "admin" || user?.role === "manager") && (
              <Nav.Link as={Link} to="/users">Users</Nav.Link>
            )}
            <Nav.Link as={Link} to="/profile">My Profile</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center gap-2">
            <Badge bg="primary" className="text-capitalize">{user?.role}</Badge>
            <span className="small text-muted">{user?.name}</span>
            <Button variant="outline-danger" size="sm" onClick={logoutNow}>Logout</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
