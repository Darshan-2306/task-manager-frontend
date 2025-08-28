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
  const [newUser, setNewUser] = useState({});
  const [newProject, setNewProject] = useState({});
  const [newTask, setNewTask] = useState({});

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
        navigate("/");
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

  // add user
  const handleAddUser = async () => {
    if(newUser.name == null || newUser.email==null || newUser.password==null || newUser.role == null)
    {
      alert("fill all fields to add user")
    }
    else{
    try {
      const res = await fetch("http://localhost:8081/user/admin/newUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to add user");

      alert("User added successfully");
      setNewUser({});
    } catch (err) {
      alert(err.message);
    }
  }
  };

  // add project
  const handleAddProject = async () => {
    if(newProject.project_name  == null || newProject.project_description==null)
    {
      alert("fill all fields to add project")
    }
    else{
    try {
      const res = await fetch("http://localhost:8081/project/admin/addNewProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProject),
      });

      if (!res.ok) throw new Error("Failed to add project");

      alert("Project added successfully");
      setNewProject({});
    } catch (err) {
      alert(err.message);
    }
  }
  };

  // add task
  const handleAddTask = async () => {
    if(newTask.taskName== null || newTask.taskDescription==null || newTask.projectId==null)
    {
      alert("fill all fields to add task")
    }
    else{
    try {
      const res = await fetch("http://localhost:8081/task/admin/addTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newTask),
      });

      if (!res.ok) throw new Error("Failed to add task");

      const message = await res.text(); // 👈 important change
      alert(message);
      setNewTask({});
    } catch (err) {
      alert(err.message);
    }
  }
  };

  return (
    <>
      <Headder />
      <div className="admin-container">
        <h1 className="page-title" style={{color : "white"}}>Admin Dashboard</h1>
        
        <div className="admin-content">
          {/* Left Column */}
          <div className="left-column">
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

            {/* Search Section */}
            <div className="admin-card">
              <h2>Search</h2>
              <div className="search-section">
                <div className="search-box">
                  <h3>Find User by ID</h3>
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

                <div className="search-box">
                  <h3>Find Project by ID</h3>
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
            </div>
          </div>

          {/* Middle Column */}
          <div className="middle-column">
            {/* Projects */}
            <div className="admin-card">
              <h2>All Projects </h2>
              <div className="list-container">
                {projects.map((project, index) => (
                  <div key={index} className="list-item">
                    <p><strong>{project.project_name}</strong></p>
                    <p>ID: {project.project_id}</p>
                    <p>{project.project_description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Users */}
            <div className="admin-card">
              <h2>All Users </h2>
              <div className="list-container">
                {users.map((user, index) => (
                  <div key={user.id || index} className="list-item">
                    <p><b>ID:</b> {user.id} | <b>Name:</b> {user.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Add New User */}
            <div className="admin-card">
              <h2>Add New User</h2>
              
              <input
                type="text"
                placeholder="Name"
                value={newUser.name || ""}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email || ""}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <input
                type="text"
                placeholder="Role"
                value={newUser.role || ""}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              />
              <button className="btn big-btn" onClick={handleAddUser}>
                Add User
              </button>
            </div>

            {/* Add New Project */}
            <div className="admin-card">
              <h2>Add New Project</h2>
              <input 
                type="text" 
                placeholder="Project Name" 
                value={newProject.project_name || ""} 
                onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
              />
              <textarea 
                placeholder="Project Description" 
                value={newProject.project_description || ""}
                onChange={(e) => setNewProject({ ...newProject, project_description: e.target.value })}
              />
              <button className="btn big-btn" onClick={handleAddProject}>Add Project</button>
            </div>

            {/* Add New Task */}
            <div className="admin-card">
              <h2>Add New Task</h2>
              <input 
                type="text" 
                placeholder="Task Title" 
                value={newTask.taskName || ""} 
                onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
              />
              <textarea 
                placeholder="Task Description" 
                value={newTask.taskDescription || ""} 
                onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Assign to Project ID" 
                value={newTask.projectId || ""} 
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
              />
              <button className="btn big-btn" onClick={handleAddTask}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPage;