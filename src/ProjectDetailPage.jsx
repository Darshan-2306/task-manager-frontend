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
  const [isEditing, setIsEditing] = useState(false);
  const [editProject, setEditProject] = useState({});
  const [assignment, setAssignment] = useState({ taskId: "", userId: "" });


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
        console.error(err);
        alert("Error fetching project details");
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

    fetchProject();
    fetchTasks();
    fetchUsers();
  }, [id, token]);

  // Edit project input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProject({ ...editProject, [name]: value });
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
    } catch (err) {
      console.error(err);
      alert("Error updating project: " + err.message);
    }
  };

  // Delete project
  const RemoveProject = async () => {
    try {
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
  };

const handleAssignTask = async () => {
    const { projectId } = useParams();
  try {
    if (!assignment.taskId || !assignment.userId) {
      alert("Please enter both Task ID and User ID");
      return;
    }
    const taskAssignment = {
      taskId: parseInt(assignment.taskId),
      userId: parseInt(assignment.userId)
    };

    const projectAssignment ={
        taskId: parseInt(assignment.taskId),
        nubprojectId : parseInt(projectId)
    };



    const resTask = await fetch(`http://localhost:8081/task_User/admin/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify(taskAssignment),

    });
    if (!resTask.ok) throw new Error("Failed to assign task");
    const dataTask = await resTask.json();

    // const resProj = await fetch(`http://localhost:8081/project_user/admin/add`,{
    //     method :"Post",
    //     headers:{"Content-Type": "application/json", Authorization: `Bearer ${token}`},
    //     credentials: "include",
    //     body: JSON.stringify(projectAssignment)
    // });
    // resProj;
  }
  
  catch (err) {
    console.error(err);
    alert("Error assigning task/project: " + err.message);
  }
};


  if (!project) return <p>Loading...</p>;

  return (
       <>
      <Headder />
      <div className="project-detail-page">
        <div className="project-cards-container">
          {/* Project Details Card */}
          <div className="Projectdetail-card">
            <h2>Project Details - ID: {project.project_id}</h2>

            {isEditing ? (
              <>
                <div>
                  <label>Title:</label>
                  <input type="text" name="project_name" value={editProject.project_name} onChange={handleInputChange} />
                </div>
                <div>
                  <label>Description:</label>
                  <textarea name="project_description" value={editProject.project_description} onChange={handleInputChange} />
                </div>
                <div className="button-group">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p><b>Title:</b> {project.project_name}</p>
                <p><b>Description:</b> {project.project_description}</p>
                <div className="button-group">
                  <button onClick={() => setIsEditing(true)}>Edit</button>
                  <button onClick={RemoveProject}>Delete Project</button>
                </div>
              </>
            )}

            <hr />
            <h3>Tasks in this Project</h3>
            {tasks.length > 0 ? (
              <ul>
                {tasks.map((task, index) => (
                  <li key={task.task_id || index}><b>{task.taskName}</b></li>
                ))}
              </ul>
            ) : <p>No tasks found for this project.</p>}

            <hr />
            <h3>Users working in this Project</h3>
            {users.length > 0 ? (
              <ul>
                {users.map((user, index) => (
                  <li key={user.id || index}>{user.name} ({user.email})</li>
                ))}
              </ul>
            ) : <p>No users assigned to this project.</p>}
          </div>

          {/* Assign Task Card */}
          <div className="project_assign">
            <h2>Assign Task to User</h2>
            <input
              type="text"
              placeholder="Task ID"
              className="big-input"
              value={assignment.taskId}
              onChange={(e) => setAssignment({ ...assignment, taskId: e.target.value })}
            />
            <input
              type="text"
              placeholder="User ID"
              className="big-input"
              value={assignment.userId}
              onChange={(e) => setAssignment({ ...assignment, userId: e.target.value })}
            />
            <button className="btn big-btn" onClick={handleAssignTask}>Assign Task</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectDetailPage;
