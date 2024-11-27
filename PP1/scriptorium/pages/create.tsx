import { useState } from "react";
import { useRouter } from "next/router";

const CreatePost = () => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleCreatePost = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and description cannot be empty!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      // Redirect to posts page or show success message
      alert("Post created successfully!");
      router.push("/"); // Adjust the redirection as needed
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Create New Blog Post</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="title" style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "20px",
          }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="description"
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter post description"
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "20px",
          }}
        />
      </div>
      <button
        onClick={handleCreatePost}
        style={{
          padding: "10px 15px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Post"}
      </button>
    </div>
  );
};

export default CreatePost;
