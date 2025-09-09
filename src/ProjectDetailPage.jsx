import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Headder from "./Headder";
import './ProjectDetail.css';

function ProjectDetailPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProject, setEditProject] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState({ userId: ""});
  const [taskFiles, setTaskFiles] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDescription: "",
    projectId: id,
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8081/project/admin/getProjectById/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Project not found");
        const data = await res.json();
        setProject(data);
        setEditProject({ project_name: data.project_name, project_description: data.project_description });
      } catch (err) {
        alert("session time out");
        await navigate("/");
        console.error(err);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8081/task/admin/getTaskByProjectId/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Tasks not found");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:8081/project_user/admin/UserDetail/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Users not found");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const res = await fetch("http://localhost:8081/user/admin/getAllUser", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setAllUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProject();
    fetchTasks();
    fetchUsers();
    fetchAllUsers();
  }, [id, token, navigate]);

  // Edit project input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProject({ ...editProject, [name]: value });
  };

  // Handle new task input change
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // Save edited project
  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:8081/project/admin/updateProject/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(editProject),
      });

      if (!res.ok) throw new Error("Failed to update project");
      const updated = await res.json();
      setProject(updated);
      setIsEditing(false);
      alert("Project updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating project: " + err.message);
    }
  };

  // Delete project
  const RemoveProject = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const proj = await fetch(`http://localhost:8081/project_user/admin/deleteByProject`,{
          method : "DELETE",
          credentials: "include",
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({projectId : id})
        })

        const task = await fetch(`http://localhost:8081/task_User/admin/deleteByProj`,{
          method : "DELETE",
          credentials: "include",
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({projectId : id})
        })

        const res = await fetch(`http://localhost:8081/project/admin/deleteProject/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          alert("Project removed successfully");
          navigate("/AdminPage");
        } else {
          throw new Error("Unsuccessful delete");
        }
      } catch (err) {
        console.error(err);
        alert(err);
      }
    }
  };

  // Upload files for a task
  const uploadFiles = async (taskId, files) => {
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    formData.append("taskId", taskId.toString());
    
    files.forEach(file => {
      formData.append("files", file);
    });
    
    try {
      const res = await fetch("http://localhost:8081/sftp/upload-multiple", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: formData,
      });
      
      if (res.ok) {
        const result = await res.text();
        console.log("Files uploaded successfully:", result);
        // Refresh files for this task
        await fetchTaskFiles(taskId);
        return true;
      } else {
        const errorText = await res.text();
        throw new Error(`Failed to upload files: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Error uploading files:", err);
      throw err;
    }
  };

  // Create new task with optional file upload
  const handleCreateTask = async () => {
    if (!newTask.taskName || !newTask.taskDescription) {
      alert("Please fill all fields to create a task");
      return;
    }

    try {
      // First create the task
      const res = await fetch("http://localhost:8081/task/admin/addTask", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        credentials: "include",
        body: JSON.stringify(newTask),
      });

      const result = await res.text();
      
      if (res.ok && result === "success") {
        // Refresh tasks list to get the new task ID
        const tasksRes = await fetch(`http://localhost:8081/task/admin/getTaskByProjectId/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
          
          // Find the newly created task (assuming it's the last one)
          const newTaskObj = tasksData[tasksData.length - 1];
          
          // Upload files if any were selected
          if (selectedFiles.length > 0) {
            try {
              await uploadFiles(newTaskObj.taskId, selectedFiles);
              alert("Task created successfully with files uploaded");
            } catch (uploadError) {
              alert("Task created successfully but file upload failed: " + uploadError.message);
            }
          } else {
            alert("Task created successfully");
          }
        }
        
        // Reset form
        setNewTask({ taskName: "", taskDescription: "", projectId: id });
        setSelectedFiles([]);
      } else {
        throw new Error(result || "Failed to create task");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating task: " + err.message);
    }
  };

  // Fetch files for a specific task - USING CORRECT ENDPOINT
  const fetchTaskFiles = async (taskId) => {
    try {
      // Using the correct endpoint /getAttachedFiles with query parameter
      const res = await fetch(`http://localhost:8081/sftp/getAttachedFiles?taskId=${taskId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
      
      if (res.ok) {
        const files = await res.json();
        setTaskFiles(prev => ({ ...prev, [taskId]: files }));
        console.log(`Found ${files.length} files for task ${taskId}`);
      } else {
        console.log("No files found for this task or error fetching files");
        setTaskFiles(prev => ({ ...prev, [taskId]: [] }));
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setTaskFiles(prev => ({ ...prev, [taskId]: [] }));
    }
  };

  // Handle task click - show modal and fetch files
  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
    await fetchTaskFiles(task.taskId);
  };

  const handleAssignUserToTask = async () => {
    if (!taskAssignment.userId) {
      alert("Please select a user");
      return;
    }
    
    try {
      const assignmentData = {
        taskId: selectedTask.taskId,
        userId: parseInt(taskAssignment.userId)
      };

      const assignproject ={
        projectId : id,
        userId: parseInt(taskAssignment.userId)
      }

      const email ={
        toId : taskAssignment.userId,
        subject : "task assigned",
        body : `you are assigned to a new task id : ${assignmentData.taskId} in project-id : ${assignproject.projectId}`,
      }

      const res = await fetch(`http://localhost:8081/task_User/admin/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(assignmentData),
      });
      
      if (!res.ok) throw new Error("Failed to assign user to task");
      else{
        const addproject = fetch(`http://localhost:8081/project_user/admin/add`,{
          method:"Post",
          headers:{"Content-Type": "application/json", Authorization: `Bearer ${token}`},
          credentials:"include",
          body: JSON.stringify(assignproject),
        })
        const sendemail = fetch(`http://localhost:8081/api/email/send`,{
          method:"POST",
          headers:{"Content-Type": "application/json", Authorization: `Bearer ${token}`},
          credentials:"include",
          body:JSON.stringify(email),
        })
      }
      
      alert("User assigned to task successfully");
      setTaskAssignment({ userId: "" });
      setShowTaskModal(false);
      
      // Refresh users list
      const usersRes = await fetch(`http://localhost:8081/project_user/admin/UserDetail/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning user to task: " + err.message);
    }
  };

  const deleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch("http://localhost:8081/task_User/admin/deleteByTask", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ taskId: selectedTask.taskId }),
      });

      const res2 = await fetch(`http://localhost:8081/task/admin/deleteTask/${selectedTask.taskId}`,{
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      alert("Task deleted successfully");
      setShowTaskModal(false);
      
      // Refresh tasks list
      const tasksRes = await fetch(`http://localhost:8081/task/admin/getTaskByProjectId/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting task: " + err.message);
    }
  };

  const downloadFile = (remoteFileName) => {
  const token = localStorage.getItem("token");
  const url = `http://localhost:8081/sftp/download?remoteFileName=${encodeURIComponent(remoteFileName)}`;

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



  if (!project) return <div className="loading">Loading...</div>;

  return (
    <>
      <Headder />
      <div className="project-detail-page">
        <div className="project-header">
          <h1>Project Details</h1>
          <button className="back-button" onClick={() => navigate("/AdminPage")}>
            Back to Dashboard
          </button>
        </div>

        <div className="project-cards-container">
          {/* Left Column - Project Details and Users */}
          <div className="left-column">
            {/* Project Details Card */}
            <div className="project-detail-card">
              <h2>Project Information</h2>
              <div className="project-id">ID: {project.project_id}</div>

              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Title:</label>
                    <input 
                      type="text" 
                      name="project_name" 
                      value={editProject.project_name} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea 
                      name="project_description" 
                      value={editProject.project_description} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="button-group">
                    <button className="save-btn" onClick={handleSave}>Save</button>
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="project-info">
                  <p className="project-title">{project.project_name}</p>
                  <p className="project-description">{project.project_description}</p>
                  <div className="button-group">
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                    <button className="delete-btn" onClick={RemoveProject}>Delete Project</button>
                  </div>
                </div>
              )}
            </div>

            {/* Users Card */}
            <div className="users-card">
              <h2>Team Members ({users.length})</h2>
              <div className="scrollable-list">
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <div key={user.id || index} className="user-item">
                      <div className="user-info">
                        <div className="user-name">{user.id}.    {user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No users assigned to this project</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="right-column">
            <div className="tasks-card">
              <h2>Project Tasks ({tasks.length})</h2>
              <div className="scrollable-list">
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <div 
                      key={task.task_id || index} 
                      className="task-item clickable"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="task-name">{task.taskName}</div>
                      <div className="task-description">{task.taskDescription}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No tasks found for this project</p>
                )}
              </div>
            </div>

            {/* Create New Task Card */}
            <div className="create-task-card">
              <h2>Create New Task</h2>
              <div className="form-group">
                <input
                  type="text"
                  name="taskName"
                  placeholder="Task Name"
                  value={newTask.taskName}
                  onChange={handleNewTaskChange}
                />
              </div>
              <div className="form-group">
                <textarea
                  name="taskDescription"
                  placeholder="Task Description"
                  value={newTask.taskDescription}
                  onChange={handleNewTaskChange}
                />
              </div>
              <div className="form-group">
                <input 
                  type="file" 
                  name="files" 
                  multiple 
                  onChange={handleFileChange}
                />
              </div>
              <button className="create-btn" onClick={handleCreateTask}>Create Task</button>
            </div>
          </div>
        </div>

        {/* Task Detail Modal */}
        {showTaskModal && selectedTask && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Task Details</h2>
                <button className="close-btn" onClick={() => setShowTaskModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="task-detail">
                  <h3>{selectedTask.taskName}</h3>
                  <p><strong>Description:</strong> {selectedTask.taskDescription}</p>
                  <p><strong>Task ID:</strong> {selectedTask.taskId}</p>
                  
                  {/* Display attached files */}
                  {taskFiles[selectedTask.taskId] && taskFiles[selectedTask.taskId].length > 0 ? (
                    <div className="task-files">
                      <h4>Attached Files:</h4>
                      <ul>
                        {taskFiles[selectedTask.taskId].map(file => (
                          <li key={file.id} className="file-item">
                            <span className="file-name">{file.fileName}</span>
                            <button 
                              className="download-btn"
                              onClick={() => downloadFile(file.fileName)}
                            >
                              Download
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="no-files">No files attached to this task</p>
                  )}
                </div>
                
                <div className="assign-user-section">
                  <h3>Assign User to this Task</h3>
                  <select
                    value={taskAssignment.userId}
                    onChange={(e) => setTaskAssignment({ userId: e.target.value })} 
                  >
                    <option value="">Select User</option>
                    {allUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button className="assign-btn" onClick={handleAssignUserToTask}> 
                    Assign User
                  </button>
                </div>
                <div className="delete-task-section">
                  <button onClick={deleteTask}>Delete Task</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProjectDetailPage;