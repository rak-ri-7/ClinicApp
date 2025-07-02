import React, { useEffect, useState } from "react";
import api from "../api";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api
      .get("/api/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
