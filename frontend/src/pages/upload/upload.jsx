import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
function Upload() {
  const navigate = useNavigate();
  const movieId = localStorage.getItem("movieId");

  const [file, setFile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState([]);
  const [chat, setChat] = useState([]);
  const goToStudio = () => {
    navigate("/studio");
  };
  const handleUpload = async () => {
    if (!file||file.length === 0) {
      alert("Please select a photo");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      for (const selectedFile of file) {
        formData.append("file", selectedFile);
      }
      formData.append("description", "Memory Photo");
      formData.append("emotion", "Happy");

      const response = await api.post(`/movies/${movieId}/photos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      alert("Photos Uploaded Successfully ✅");
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!video||video.length === 0) {
      alert("Select  videos first");
      return;
    }

    try {
      const formData = new FormData();
      for (const selectedVideo of video) {
        formData.append("file", selectedVideo);
      }
      formData.append("description", "Memory Video");
      formData.append("emotion", "Happy");

      const response = await api.post(`/movies/${movieId}/videos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      alert("Videos Uploaded Successfully ✅");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const uploadAudio = async () => {
    if (!audio || audio.length === 0) {
      alert("Select  audio file");
      return;
    }

    const data = new FormData();
    for (const selectedAudio of audio) {
      data.append("file", selectedAudio);
    }
    data.append("transcript", "Voice Memory");

    try {
      const response = await api.post(`/movies/${movieId}/audio`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      alert("Audios Uploaded Successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };
  const uploadChat = async () => {
    if (!chat || chat.length === 0) {
      alert("Select  chat screenshots");
      return;
    }

    const movieId = localStorage.getItem("movieId");

    const data = new FormData();

    for (const selectedChat of chat) {
      data.append("file", selectedChat);
    }
    data.append("description", "WhatsApp Chat");

    try {
      const response = await api.post(
        `/movies/${movieId}/chat-screenshots`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log(response.data);

      alert("Chat Screenshots Uploaded");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h1>Upload Photos</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFile(Array.from(e.target.files))}
      />
      <br />

      <h2>Upload Video</h2>

      <input
        type="file"
        accept="video/*"
        multiple
        onChange={(e) => setVideo(Array.from(e.target.files))}
      />
      <br />

      <h2>Upload Audio</h2>

      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={(e) => setAudio(Array.from(e.target.files))}
      />
      <br />
      <h2>Upload Chat Screenshot</h2>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setChat(Array.from(e.target.files))}
      />
      <br />

      <button
        type="button"
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
        onClick={handleUpload}
      >
        {loading ? "Uploading..." : "Upload Photo"}
      </button>
      <button
        type="button"
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
        onClick={handleVideoUpload}
      >
        Upload Video
      </button>
      <button
        type="button"
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
        onClick={uploadAudio}
      >
        Upload Audio
      </button>
      <button
        type="button"
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
        onClick={uploadChat}
      >
        Upload Chat Screenshot
      </button>
      <button
        type="button"
        onClick={goToStudio}
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
      >
        Continue to AI Studio →
      </button>
    </div>
  );
}

export default Upload;
