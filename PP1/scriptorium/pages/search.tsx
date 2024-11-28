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
  error: {
    textAlign: "center",
    color: "red",
  },
};

interface Post {
  id: string;
  title: string;
  description: string;
  user?: {
    email: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
}

const Search: FC = () => {
  const router = useRouter();
  const { title, tagId, content, templateid } = router.query;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const searchDescription: string = [
    title && `Title: "${title}"`,
    tagId && `Tag: "${tagId}"`,
    content && `Content: "${content}"`,
    templateid && `Template: "${templateid}"`,
  ]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query: { [key: string]: string } = {};
        if (title) query.title = title.toString().trim();
        if (tagId) query.tagId = tagId.toString().trim();
        if (content) query.content = content.toString().trim();
        if (templateid) query.template = templateid.toString().trim();
        if (Object.keys(query).length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        const queryString: string = new URLSearchParams(query).toString();
        const response: Response = await fetch(`/api/posts/browse?${queryString}`);
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data: Post[] = await response.json();
        setPosts(data);
        setError("");
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (title || tagId || content || templateid) {
      fetchPosts();
    }
  }, [title, tagId, content, templateid]);

  if (loading) return <p style={{ ...styles.meta }}>Loading...</p>;
  if (error) return <p style={{ ...styles.error }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>
        Search Results {searchDescription && `for ${searchDescription}`}
      </h1>
      {posts.length > 0 ? (
        <div style={styles.grid}>
          {posts.map((post) => (
            <div key={post.id} style={styles.card}>
              <h2 style={styles.title}>{post.title}</h2>
              <p style={styles.description}>{post.description}</p>
              <div>
                <p style={styles.meta}>
                  <strong>Author:</strong> {post.user?.email || "Anonymous"}
                </p>
                <div>
                  <strong>Tags:</strong>{" "}
                  {post.tags.map((tag) => (
                    <span key={tag.id} style={styles.tag}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>No posts found matching your search criteria.</p>
      )}
    </div>
  );
};

export default Search;
