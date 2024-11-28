import { useRouter } from "next/router";
import { useEffect, useState, FC, FormEvent } from "react";


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
  code: {
    font: "monospace",
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

const mytemps: FC = () => {
  const router = useRouter();
  const [templates, setTemplate] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates/template-browse?self=1");
        if (response.status == (401)) {
            throw new Error("login required");
          }
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

  const destroy = async (templateId: number) => {
    const response = await fetch('/api/templates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: templateId}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit delete');
    }
    return response.json();
  };

  const edit = (templateid: number): void => {
    router.push(`/edit-template?templateid=${templateid}`);
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
  
    const query: { [key: string]: string } = {};
    if (title.trim()) query.title = title.trim();
    if (tag.trim()) query.tagId = tag.trim();
    if (explanation.trim()) query.explanation = explanation.trim();
    if (code.trim()) query.code = code.trim();
  
    if (Object.keys(query).length === 0) {
      alert("Please fill at least one search field.");
      return;
    }
  
    const queryString = Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
  
    try {
      const response = await fetch(`/api/templates/template-browse?${queryString}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch filtered templates");
      }
      const filteredTemplates: Template[] = await response.json();
      setTemplate(filteredTemplates); // Update the templates state with filtered data
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      console.error("Error filtering templates:", err);
    }
  };
  


  if (loading) {
    return <p>Loading templates...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>My saved Templates</h1>
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
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", textAlign: "center" }}>
        <label htmlFor="searchTitle" style={{ fontSize: "1rem", marginRight: "10px" }}>
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
        <label htmlFor="searchExplanation" style={{ fontSize: "1rem", marginRight: "10px" }}>
          Explanation:
        </label>
        <input
          id="searchExplanation"
          type="text"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Search by explanation"
          style={styles.searchinput}
        />
        <button type="submit"> Search </button>
      </form>
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", textAlign: "center" }}>
        <label htmlFor="searchCode" style={{ fontSize: "1rem", marginRight: "10px" }}>
          Code:
        </label>
        <input
          id="searchCode"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Search by code"
          style={styles.searchinput}
        />
        <button type="submit"> Search </button>
      </form>
      <div style={styles.grid}>
        {templates.map((template) => (
          <div key={template.id} style={styles.card}>
            <h2 style={styles.title}>{template.title}</h2>
            <p style={styles.description}>{template.explanation || "No explanation provided"}</p>
            <p style={styles.code}>{template.code || "No code provided"}</p>
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
            <button
                onClick={() => destroy(template.id)}
                style={{
                    padding: "8px 12px",
                    background: "#DC3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
                >
                Delete Template
            </button>
            <button
                onClick={() => edit(template.id)}
                style={{
                    padding: "8px 12px",
                    background: "#808080",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
                >
                Edit Template
            </button>
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
          </div>
          
        ))}
      </div>
    </div>
  );
};

export default mytemps;
