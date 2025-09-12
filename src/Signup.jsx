import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Headder from "./Headder";

function Signup(){
  const navigate = useNavigate(); 

  const [name,setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081'; 

  const handleSignUp = async (e) =>{
    e.preventDefault();
    if (!name || !email || !password) {
    setMessage("Please fill all details");
    return; }
    try{
      const response = await fetch(`${API_BASE}/api/auth/signup`,{
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({name,email,password}), 
      });
      const data = await response.text();

      if (response.ok) {
        navigate("/"); 
        window.location.reload();
      } 
      else {
        setMessage(data);
      }
    } 
    catch (error) {
      setMessage("Error: " + error.message);
    }
  }


    return(<>
    <Headder/><div className="signup-container">
        <center>
            <div className="signup-form">
                <h2 className="headder">Sign-Up Page</h2>
                <form onSubmit={handleSignUp}>
                     <div className="form-group">
            <label id="name">Name</label>
            <input
              placeholder="Enter your name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
                <div className="form-group">
            <label id="email">Email</label>
            <input
              placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
            />
          </div>
           <div className="form-group">
            <label id="password">Password</label>
            <input
              laceholder="Enter your password"
                  type="password"  
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="signup-btn">Sign Up</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </center>
    </div></>);
}
export default Signup;

