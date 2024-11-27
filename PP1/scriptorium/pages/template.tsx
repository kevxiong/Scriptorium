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

interface Template {
  id: number; // Matches the Int type from Prisma
  title: string;
  code: string;
  explanation?: string | null; // Optional field, can be null
  tags: { id: string; name: string }[];
  userId: number; // Foreign key referencing the User
  user: { email: string };
  posts: Post[]; // Array of related Post objects
  forkedFrom?: number | null; // Optional field for forked template ID
  originalTemplate?: Template | null; // Reference to the original template, if forked
  forks: Template[]; // Array of forked templates
}

const Temps: FC = () => {
  const router = useRouter();
  const [templates, setTemplate] = useState<Template[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data: Template[] = await response.json();
        setTemplate(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return <p>Loading templates...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!templates || templates.length === 0) {
    return <p>No templates found.</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>All Templates</h1>
      <div style={styles.grid}>
        {templates.map((template) => (
          <div key={template.id} style={styles.card}>
            <h2 style={styles.title}>{template.title}</h2>
            <p style={styles.description}>{template.explanation || "No explanation provided"}</p>
            <div>
              <div>
                <strong>Tags:</strong>{" "}
                {template.tags.map((tag) => (
                  <span key={tag.id} style={styles.tag}>
                    {tag.name} (ID: {tag.id})
                  </span>
                ))}
              </div>
              <div>
                <strong>Posts:</strong>{" "}
                {template.posts && template.posts.length > 0 ? (
                  template.posts.map((post) => (
                    <span key={post.id} style={styles.tag}>
                      {post.title} (ID: {post.id})
                    </span>
                  ))
                ) : (
                  <p>No posts available</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Temps;
