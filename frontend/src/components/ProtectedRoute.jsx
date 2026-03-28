import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 3;

    const checkAuth = () => {
      fetch(`${BASE_URL}/api/auth/session`, { credentials: "include" })
        .then((res) => {
          if (res.ok) {
            setIsAuth(true);
            setLoading(false);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkAuth, 300);
          } else {
            setIsAuth(false);
            setLoading(false);
          }
        })
        .catch(() => {
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkAuth, 300);
          } else {
            setIsAuth(false);
            setLoading(false);
          }
        });
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;