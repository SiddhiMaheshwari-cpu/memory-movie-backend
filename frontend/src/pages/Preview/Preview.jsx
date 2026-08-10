import { useEffect, useState } from "react";

function Preview() {
  const [movieUrl, setMovieUrl] = useState("");

  useEffect(() => {
    const url = localStorage.getItem("movieUrl");

    if (url) {
      setMovieUrl(url);
    }
  }, []);

  if (!movieUrl) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Movie Preview</h1>
        <p>Movie not available yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Movie Preview</h1>

      <video
        src={movieUrl}
        controls
        style={{
          width: "100%",
          maxWidth: "900px",
          marginTop: "20px",
        }}
      />

      <br />
      <br />

      <a
        href={movieUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Movie
      </a>
    </div>
  );
}

export default Preview;