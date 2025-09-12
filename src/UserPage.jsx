import React, { useEffect, useState } from "react";
import "./UserPage.css";
import Headder from "./Headder";
import { useNavigate } from "react-router-dom";

function UserPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [newPassword, setNewPassword] = useState(""); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFiles, setTaskFiles] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const token = localStorage.getItem("token");

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';

  // Logout function
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    navigate("/");
  };

  // fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/my_details`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);
        setEditUser(data);
      } catch (err) {
        console.error(err);
        alert("Session expired, please log in again");
        await navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  // fetch projects
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${API_BASE}/project_user/my_projects`, {
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

  // fetch tasks
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API_BASE}/task_User/my_tasks`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTask();
  }, []);

  // Fetch task files using the correct endpoint
  const fetchTaskFiles = async (taskId) => {
    try {
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
    await fetchTaskFiles(task.taskId || task.id);
  };

  // Close task modal
  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setTaskFiles([]);
  };

  // Download file function
  const downloadFile = (remoteFileName) => {
    const url = `${API_BASE}/sftp/download?remoteFileName=${encodeURIComponent(remoteFileName)}`;

    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditUser(user); 
    setNewPassword("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSave = async () => {
    const payload = {
      name: editUser.name,
      email: editUser.email,
      ...(newPassword.trim() !== "" && { password: newPassword })
    };

    try {
      const res = await fetch(`${API_BASE}/user/updateMy_Details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update user");

      const updatedUser = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
      setNewPassword(""); // clear password input
      alert("Details updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating details");
    }
  };

  return (
    <>
      <Headder />
      <div className="page-header">
        <h1>User Dashboard</h1>
        <button className="logout-button1" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="page-container">
        <div className="left-column">
          <div className="card user-card">
            <h2>User Details</h2>
            {isEditing ? (
              <>
                <p>
                  <strong>Name:</strong>{" "}
                  <input
                    type="text"
                    name="name"
                    value={editUser.name || ""}
                    onChange={handleInputChange}
                  />
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <input
                    type="email"
                    name="email"
                    value={editUser.email || ""}
                    onChange={handleInputChange}
                  />
                </p>
                <p>
                  <strong>Password:</strong>{" "}
                  <input
                    type="password"
                    name="password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </p>
                <p>
                  <strong>Role:</strong> {user.role} 
                </p>
                <button className="signup-btn" onClick={handleSave}>
                  Save
                </button>
                <button className="signup-btn" onClick={handleEditToggle}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <button className="signup-btn" onClick={handleEditToggle}>
                  Edit
                </button>
              </>
            )}
          </div>

          <div className="card project-card">
            <h2>Projects</h2>
            {projects.map((project, index) => (
              <div key={index} className="item-card">
                <p><strong>Title: {project.project_name}</strong></p>
                <p>ID: {project.project_id}</p>
                <p>Description: {project.project_description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="right-column">
          <div className="card task-card">
            <h2>Tasks</h2>
            {tasks.map((task, index) => (
              <div 
                key={index} 
                className="item-card clickable"
                onClick={() => handleTaskClick(task)}
              >
                <p>Title: {task.taskName}</p>
                <p>ID: {task.taskId}</p>
                <p>Project ID: {task.projectId}</p>
                <p>Description: {task.taskDescription}</p>
              </div>
            ))}
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
                  <span className="detail-value">{selectedTask.taskDescription || selectedTask.description || "No description"}</span>
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

export default UserPage;