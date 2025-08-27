import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Headder from "./Headder";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const signup_page = () => {
    navigate("/signup");
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch("http://localhost:8081/api/auth/login", {
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
    setMessage("Error: " + error.message);
  }
};



  return (
    <>
      <Headder />
      <div className="login-container">
        <center>
          <div className="login-form">
            <h2 className="headder">Login Page</h2>
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
