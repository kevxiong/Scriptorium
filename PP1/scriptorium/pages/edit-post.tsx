import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const EditPost = () => {
  const router = useRouter();
  const { postid } = router.query; // Extract post ID from the query
  const [title, setTitle] = useState<string>(""); // Default to empty string
  const [description, setDescription] = useState<string>(""); // Default to empty string
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch the post details when the page loads
  useEffect(() => {
    if (!postid) return; // Wait for postid to be available in the query

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/browse?postid=${postid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setTitle(data.title); // Set the existing title
        setDescription(data.description); // Set the existing description
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postid]); // Re-run when postid changes

  const update = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and description cannot be empty!");
      return;
    }
    const postId = parseInt(postid as string, 10);

    try {
      const response = await fetch(`/api/posts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({postId: postId , title, description}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post");
      }

      alert("Post updated successfully!");
      router.push(`/myposts`); // Redirect to the post details page
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error updating post:", err);
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Edit Post</h1>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="title" style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title} // Show existing title in the input
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
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
          value={description} // Show existing description in the textarea
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <button
        onClick={update}
        style={{
          padding: "10px 15px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Update Post
      </button>
    </div>
  );
};

export default EditPost;
