// pages/myposts.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Placeholder styles
const styles = {
  container: { padding: "20px" },
  header: { fontSize: "2rem", marginBottom: "20px" },
  card: { padding: "15px", border: "1px solid #ddd", marginBottom: "15px", borderRadius: "8px" },
  title: { fontSize: "1.5rem", fontWeight: "bold" },
  description: { fontSize: "1rem" },
  noPostsMessage: { fontSize: "1.2rem", color: "#888", marginTop: "20px" },
};

// Assume you have an API that fetches posts based on the userId
const fetchUserPosts = async (userId: string) => {
  try {
    const response = await fetch(`/api/posts/browse?self=1`);
    if (!response.ok) throw new Error("Failed to fetch posts");

    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const MyPostsPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate getting the current user (this could be from context, session, or props)
  const currentUser = { id: "user123", email: "user@example.com" };  // Replace with actual user info

  useEffect(() => {
    const getPosts = async () => {
      if (currentUser?.id) {
        const userPosts = await fetchUserPosts(currentUser.id);
        setPosts(userPosts);
      } else {
        setError("No user found");
      }
      setLoading(false);
    };

    getPosts();
  }, [currentUser]);

  const destroy = async (postId: string) => {
    const response = await fetch('/api/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit delete');
    }
    return response.json();
  };

  const edit = (postId: string): void => {
    router.push(`/edit-post?postid=${postId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>My Posts</h1>
      <button
          onClick={ () => router.push(`/posts`) }
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
          Home
        </button>

      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} style={styles.card}>
            <h2 style={styles.title}>{post.title}</h2>
            <p style={styles.description}>{post.description}</p>
            {/* Add a link or button to view post details if needed */}

            <button
              onClick={() => router.push(`/single-post?postid=${post.id}`)}
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
            <button
                onClick={() => destroy(post.id)}
                style={{
                    padding: "8px 12px",
                    background: "#DC3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
                >
                Delete Post
            </button>
            <button
                onClick={() => edit(post.id)}
                style={{
                    padding: "8px 12px",
                    background: "#808080",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
                >
                Edit Post
            </button>
          </div>
        ))
      ) : (
        <p style={styles.noPostsMessage}>You haven't created any posts yet.</p>
      )}
    </div>
  );
};

export default MyPostsPage;
