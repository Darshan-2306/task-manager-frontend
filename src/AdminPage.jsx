
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
  const [myTasks, setMyTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFiles, setTaskFiles] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';

  

  // Logout function
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    navigate("/");
  };

  // Admin details
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/my_details`, {
          method: "GET",
          credentials: "include",
           headers: {
    "Authorization": `Bearer ${token}`,   // 🔑 JWT goes here
    "Content-Type": "application/json"
  }
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error(err);
        alert("session time out");
        await navigate("/");
      }
    };

    fetchAdmin();
  }, [navigate]);

  // All projects
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${API_BASE}/project/admin/getAllProject`, {
          method: "GET",
          headers: {
    Authorization: `Bearer ${token}`,   // 🔑 JWT goes here
    // "Content-Type": "application/json"
  },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch projects");

        const data = await res.json();
        console.log("Fetched projects:", data);
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
        const res = await fetch(`${API_BASE}/user/admin/getAllUser`, {
          headers: {
         "Authorization": `Bearer ${token}`,   // 🔑 JWT goes here
         "Content-Type": "application/json"
  },
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      
      }
    };

    fetchUsers();
  }, []);

  // Fetch my tasks using the /my_tasks endpoint
  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/task_User/my_tasks`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setMyTasks(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch my tasks:", err);
      }
    };

    fetchMyTasks();
  }, []);

  // Fetch my projects using the /my_projects endpoint
  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/project_user/my_projects`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setMyProjects(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch my projects:", err);
      }
    };

    fetchMyProjects();
  }, []);

  // Fetch task files using the correct endpoint from ProjectDetailPage
  const fetchTaskFiles = async (taskId) => {
    try {
      // Using the correct endpoint /getAttachedFiles with query parameter
      const res = await fetch(`${API_BASE}/sftp/getAttachedFiles?taskId=${taskId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const files = await res.json();
        setTaskFiles(files || []);
        console.log(`Found ${files.length} files for task ${taskId}`);
      } else {
        console.log("No files found for this task or error fetching files");
        setTaskFiles([]);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setTaskFiles([]);
    }
  };

  // Handle task click - show modal with task details and files
  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
    await fetchTaskFiles(task.id || task.taskId);
  };

  // Close task modal
  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setTaskFiles([]);
  };

  // Download file function from ProjectDetailPage
  const downloadFile = (remoteFileName) => {
    const url = `${API_BASE}/sftp/download?remoteFileName=${encodeURIComponent(remoteFileName)}`;

    fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Download failed");
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = remoteFileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        console.error("Error downloading file:", err);
        alert("Error downloading file: " + err.message);
      });
  };

  // Add user function
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      alert("Please fill all fields to add user");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/user/admin/newUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to add user");

      alert("User added successfully");
      setNewUser({ name: "", email: "", password: "", role: "USER" });
      
      // Refresh users list
      const usersRes = await fetch(`${API_BASE}/user/admin/getAllUser`, {
        method: "GET",
        credentials: "include",
        headers: {
    "Authorization": `Bearer ${token}`,   // 🔑 JWT goes here
    "Content-Type": "application/json"
  },
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
      const res = await fetch(`${API_BASE}/project/admin/addNewProject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProject),
      });

      if (!res.ok) throw new Error("Failed to add project");

      alert("Project added successfully");
      setNewProject({ project_name: "", project_description: "" });
      
      // Refresh projects list
      const projectsRes = await fetch(`${API_BASE}/project/admin/getAllProject`, {
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
    console.log("Navigating to user ID:", userId);
    if (userId) {
      navigate(`/user/${userId}`);
    } else {
      alert("User ID is missing");
    }
  };

  // Navigate to project details
  const handleProjectClick = (projectId) => {
    console.log("Navigating to project ID:", projectId);
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

  return (
    <>
      <Headder />
      <div className="Dash">
        <div className="headder">
          Admin Dashboard
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
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
            <div 
              className={`Detailshow ${activeTab === "mydetails" ? "active" : ""}`} 
              onClick={() => setActiveTab("mydetails")}
            >
              <b>My Details</b>
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
            ) : activeTab === "projects" ? (
              <div className="projectbody">
                <h1>Projects Available: {projects.length}</h1>
                
                <div className="modules-container">
                  <div className="admin-card list-module">
                    <h2>All Projects</h2>
                    <div className="list-container">
                      {projects.map((project, index) => {
                        const projectId = project.id || project.projectId || project.projectID;
                        console.log(`Rendering project ${index}:`, project, 'ID:', projectId);
                        
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
            ) : (
              <div className="admin-details-body">
                <h1>My Details</h1>
                
                <div className="modules-container">
                  <div className="admin-card details-module">
                    <h2>Admin Information</h2>
                    <div className="details-container">
                      {admin ? (
                        <>
                          <div className="detail-item">
                            <span className="detail-label">ID:</span>
                            <span className="detail-value">{admin.id || "N/A"}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{admin.name || "N/A"}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{admin.email || "N/A"}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value">{admin.role || "N/A"}</span>
                          </div>
                        </>
                      ) : (
                        <p>Loading admin details...</p>
                      )}
                    </div>
                  </div>
                  
                  {/* My Tasks Module */}
                  <div className="admin-card list-module">
                    <h2>My Tasks ({myTasks.length})</h2>
                    <div className="list-container">
                      {myTasks.length > 0 ? (
                        myTasks.map((task, index) => (
                          <div 
                            key={task.id || index} 
                            className="list-item clickable"
                            onClick={() => handleTaskClick(task)}
                          >
                            <p><b>ID:</b> {task.taskId} | <b>Title:</b> {task.taskName}</p>
                    
                            {task.due_date && (
                              <p><b>Due Date:</b> {new Date(task.due_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="list-item">
                          <p>No tasks assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* My Projects Module */}
                  <div className="admin-card list-module">
                    <h2>My Projects ({myProjects.length})</h2>
                    <div className="list-container">
                      {myProjects.length > 0 ? (
                        myProjects.map((project, index) => {
                          const projectId = project.id || project.project_id || project.projectID;
                          return (
                            <div 
                              key={projectId || index} 
                              className="list-item clickable"
                              onClick={() => handleProjectClick(projectId)}
                            >
                              <p><b>ID:</b> {projectId} | <b>Name:</b> {project.project_name || project.name}</p>
                              {project.project_description && (
                                <p><b>Description:</b> {project.project_description}</p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="list-item">
                          <p>No projects assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Details</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="task-details">
                <div className="detail-row">
                  <span className="detail-label">Task ID:</span>
                  <span className="detail-value">{selectedTask.id || selectedTask.taskId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedTask.taskName || selectedTask.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedTask.description || "No description"}</span>
                </div>
                {selectedTask.due_date && (
                  <div className="detail-row">
                    <span className="detail-label">Due Date:</span>
                    <span className="detail-value">{new Date(selectedTask.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedTask.status && (
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{selectedTask.status}</span>
                  </div>
                )}
              </div>

              <div className="task-files">
                <h3>Attached Files</h3>
                {taskFiles.length > 0 ? (
                  <div className="files-list">
                    {taskFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-name">{file.fileName || file}</span>
                        <button 
                          className="download-button"
                          onClick={() => downloadFile(file.fileName || file)}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No files attached to this task</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPage;