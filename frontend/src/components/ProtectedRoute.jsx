import LoadingSpinner from "./ui/LoadingSpinner";
import { useUser } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <LoadingSpinner text="Loading Workplace..." />;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return children;
};

export default ProtectedRoute;