// /pages/posts.js
import jwt from 'jsonwebtoken';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.3s",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  description: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "12px",
  },
  meta: {
    fontSize: "0.875rem",
    color: "#666",
    marginTop: "8px",
  },
  tag: {
    display: "inline-block",
    background: "#f0f4f8",
    color: "#007BFF",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    marginRight: "8px",
  },
  votebutton: {
    marginRight: "10px",
    padding: "8px 12px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  searchbutton: {
    padding: "8px 12px",
    fontSize: "1rem",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  searchinput: {
    padding: "8px",
      fontSize: "1rem",
      border: "1px solid #ddd",
      borderRadius: "4px",
      marginRight: "10px",
  },
};

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tag, setTag] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [template, setTemplate] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const upvote = async (postId) => {
    const response = await fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, upvote: true }),
    });

    if (response.status === 401) {
      alert("Login required"); // Popup alert for unauthorized response
      return;
    }
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit upvote');
    }
  
    return response.json();
  };

  const downvote = async (postId) => {
    const response = await fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, upvote: false }),
    });

    if (response.status === 401) {
      alert("Login required"); // Popup alert for unauthorized response
      return;
    }
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit upvote');
    }
  
    return response.json();
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Construct query parameters dynamically based on inputs
    const query = {};
    if (title.trim()) query.title = title.trim();
    if (tag.trim()) query.tagId = tag.trim();
    if (content.trim()) query.content = content.trim();
    if (template.trim()) query.templateid = template.trim();
  
    // If no fields are filled, return early
    if (Object.keys(query).length === 0) {
      alert("Please fill at least one search field.");
      return;
    }
  
    // Build the query string for the URL
    const queryString = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  
    // Redirect to the browse page with query parameters
    router.push(`/search?${queryString}`);
  };
  
  const handleViewPost = (postId) => {
    router.push(`/single-post?postid=${postId}`);
  };

  const handlesortbyrating = (e) => {
    router.push(`/popular`);
  };


  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>All Posts</h1>

{/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", textAlign: "center" }}>
        <label htmlFor="searchTags" style={{ fontSize: "1rem", marginRight: "10px" }}>
          Title:
        </label>
        <input
          id="searchTags"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Search by title"
          style={styles.searchinput}
        />
        <button type="submit"> Search </button>
      </form>
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", textAlign: "center" }}>
        <label htmlFor="searchTags" style={{ fontSize: "1rem", marginRight: "10px" }}>
          Tags:
        </label>
        <input
          id="searchTags"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Search by tags"
          style={styles.searchinput}
        />
        <button type="submit"> Search </button>
      </form>
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", textAlign: "center" }}>
        <label htmlFor="searchTags" style={{ fontSize: "1rem", marginRight: "10px" }}>
          Content:
        </label>
        <input
          id="searchTags"
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Search by content"
          style={styles.searchinput}
        />
        <button type="submit"> Search </button>
      </form>
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", textAlign: "center" }}>
        <label htmlFor="searchTags" style={{ fontSize: "1rem", marginRight: "10px" }}>
          Template:
        </label>
        <input
          id="searchTags"
          type="text"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Search by template"
          style={styles.searchinput}
        />
        <button type="submit"> Search </button>
      </form>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <button
        onClick={handlesortbyrating} // Attach the function
        style={{
          padding: "10px 15px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Sort by Rating
      </button>
    </div>

      <div style={styles.grid}>
        {posts.map((post) => {
          const upvotes = post.rating.filter((r) => r.upvote).length;
          const downvotes = post.rating.filter((r) => r.downvote).length;
          const netRating = upvotes - downvotes;

          return (
            <div key={post.id} style={styles.card}>
              <h2 style={styles.title}>{post.title}</h2>
              <p style={styles.description}>{post.description}</p>
              <div>
                <p style={styles.meta}>
                  <strong>Author:</strong> {post.user?.email || "Anonymous"}
                </p>
                <div style={{ marginTop: "10px" }}>
                  <strong>Comments:</strong>
                  {post.comments.length > 0 ? (
                    <ul style={{ padding: "10px", listStyle: "disc" }}>
                      {post.comments.map((comment) => (
                        <li key={comment.id} style={styles.meta}>
                          {comment.content || "No content"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={styles.meta}>No comments available</p>
                  )}
                </div>
                <div>
                  <strong>Tags:</strong>{" "}
                  {post.tags.map((tag) => (
                    <span key={tag.id} style={styles.tag}>
                      {tag.name} (ID: {tag.id})
                    </span>
                  ))}
                </div>
                <div>
                  <strong>Templates:</strong>{" "}
                  {post.templates.map((template) => (
                    <span key={template.id} style={styles.tag}>
                      {template.title} (ID: {template.id})
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => upvote(post.id)}
                    style={styles.votebutton}
                  >
                    Upvote ({upvotes}) {/* Display upvotes */}
                  </button>
                  <button
                    onClick={() => downvote(post.id)}
                    style={styles.votebutton}
                  >
                    Downvote ({downvotes}) {/* Display downvotes */}
                  </button>
                  <span
                    style={{
                      marginLeft: "10px",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      color: netRating >= 0 ? "green" : "red",
                    }}
                  >
                    Net Votes: {netRating}
                  </span>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleViewPost(post.id)} // Redirect to the single-post page
                    style={{
                      padding: "8px 12px",
                      background: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    View Post
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}