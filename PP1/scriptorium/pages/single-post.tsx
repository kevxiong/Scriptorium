//used gpt
import { useRouter } from "next/router";
import { useEffect, useState, FC } from "react";

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
};

interface Post {
  id: string;
  title: string;
  description: string;
  user: { email: string };
  comments: { id: string; content: string }[];
  tags: { id: string; name: string }[];
  templates: { id: string; title: string }[];
  rating: { upvote: boolean; downvote: boolean }[];
}

const Search: FC = () => {
  const router = useRouter();
  const { postid } = router.query;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState<string>("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query: string = postid?.toString() || "";
        const response = await fetch(`/api/posts/browse?postid=${query}`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err) {
        if (err instanceof Error){
            setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    if (postid) {
      fetchPosts();
    }
  }, [postid]);

  const upvote = async (postId: string) => {
    const response = await fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, upvote: true, downvote: false }),
    });

    if (response.status === 401) {
      alert("Login required");
      return;
    }
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit upvote');
    }
  
    return response.json();
  };

  const downvote = async (postId: string) => {
    const response = await fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, upvote: false, downvote: true }),
    });

    if (response.status === 401) {
      alert("Login required");
      return;
    }
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit downvote');
    }
  
    return response.json();
  };

  interface Comment {
    id: string;
    content: string;
    parentId?: number | null; // Parent ID can be null for top-level comments
  }

  const renderComments = (comments: Comment[], postId: string, parentId: number | null = null, depth: number = 0) => {
    return comments
      .filter((comment) => comment.parentId === parentId)
      .map((comment) => (
        <div key={comment.id} style={{ marginLeft: `${depth * 20}px`, marginTop: "10px" }}>
          <p style={styles.meta}>
            {comment.content || "No content"}
          </p>
  
          <div style={{ marginTop: "5px" }}>
            <button
              style={{
                padding: "5px 10px",
                background: "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
              onClick={() => { 
                router.push(`/reply?postid=${postId}&parentid=${comment.id}`);
              }}
            >
              Reply
            </button>
            <button
              style={{
                padding: "5px 10px",
                background: "#FF0000",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => { router.push(`/report?parentid=${comment.id}`); }}
            >
              Report
            </button>
          </div>
  
          {renderComments(comments, postId, Number(comment.id), depth + 1)}
        </div>
      ));
  };
  
  
  const handlepostcomment = async (postId: string) => {
    const response = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: newCommentContent}),
      });
  };

  const handlepostreport = async (postId: string) => {
    router.push(`/report?postid=${postId}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Single Post</h1>
      <div style={styles.grid}>
        {posts.map((post) => {
          const upvotes: number = post.rating.filter((r) => r.upvote).length;
          const downvotes: number = post.rating.filter((r) => r.downvote).length;
          const netRating: number = upvotes - downvotes;

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
                        <div style={{ padding: "10px" }}>
                        {renderComments(post.comments, post.id)}
                        </div>
                    ) : (
                        <p style={styles.meta}>No comments available</p>
                    )}
                </div>
                <div style={{ marginTop: "10px" }}>
                    <textarea
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        placeholder="Write your comment..."
                        style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        marginBottom: "10px",
                        }}
                    ></textarea>
                    <button
                        onClick={() => handlepostcomment(post.id)}
                        style={{
                        padding: "8px 12px",
                        background: "green",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        }}
                    >
                        Submit
                    </button>
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
                    {template.title} (ID: {template.id}){" "}
                    <button
                        onClick={() => router.push(`/single-template?templateid=${template.id}`)}
                        style={{
                        background: "transparent",
                        border: "none",
                        color: "#007BFF",
                        textDecoration: "underline",
                        cursor: "pointer",
                        }}
                    >
                        View Template
                    </button>
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
                <button
                    onClick={() => handlepostreport(post.id)}
                    style={{
                      padding: "8px 12px",
                      background: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Report Post
                  </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Search;