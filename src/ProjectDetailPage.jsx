import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headder from "./Headder";

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8081/project/admin/getProjectById/${id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Project not found");

        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching project details");
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <p>Loading...</p>;

  return (
    <>
      <Headder />
      <div className="project-detail-page">
        <h2>Project Details - ID: {project.project_id}</h2>
        <p><b>Title:</b> {project.project_name}</p>
        <p><b>Description:</b> {project.project_description}</p>
      </div>
    </>
  );
}

export default ProjectDetailPage;
