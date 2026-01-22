import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Main from "./components/Main";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import SiteDetail from "./components/SiteDetail";

import './App.css'

function App() {
  return (
    <Router>
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Main />} />
         <Route path="/browse" element={<Browse />} />
         <Route path="/profile" element={<Profile />} />
         <Route path="/sitedetail" element={<SiteDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
