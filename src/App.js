import React, { useState } from "react";
import Axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Function to get user
  const getuser = async () => {
    try {
      const response = await Axios.get(
        "http://localhost:7000/api/v1/users/verify",
        { withCredentials: true }
      );
      const data = response;
      console.log("User:", response);
      setUser(data.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Function to login user
  const loginUser = async () => {
    try {
      const response = await Axios.post(
        "http://localhost:7000/api/v1/users/login",
        { username, password },
      );
      console.log("Login Response:", response);
      setUser(response.data.data.user);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={getuser}>Get User</button>
      <button onClick={loginUser}>Login User</button>
      <h1 style={{ color: "white" }}>{user?.username}</h1>
      <h1 style={{ color: "white" }}>{user?.email}</h1>
      <h1 style={{ color: "white" }}>{user?.profilePicture}</h1>
      <h1 style={{ color: "white" }}>{user?.role}</h1>
      <h1 style={{ color: "white" }}>{user?.createdAt}</h1>
      <h1 style={{ color: "white" }}>{user?.updatedAt}</h1>
      <h1 style={{ color: "white" }}>{user?.__v}</h1>
      <h1 style={{ color: "white" }}>{user?.id}</h1>
      <h1 style={{ color: "white" }}>{user?.password}</h1>
      <h1 style={{ color: "white" }}>{user?.passwordChangedAt}</h1>
      <h1 style={{ color: "white" }}>{user?.passwordResetToken}</h1>
      <h1 style={{ color: "white" }}>{user?.passwordResetExpires}</h1>
      <img height={600} width={600} src={user?.profilePicture} alt="avatar" />
    </div>
  );
}

export default App;
