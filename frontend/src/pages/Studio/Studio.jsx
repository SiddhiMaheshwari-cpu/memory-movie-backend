import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  analyzeMovie,
  generateScreenplay,
  generateScenePlan,
  renderMovie,
} from "../../api/ai.api";

function Studio() {
  const navigate = useNavigate();

  const movieId = localStorage.getItem("movieId");

  const [loading, setLoading] = useState("");

  const handleAnalyze = async () => {
    try {
      setLoading("analyze");

      const res = await analyzeMovie(movieId);

      console.log("Analysis:", res.data);

      alert("✅ Memories analyzed successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("❌ Analysis Failed");
    } finally {
      setLoading("");
    }
  };

  const handleScreenplay = async () => {
    try {
      setLoading("screenplay");

      const res = await generateScreenplay(movieId);

      console.log("Screenplay:", res.data);

      alert("✅ Screenplay Generated");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("❌ Screenplay Failed");
    } finally {
      setLoading("");
    }
  };

  const handleScenePlan = async () => {
    try {
      setLoading("scene");

      const res = await generateScenePlan(movieId);

      console.log("Scene Plan:", res.data);

      alert("✅ Scene Plan Generated");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("❌ Scene Plan Failed");
    } finally {
      setLoading("");
    }
  };
  const handleRender = async () => {
    try {
      if (!movieId) {
        alert("❌ Movie ID not found");
        return;
      }

      setLoading("render");

      console.log("🎬 Starting movie render...");
      console.log("Movie ID:", movieId);

      const res = await renderMovie(movieId);

      console.log("✅ Render Response:", res.data);

      // Backend currently returns videoUrl
      const videoUrl =
        res.data?.videoUrl ||
        res.data?.data?.videoUrl ||
        res.data?.movieUrl ||
        res.data?.data?.movieUrl;

      if (!videoUrl) {
        console.error("❌ Video URL missing:", res.data);
        throw new Error("Video URL not received from server");
      }

      // Save the generated video URL for Preview page
      localStorage.setItem("movieUrl", videoUrl);

      console.log("🎥 Video URL saved:", videoUrl);

      alert("🎬 Movie Rendered Successfully");

      navigate("/preview");
    } catch (error) {
      console.error(
        "❌ Rendering Error:",
        error.response?.data || error.message,
      );

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "❌ Rendering Failed",
      );
    } finally {
      setLoading("");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>🎬 AI Studio</h1>

      <br />

      <button
      style={{
        display: "block",
        backgroundColor: "green",
        color: "white",
        padding: "12px 30px",
        marginTop: "20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    }}
      
      onClick={handleAnalyze}>
        {loading === "analyze" ? "Analyzing..." : "Analyze Memories"}
      </button>

      <br />
      <br />

      <button
        style={{
          display: "block",
          backgroundColor: "blue",
          color: "white",
          padding: "12px 30px",
          marginTop: "20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onClick={handleScreenplay}
      >
        {loading === "screenplay" ? "Generating..." : "Generate Screenplay"}
      </button>

      <br />
      <br />

      <button
      style={{
        display: "block",
        backgroundColor: "green",
        color: "white",
        padding: "12px 30px",
        marginTop: "20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    }}
      
      onClick={handleScenePlan}>
        {loading === "scene" ? "Generating..." : "Generate Scene Plan"}
      </button>

      <br />
      <br />

      <button
      style={{
        display: "block",
        backgroundColor: "green",
        color: "white",
        padding: "12px 30px",
        marginTop: "20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    }}
       onClick={handleRender}>
        {loading === "render" ? "Rendering..." : "Render Movie"}
      </button>
    </div>
  );
}

export default Studio;
