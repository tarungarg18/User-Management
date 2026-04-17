import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { callApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginNow } = useAuth();
  const [email, setEmail] = useState("admin@purplemerit.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [showSeed, setShowSeed] = useState(false);
  const [seedName, setSeedName] = useState("Main Admin");
  const [seedEmail, setSeedEmail] = useState("admin@purplemerit.com");
  const [seedPassword, setSeedPassword] = useState("Admin@123");
  const [seedKey, setSeedKey] = useState("");
  const [seedMessage, setSeedMessage] = useState("");
  const [seedError, setSeedError] = useState("");
  const [seedBusy, setSeedBusy] = useState(false);

  const go = useNavigate();

  async function submitNow(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await loginNow(email, password);
      go("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function seedNow(e) {
    e.preventDefault();
    setSeedBusy(true);
    setSeedError("");
    setSeedMessage("");

    try {
      await callApi("/auth/seed-admin-once", "POST", {
        name: seedName,
        email: seedEmail,
        password: seedPassword,
        seedKey
      });
      setSeedMessage("Admin seeded. You can login now.");
      setEmail(seedEmail);
      setPassword(seedPassword);
    } catch (err) {
      setSeedError(err.message);
    } finally {
      setSeedBusy(false);
    }
  }

  return (
    <div className="loginShell">
      <Container>
        <Row className="justify-content-center">
          <Col lg={5} md={7}>
            <Card className="shadow-lg border-0 loginCard">
              <Card.Body className="p-4 p-md-5">
                <h3 className="mb-1">Welcome Back</h3>
                <p className="text-muted mb-4">Login to continue to user management panel</p>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={submitNow}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100" disabled={busy}>
                    {busy ? "Please wait..." : "Login"}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="d-flex align-items-center justify-content-between">
                  <span className="small text-muted">Need first admin setup?</span>
                  <Button variant="outline-primary" size="sm" onClick={() => setShowSeed((v) => !v)}>
                    {showSeed ? "Hide" : "Seed Admin Once"}
                  </Button>
                </div>

                {showSeed && (
                  <Form className="mt-3" onSubmit={seedNow}>
                    {seedMessage && <Alert variant="success">{seedMessage}</Alert>}
                    {seedError && <Alert variant="danger">{seedError}</Alert>}

                    <Form.Group className="mb-2">
                      <Form.Label>Name</Form.Label>
                      <Form.Control value={seedName} onChange={(e) => setSeedName(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={seedEmail}
                        onChange={(e) => setSeedEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={seedPassword}
                        onChange={(e) => setSeedPassword(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Seed Key (if configured)</Form.Label>
                      <Form.Control
                        value={seedKey}
                        onChange={(e) => setSeedKey(e.target.value)}
                        placeholder="optional"
                      />
                    </Form.Group>
                    <Button type="submit" variant="success" className="w-100" disabled={seedBusy}>
                      {seedBusy ? "Seeding..." : "Create First Admin"}
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
