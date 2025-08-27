import React, { useEffect, useState } from "react";
import "./UserPage.css";
import Headder from "./Headder";

function UserPage() {
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [newPassword, setNewPassword] = useState(""); 

  // fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8081/user/my_details", {
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
      }
    };

    fetchUser();
  }, []);

  // fetch projects
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch("http://localhost:8081/project_user/my_projects", {
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
        const res = await fetch("http://localhost:8081/task_User/my_tasks", {
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
      const res = await fetch("http://localhost:8081/user/updateMy_Details", {
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
              <div key={index} className="item-card">
                <p>Title: {task.taskName}</p>
                <p>ID: {task.taskId}</p>
                <p>Project ID: {task.projectId}</p>
                <p>Description: {task.taskDescription}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserPage;
