import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headder from "./Headder";

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProject, setEditProject] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8081/project/admin/getProjectById/${id}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Project not found");

        const data = await res.json();
        setProject(data);
        setEditProject({ project_name: data.project_name, project_description: data.project_description });
      } catch (err) {
        console.error(err);
        alert("Error fetching project details");
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8081/task/admin/getTaskByProjectId/${id}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
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
          headers: { "Authorization": `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Users not found");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProject();
    fetchTasks();
    fetchUsers();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProject({ ...editProject, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/project/admin/updateProject/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editProject)
      });

      if (!res.ok) throw new Error("Failed to update project");

      const updated = await res.json();
      setProject(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error updating project: " + err.message);
    }
  };

  if (!project) return <p>Loading...</p>;

  return (
    <>
      <Headder />
      <div className="item-card">
        <h2>Project Details - ID: {project.project_id}</h2>

        {isEditing ? (
          <>
            <div>
              <label>Title:</label>
              <input
                type="text"
                name="project_name"
                value={editProject.project_name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                name="project_description"
                value={editProject.project_description}
                onChange={handleInputChange}
              />
            </div>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}> Cancel</button>
          </>
        ) : (
          <>
            <p><b>Title:</b> {project.project_name}</p>
            <p><b>Description:</b> {project.project_description}</p>
            <button onClick={() => setIsEditing(true)}> Edit</button>
          </>
        )}

        <hr />

        <h3>Tasks in this Project</h3>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task , index) => (
              <li key={task.task_id || index}>
                <b>{task.taskName}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks found for this project.</p>
        )}

        <hr />

        <h3>Users working in this Project</h3>
        {users.length > 0 ? (
          <ul>
            {users.map((user , index) => (
              <li key={user.id || index}>
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        ) : (
          <p>No users assigned to this project.</p>
        )}
      </div>
    </>
  );
}

export default ProjectDetailPage;
