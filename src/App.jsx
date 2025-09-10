import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./Login";
import Signup from "./Signup";
import UserPage from "./UserPage";
import AdminPage from "./AdminPage";
import ProjectDetailPage from "./ProjectDetailPage";
import UserDetailPage from "./UserDetailPage";

import "./App.css";
import "./login.css";
import "./Signup.css";
import "./Headder.css";

function App() {
  return (
    <GoogleOAuthProvider clientId="1056411485815-07adekpgobbj423hpilu5mf70ra43ppd.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/userPage" element={<UserPage />} />
          <Route path="/adminpage" element={<AdminPage />} />
          <Route path="/user/:id" element={<UserDetailPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
