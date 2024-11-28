import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface Template {
  id: number;
  title: string;
  explanation: string;
  code: string;
}

interface Tag {
  id: number;
  name: string;
}

const edittemp = () => {
  const router = useRouter();
  const { code, titleog, exog} = router.query;
  const [title, setTitle] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]); // Array for multiple templates
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]); // Array for multiple tags

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tagsResponse = await fetch(`/api/tags`);
        if (!tagsResponse.ok) {
          throw new Error("Failed to fetch templates or tags");
        }
        const tagsData: Tag[] = await tagsResponse.json();
        setTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleTagSelection = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTemp = async () => {
    if (!title.trim() || !explanation.trim()) {
      alert("Title and description cannot be empty!");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          explanation,
          code, // Array of template IDs
          tags: selectedTagIds, // Array of tag IDs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create template");
      }
      if (titleog || exog) {
        alert("Forked sucessfully as new template");
      }

      alert("Template created successfully!");
      router.push("/posts"); // Adjust the redirection as needed
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating template:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>

      <h2>Available Tags</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Select</th>
          </tr>
        </thead>
        <tbody>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <tr key={tag.id}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{tag.id}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{tag.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <input
                    type="checkbox"
                    value={tag.id}
                    onChange={() => handleTagSelection(tag.id)}
                    checked={selectedTagIds.includes(tag.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center" }}>
                No tags available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h1>To save as a new Template, add a title and explanation </h1>
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
          placeholder={
            Array.isArray(titleog)
              ? titleog.join(", ") // Convert string array to a comma-separated string
              : titleog // If it's already a string or undefined, use it as is
          }
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
          htmlFor="explanation"
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          explanation
        </label>
        <textarea
          id="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={
            Array.isArray(exog)
              ? exog.join(", ") // Convert string array to a comma-separated string
              : exog // If it's already a string or undefined, use it as is
          }
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
        onClick={handleCreateTemp}
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
        {loading ? "editing..." : "Create Template"}
      </button>
    </div>
  );
};

export default edittemp;
