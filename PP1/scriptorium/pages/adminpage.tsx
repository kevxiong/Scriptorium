import { useState, useEffect } from "react";

interface Post {
  id: number;
  title: string;
  reportCount: number;
  isHidden: boolean
}

interface Comment {
  id: number;
  content: string;
  reportCount: number;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  th: {
    backgroundColor: "#f4f4f4",
    padding: "10px",
    border: "1px solid #ddd",
    cursor: "pointer",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "center",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

const AdminPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/auth/admin-mod?sort=${sortOrder}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch reported content");
        }

        const data: { posts: Post[]; comments: Comment[] } = await response.json();
        setPosts(data.posts);
        setComments(data.comments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  const handleHidePost = async (postId: number) => {
    try {
      const response = await fetch(`/api/auth/admin-hide`, {
        method: "PUT", // Adjust to your API logic
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            postId: postId,
            isHidden: true,
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to hide post");
      }

      alert("Post hidden successfully!");
    } catch (err) {
      alert("An error occurred while hiding the post.");
      console.error(err);
    }
  };
  const handleShowpost = async (postId: number) => {
    try {
      const response = await fetch(`/api/auth/admin-hide`, {
        method: "PUT", // Adjust to your API logic
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            postId: postId,
            isHidden: false,
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to un-hide post");
      }

      alert("Post un-hidden successfully!");
    } catch (err) {
      alert("An error occurred while un-hide the post.");
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Dashboard</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={toggleSortOrder} style={styles.button}>
          Sort by Report Count ({sortOrder === "asc" ? "Ascending" : "Descending"})
        </button>
      </div>

      <h2>Reported Posts</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Post ID</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Report Count</th>
            <th style={styles.th}>hidden</th>
            <th style={styles.th}>action</th>

          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts.map((post) => (
              <tr key={post.id}>
                <td style={styles.td}>{post.id}</td>
                <td style={styles.td}>{post.title}</td>
                <td style={styles.td}>{post.reportCount}</td>
                <td style={styles.td}>{post.isHidden ? "Yes" : "No"}</td>
                <button
                    onClick={() => handleHidePost(post.id)}
                    style={styles.button}
                  >
                    Hide
                </button>
                <button
                    onClick={() => handleShowpost(post.id)}
                    style={styles.button}
                  >
                    Unhide
                </button>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={styles.td}>
                No reported posts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Reported Comments</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Comment ID</th>
            <th style={styles.th}>Content</th>
            <th style={styles.th}>Report Count</th>
          </tr>
        </thead>
        <tbody>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <tr key={comment.id}>
                <td style={styles.td}>{comment.id}</td>
                <td style={styles.td}>{comment.content || "No content"}</td>
                <td style={styles.td}>{comment.reportCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={styles.td}>
                No reported comments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
