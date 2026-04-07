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
    return <LoadingSpinner text="Loading Workplace..." />;
  }

  if (!isAuth) {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/login"; // 💀 full reload
    return null;
  }

  return children;
};