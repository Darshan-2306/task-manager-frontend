import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headder from "./Headder";
import { useNavigate } from "react-router-dom";
import './UserDetailPage.css';

function UserDetailPage() {
  const { id } = useParams(); // user id from URL
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  // fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8081/user/admin/getUser/${id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("User not found");

        const data = await res.json();
        setUser(data);
        setEditUser(data); // for editing
      } catch (err) {
        navigate("/");
        console.error(err);

      }
    };
    fetchUser();
  }, [id]);

  // fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:8081/project_user/admin/ProjectDetail/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, [id]);

  // fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8081/task_User/admin/TaskDetails/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, [id]);

  // handle input changes in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({
      ...prev,          
      [name]: value,    
      password: null  
    }));
  };

  // save edited user
  const handleSave = async () => {
    try {
      const updatedUser = { ...editUser, password: null };

      const res = await fetch(`http://localhost:8081/user/admin/updateUser/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setUser(updated);
      setIsEditing(false);
      alert("User updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating user");
    }
  };

  // remove user
  const RemoveUser = async() => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        
        const proj = await fetch(`http://localhost:8081/project_user/admin/deleteByUser`,{
          method: "DELETE",
          credentials: "include",
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId: id}),
        })

        const tas = await fetch(`http://localhost:8081/task_User/admin/deleteByUser`,{
          method: "DELETE",
          credentials: "include",
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId: id}),
        })

        const res = await fetch(`http://localhost:8081/user/admin/deleteUser/${id}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (res.ok) {
          const deletedUser = await res.json();
          alert(`User ${deletedUser.name} removed successfully`);
          navigate("/AdminPage");
        } else {
          throw new Error("Unsuccessful delete");
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  // remove task from user - UPDATED FOR CORRECT ENDPOINT
  const removeTask = async (taskId) => {
    if (window.confirm("Are you sure you want to remove this task from the user?")) {
      try {
        const res = await fetch(`http://localhost:8081/task_User/admin/deleteByUserandTask`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userId: parseInt(id), 
            taskId: parseInt(taskId) 
          }),
        });

        const result = await res.text();
        
        if (result === "success") {
          alert("Task removed successfully");
          // Refresh the tasks list
          const tasksRes = await fetch(`http://localhost:8081/task_User/admin/TaskDetails/${id}`, {
            method: "GET",
            credentials: "include",
          });
          
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            setTasks(tasksData);
          }
        } else {
          throw new Error("Failed to remove task");
        }
      } catch (err) {
        console.error(err);
        
        alert("Error removing task");
      }
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <>
      <Headder />
      <div className="user-detail-page">
        <div className="user-header">
          <h1>User Details</h1>
          <button className="back-button" onClick={() => navigate("/AdminPage")}>
            Back to Dashboard
          </button>
        </div>

        <div className="user-content">
          {/* User Details Card */}
          <div className="user-details-card">
            <h2>User Information</h2>
            <div className="user-id">ID: {user.id}</div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={editUser.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={editUser.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <input
                    type="text"
                    name="role"
                    value={editUser.role}
                    onChange={handleChange}
                  />
                </div>
                <div className="button-group">
                  <button className="save-btn" onClick={handleSave}>Save</button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="user-info">
                <p><b>Name:</b> {user.name}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Role:</b> {user.role}</p>
                <div className="button-group">
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="remove-btn" onClick={RemoveUser}>Remove User</button>
                </div>
              </div>
            )}
          </div>

          {/* Projects and Tasks side by side */}
          <div className="data-cards-container">
            {/* Projects Card */}
            <div className="data-card">
              <h2>Projects Assigned ({projects.length})</h2>
              <div className="scrollable-list">
                {projects.length > 0 ? (
                  projects.map((p, index) => (
                    <div key={p.id || index} className="list-item">
                      {p.project_name}
                    </div>
                  ))
                ) : (
                  <p className="no-data">No projects assigned</p>
                )}
              </div>
            </div>

            {/* Tasks Card */}
            <div className="data-card">
              <h2>Tasks Assigned ({tasks.length})</h2>
              <div className="scrollable-list">
                {tasks.length > 0 ? (
                  tasks.map((t, index) => (
                    <div key={t.id || index} className="list-item task-item">
                      <div className="task-info">
                        <div className="task-name">{t.taskName}</div>
                        {t.taskId && (
                          <div className="task-id">ID: {t.taskId}</div>
                        )}
                      </div>
                      <button 
                        className="remove-task-btn"
                        onClick={() => removeTask(t.taskId || t.id)}
                        title="Remove task from user"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No tasks assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDetailPage;