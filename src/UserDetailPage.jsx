import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headder from "./Headder";

function UserDetailPage() {
  const { id } = useParams(); // get id from URL
  const [user, setUser] = useState(null);

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
      } catch (err) {
        console.error(err);
        alert("Error fetching user details");
      }
    };
    fetchUser();
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Headder />
      <div className="user-detail-page">
        <h2>User Details - ID: {user.id}</h2>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>
      </div>
    </>
  );
}

export default UserDetailPage;
