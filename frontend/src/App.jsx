import { Container } from "react-bootstrap";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import GuardRoute from "./components/GuardRoute";
import TopNav from "./components/TopNav";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import ProfilePage from "./pages/ProfilePage";

function PrivateArea({ children }) {
  return (
    <GuardRoute>
      <TopNav />
      <Container className="py-4">{children}</Container>
    </GuardRoute>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateArea>
            <DashboardPage />
          </PrivateArea>
        }
      />
      <Route
        path="/users"
        element={
          <GuardRoute roles={["admin", "manager"]}>
            <TopNav />
            <Container className="py-4">
              <UsersPage />
            </Container>
          </GuardRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <GuardRoute roles={["admin", "manager"]}>
            <TopNav />
            <Container className="py-4">
              <UserDetailPage />
            </Container>
          </GuardRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateArea>
            <ProfilePage />
          </PrivateArea>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
