import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(formData);

      console.log("✅ Backend Response:", response.data);

      login(
        response.data.user,
        response.data.accessToken
      );

      console.log(
        "✅ Token after login:",
        localStorage.getItem("token")
      );

      console.log(
        "✅ User after login:",
        localStorage.getItem("user")
      );

      navigate("/dashboard");

    } catch (error) {
      console.log(
        "❌ Login Error:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          style={{
            display: "block",
            backgroundColor: "red",
            color: "white",
            padding: "12px 30px",
            marginTop: "20px",
            border: "2px solid black",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;