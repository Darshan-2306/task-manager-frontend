import React, { useEffect, useState } from "react";
import Headder from "./Headder";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

function AdminPage() {
  const [admin, setAdmin] = useState({});
  const [activeTab, setActiveTab] = useState("users");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const [newProject, setNewProject] = useState({
    project_name: "",
    project_description: ""
  });

  const navigate = useNavigate();

  // Admin details
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
      } catch (err) {
        console.error(err);
        alert("Session expired, please log in again");
        navigate("/");
      }
    };

    fetchAdmin();
  }, [navigate]);

  // All projects
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch("http://localhost:8081/project/admin/getAllProject", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch projects");

        const data = await res.json();
        console.log("Fetched projects:", data); // Debug log
        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProject();
  }, []);

  // All user details
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

  // Add user function
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      alert("Please fill all fields to add user");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/user/admin/newUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to add user");

      alert("User added successfully");
      setNewUser({ name: "", email: "", password: "", role: "USER" });
      
      // Refresh users list
      const usersRes = await fetch("http://localhost:8081/user/admin/getAllUser", {
        method: "GET",
        credentials: "include",
      });
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Add project function
  const handleAddProject = async () => {
    if (!newProject.project_name || !newProject.project_description) {
      alert("Please fill all fields to add project");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/project/admin/addNewProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProject),
      });

      if (!res.ok) throw new Error("Failed to add project");

      alert("Project added successfully");
      setNewProject({ project_name: "", project_description: "" });
      
      // Refresh projects list
      const projectsRes = await fetch("http://localhost:8081/project/admin/getAllProject", {
        method: "GET",
        credentials: "include",
      });
      
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Navigate to user details
  const handleUserClick = (userId) => {
    console.log("Navigating to user ID:", userId); // Debug log
    if (userId) {
      navigate(`/user/${userId}`);
    } else {
      alert("User ID is missing");
    }
  };

  // Navigate to project details - Fixed with debugging
  const handleProjectClick = (projectId) => {
    console.log("Navigating to project ID:", projectId); // Debug log
    if (projectId) {
      navigate(`/project/${projectId}`);
    } else {
      alert("Project ID is missing. Check the project data structure.");
    }
  };

  // Handle user input change
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Handle project input change
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  // Debug function to check project data structure
  const debugProjectData = (project, index) => {
    console.log(`Project ${index}:`, project);
    console.log(`Project ${index} ID:`, project.id);
    return project.id;
  };

  return (
    <>
      <Headder />
      <div className="Dash">
        <div className="headder">Admin Dashboard</div>
        <div className="Dbody">
          <div className="Show">
            <div 
              className={`Usershow ${activeTab === "users" ? "active" : ""}`} 
              onClick={() => setActiveTab("users")}
            >
              <b>Users</b>
            </div>
            <div 
              className={`Projectshow ${activeTab === "projects" ? "active" : ""}`} 
              onClick={() => setActiveTab("projects")}
            >
              <b>Projects</b>
            </div>
          </div>
          
          <div className="content-area">
            {activeTab === "users" ? (
              <div className="userbody">
                <h1>Users Available: {users.length}</h1>
                
                <div className="modules-container">
                   <div className="admin-card list-module">
                    <h2>All Users</h2>
                    <div className="list-container">
                      {users.map((user, index) => (
                        <div 
                          key={user.id || index} 
                          className="list-item clickable"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <p><b>ID:</b> {user.id} | <b>Name:</b> {user.name} </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="admin-card form-module">
                    <h2>Add New User</h2>
                    <div className="form-container">
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={handleUserInputChange}
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={handleUserInputChange}
                      />
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={handleUserInputChange}
                      />
                      <input
                        type="text"
                        name="role"
                        placeholder="Role"
                        value={newUser.role}
                        onChange={handleUserInputChange}
                      />
                     
                      <button onClick={handleAddUser}>Add User</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="projectbody">
                <h1>Projects Available: {projects.length}</h1>
                
                <div className="modules-container">
                  <div className="admin-card list-module">
                    <h2>All Projects</h2>
                    <div className="list-container">
                      {projects.map((project, index) => {
                        // Debug the project data
                        const projectId = project.id || project.projectId || project.projectID;
                        console.log(`Rendering project ${index}:`, project, "ID:", projectId);
                        
                        return (
                          <div 
                            key={projectId || index} 
                            className="list-item clickable"
                            onClick={() => handleProjectClick(project.project_id)}
                          >
                            <p><b>ID:</b> {project.project_id} | <b>Name:</b> {project.project_name}</p>
                            {project.project_description && (
                              <p><b>Description:</b> {project.project_description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="admin-card form-module">
                    <h2>Add New Project</h2>
                    <div className="form-container">
                      <input
                        type="text"
                        name="project_name"
                        placeholder="Project Name"
                        value={newProject.project_name}
                        onChange={handleProjectInputChange}
                      />
                      <textarea
                        name="project_description"
                        placeholder="Project Description"
                        value={newProject.project_description}
                        onChange={handleProjectInputChange}
                      />
                      <button onClick={handleAddProject}>Add Project</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPage;