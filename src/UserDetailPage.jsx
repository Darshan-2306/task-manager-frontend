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
        console.error(err);
        alert("Error fetching user details");
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
  } catch (err) {
    console.error(err);
    alert("Error updating user");
  }
};

 // remove user
  const RemoveUser = async() =>{
    try{
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

    }

    catch(err){
        alert(err);
    }  };

  if (!user) return <p>Loading...</p>;

  return (
     <>
      <Headder />
      <div className="user-detail-page">
        {/* User Details Card (full width) */}
        <center>
        <div className="user-details-card">
          <h2>User Details - ID: {user.id}</h2>

          {isEditing ? (
            <>
              <p>
                <b>Name:</b>{" "}
                <input
                  type="text"
                  name="name"
                  value={editUser.name}
                  onChange={handleChange}
                />
              </p>
              <p>
                <b>Email:</b>{" "}
                <input
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleChange}
                />
              </p>
              <p>
                <b>Role:</b>{" "}
                <input
                  type="text"
                  name="role"
                  value={editUser.role}
                  onChange={handleChange}
                />
              </p>
              <div className="button-group">
                <button className="save-btn" onClick={handleSave}>Save</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Role:</b> {user.role}</p>
         
              <div className="button-group">
                
                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                <button className="remove-btn" onClick={RemoveUser}>Remove User</button>
               
              </div>
           
            </>
          )}
        </div>
        </center>

        {/* Projects and Tasks side by side */}
        <div className="data-cards-container">
          {/* Projects Card */}
          <div className="data-card">
            <h2>Projects Assigned</h2>
            <div className=".list-container">
            {projects.length > 0 ? (
              <ul>
                {projects.map((p, index) => (
                  <li key={p.id || index}>{p.project_name}</li>
                ))}
              </ul>
            ) : (
              <p>No projects assigned</p>
            )}
          </div>
          </div>

          {/* Tasks Card */}
          <div className="data-card">
            <h2>Tasks Assigned</h2>
            {tasks.length > 0 ? (
              <ul>
                {tasks.map((t, index) => (
                  <li key={t.id || index}>{t.taskName}</li>
                ))}
              </ul>
            ) : (
              <p>No tasks assigned</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDetailPage;
