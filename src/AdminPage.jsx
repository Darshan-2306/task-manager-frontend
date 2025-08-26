import React, { useEffect, useState } from "react";
import Headder from "./Headder";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css"; // link CSS file

function AdminPage() {
  const [admin, setAdmin] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editAdmin, setEditAdmin] = useState({});
  const [newPassword, setNewPassword] = useState("");

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [searchUserId, setSearchUserId] = useState("");
  const [searchProjectId, setSearchProjectId] = useState("");

  const navigate = useNavigate();

//admin details
    useEffect(() => {
      const fetchAdmin = async () => {
        try {
          const res = await fetch("http://localhost:8081/user/my_details", {
            method: "GET",
            credentials: "include",
          });
  
          if (!res.ok) throw new Error("Failed to fetch user");
  
          const data = await res.json();
          setAdmin(data);
          setEditAdmin(data);
        } catch (err) {
          console.error(err);
          alert("Session expired, please log in again");
        }
      };
  
      fetchAdmin();
    }, []);
  
    //all projects

    useEffect(() => {
        const fetchProject = async () => {
          try {
            const res = await fetch("http://localhost:8081/project/admin/getAllProject", {
              method: "GET",
              credentials: "include",
            });
    
            if (!res.ok) throw new Error("Failed to fetch projects");
    
            const data = await res.json();
            setProjects(data);
          } catch (err) {
            console.error(err);
          }
        };
    
        fetchProject();
      }, []);

      //all user details
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const res = await fetch("http://localhost:8081/user/admin/getAllUser", {
            method: "GET",
            credentials: "include",
          });
  
          if (!res.ok) throw new Error("Failed to fetch user");
  
          const data = await res.json();
          setUsers(data);
        } catch (err) {
          console.error(err);
          alert("Session expired, please log in again");
        }
      };
  
      fetchUsers();
    }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditAdmin(admin);
    setNewPassword("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditAdmin({ ...editAdmin, [name]: value });
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSave = () => {
    const payload = {
      name: editAdmin.name,
      email: editAdmin.email,
      ...(newPassword.trim() !== "" && { password: newPassword }),
    };

    setAdmin(payload);
    setIsEditing(false);
    setNewPassword("");
  };

  const handleUserSearch = () => {
    if (searchUserId.trim() !== "") {
      navigate(`/user/${searchUserId}`);
    }
  };

  const handleProjectSearch = () => {
    if (searchProjectId.trim() !== "") {
      navigate(`/project/${searchProjectId}`);
    }
  };

  return (
    <>
      <Headder />
      <div className="admin-container">
        {/* Admin Details */}
        <div className="admin-card">
          <h2>Admin Details</h2>
          {isEditing ? (
            <>
              <input
                type="text"
                name="name"
                value={editAdmin.name}
                onChange={handleInputChange}
                placeholder="Name"
              />
              <input
                type="email"
                name="email"
                value={editAdmin.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
              <input
                type="password"
                value={newPassword}
                onChange={handlePasswordChange}
                placeholder="New Password"
              />
              <div className="btn-group">
                <button onClick={handleSave} className="btn save">
                  Save
                </button>
                <button onClick={handleEditToggle} className="btn cancel">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p><b>Name:</b> {admin.name}</p>
              <p><b>Email:</b> {admin.email}</p>
              <button onClick={handleEditToggle} className="btn edit">
                Edit
              </button>
            </>
          )}
        </div>

        {/* Projects */}
        <div className="admin-card">
          <h2>All Projects</h2>
        
            {projects.map((project, index) => (
              <div key={index} className="item-card">
                <p><strong>Title: {project.project_name}</strong></p>
                <p>ID: {project.project_id}</p>
                <p>Description: {project.project_description}</p>
              </div>
            ))}
       
        </div>

        {/* Users */}
        <div className="admin-card">
          <h2>All Users</h2>
          <ul>
            {users.map((user , index) => (
              <li key={user.id || index}>
                <p><b>User-Id : </b>{user.id}. <b>User-name : </b>{user.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-container">
        <div className="admin-card">
          <h2>Find User by ID</h2>
          <input
            type="text"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            placeholder="Enter User ID"
          />
          <button onClick={handleUserSearch} className="btn search">
            Search User
          </button>
        </div>

        <div className="admin-card">
          <h2>Find Project by ID</h2>
          <input
            type="text"
            value={searchProjectId}
            onChange={(e) => setSearchProjectId(e.target.value)}
            placeholder="Enter Project ID"
          />
          <button onClick={handleProjectSearch} className="btn search">
            Search Project
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminPage;
