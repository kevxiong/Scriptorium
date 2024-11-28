// posts.tsx

import { useState, useEffect, FC, FormEvent } from "react";
import { useRouter } from "next/router";

const styles: { [key: string]: React.CSSProperties } = {
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

interface Post {
  id: string;
  title: string;
  description: string;
  user?: { email: string };
  comments: { id: string; content: string }[];
  tags: { id: string; name: string }[];
  templates: { id: string; title: string }[];
  rating: { upvote: boolean; downvote: boolean }[];
}

const Posts: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [template, setTemplate] = useState<string>("");
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleEmailSubmit = () => {
    // Basic input validation
    if (email.trim() === "") {
      alert("Please enter an email address.");
      return;
    }

    // Navigate to the profile page with the entered email as userid
    router.push(`/profile?userid=${encodeURIComponent(email)}`);
  };

  const upvote = async (postId: string): Promise<any> => {
    const response = await fetch("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, upvote: true, downvote: false }),
    });

    if (response.status === 401) {
      alert("Login required");
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit upvote");
    }

    return response.json();
  };

  const downvote = async (postId: string): Promise<any> => {
    const response = await fetch("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, upvote: false, downvote: true }),
    });

    if (response.status === 401) {
      alert("Login required");
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit downvote");
    }

    return response.json();
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const query: { [key: string]: string } = {};
    if (title.trim()) query.title = title.trim();
    if (tag.trim()) query.tagId = tag.trim();
    if (content.trim()) query.content = content.trim();
    if (template.trim()) query.templateid = template.trim();

    if (Object.keys(query).length === 0) {
      alert("Please fill at least one search field.");
      return;
    }

    const queryString = Object.entries(query)
      .map(
        ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    router.push(`/search?${queryString}`);
  };

  const handleViewPost = (postId: string): void => {
    router.push(`/single-post?postid=${postId}`);
  };

  const handlesortbyrating = (): void => {
    router.push(`/popular`);
  };

  const handletemplates = (): void => {
    router.push(`/template`);
  };

  const handlecreate = (): void => {
    router.push(`/create`);
  };

  const handlemyposts = (): void => {
    router.push(`/myposts`);
  };

  const handleCodeExecution = (): void => {
    router.push(`/code-execution`);
  };

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error)
    return (
      <p style={{ textAlign: "center", color: "red" }}>{error}</p>
    );

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>All Posts</h1>

      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        <label
          htmlFor="searchTitle"
          style={{ fontSize: "1rem", marginRight: "10px" }}
        >
          Title:
        </label>
        <input
          id="searchTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Search by title"
          style={styles.searchinput}
        />
        <button type="submit" style={styles.searchbutton}>
          Search
        </button>
      </form>
      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        <label
          htmlFor="searchTag"
          style={{ fontSize: "1rem", marginRight: "10px" }}
        >
          Tag:
        </label>
        <input
          id="searchTag"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Search by title"
          style={styles.searchinput}
        />
        <button type="submit" style={styles.searchbutton}>
          Search
        </button>
      </form>
      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        <label
          htmlFor="searchTemplate"
          style={{ fontSize: "1rem", marginRight: "10px" }}
        >
          Template:
        </label>
        <input
          id="searchTemplate"
          type="text"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Search by title"
          style={styles.searchinput}
        />
        <button type="submit" style={styles.searchbutton}>
          Search
        </button>
      </form>
      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        <label
          htmlFor="searchContent"
          style={{ fontSize: "1rem", marginRight: "10px" }}
        >
          Content:
        </label>
        <input
          id="searchContent"
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Search by title"
          style={styles.searchinput}
        />
        <button type="submit" style={styles.searchbutton}>
          Search
        </button>
      </form>

      {/* Other search forms (Tags, Content, Template) can be added here similarly */}

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={handlesortbyrating}
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
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={handletemplates}
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
          View available templates
        </button>
      </div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={handlecreate}
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
          Create Post
        </button>
      </div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={handlemyposts}
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
          View My Posts
        </button>
      </div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={handleCodeExecution}
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
          Execute Code
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to view profile"
          style={styles.searchinput}
        />
        <button onClick={handleEmailSubmit} style={styles.searchbutton}>
          View Profile
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
                    Upvote ({upvotes})
                  </button>
                  <button
                    onClick={() => downvote(post.id)}
                    style={styles.votebutton}
                  >
                    Downvote ({downvotes})
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
                    onClick={() => handleViewPost(post.id)}
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
};

export default Posts;
