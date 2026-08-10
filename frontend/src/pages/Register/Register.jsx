import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../api/auth.api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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
      const response = await registerUser(formData);

      console.log(response.data);

      navigate("/login");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
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
            padding: "15px 30px",
            marginTop: "20px",
            border: "2px solid black",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
