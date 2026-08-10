import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get("/movies");

        console.log(response.data);

        setMovies(response.data.movies || []);
      } catch (error) {
        console.log(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={() => navigate("/upload")}
        style={{
          display: "block",
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Create New Movie
      </button>

      <h2>My Movies</h2>

      {movies.length === 0 ? (
        <p>No movies created yet</p>
      ) : (
        movies.map((movie) => (
          <div key={movie._id}>
            <h3>{movie.title}</h3>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;
