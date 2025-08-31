import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Main from "./components/Main";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route  path="/main" element={<Main />} />
        <Route path="/" element={<Navbar />} />
        
        
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
