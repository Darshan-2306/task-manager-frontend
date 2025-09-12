import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Headder from "./Headder";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const signup_page = () => {
    navigate("/signup");
  };

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081'; 


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);

        if (data.role === "Admin") {
          navigate("/AdminPage");
        } else {
          navigate("/UserPage");
        }
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Error: invalid details");
    }
  };

 
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      debugger;
      const idToken = credentialResponse.credential;
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      const { sub: googleId, email, name } = payload;

      const response = await fetch(`${API_BASE}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ googleId, email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);

        if (data.role === "Admin") {
          navigate("/AdminPage");
        } else {
          navigate("/UserPage");
        }
      } else {
        setMessage(data.message || "Google login failed");
      }
    } catch (error) {
      setMessage("Error: Google login failed");
    }
  };

  return (
    <>
      <Headder />
      <div className="login-container">
        <center>
          <div className="login-form">
            <h2 className="login-title">Login</h2>

            {/* Local Login */}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="submit-btn">
                Sign In
              </button>
            </form>

            {message && <p>{message}</p>}

            <div className="divider">
              <span>or</span>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setMessage("Google Login Failed")}
            />

            <div className="divider">
              <span>or</span>
            </div>

            <button className="signup-btn" onClick={signup_page}>
              Create an Account
            </button>
          </div>
        </center>
      </div>
    </>
  );
}

export default Login;
