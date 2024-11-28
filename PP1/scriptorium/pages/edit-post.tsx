import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface Template {
  id: number;
  title: string;
}

interface Tag {
  id: number;
  name: string;
}

const CreatePost = () => {
  const router = useRouter();
  const { postid } = router.query;
  const postId = postid ? parseInt(postid as string, 10) : null;
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]); // Array for multiple templates
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]); // Array for multiple tags

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const templatesResponse = await fetch(`/api/templates`);
        const tagsResponse = await fetch(`/api/tags`);

        if (!templatesResponse.ok || !tagsResponse.ok) {
          throw new Error("Failed to fetch templates or tags");
        }

        const templatesData: Template[] = await templatesResponse.json();
        const tagsData: Tag[] = await tagsResponse.json();

        setTemplates(templatesData);
        setTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTemplateSelection = (templateId: number) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );
  };

  const handleTagSelection = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and description cannot be empty!");
      return;
    }


    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postId,
          title,
          description,
          templates: selectedTemplateIds, // Array of template IDs
          tags: selectedTagIds, // Array of tag IDs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to edit post");
      }

      alert("Post edited successfully!");
      router.push("/posts"); // Adjust the redirection as needed
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Available Templates </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Title</th>
            <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Select</th>
          </tr>
        </thead>
        <tbody>
          {templates.length > 0 ? (
            templates.map((template) => (
              <tr key={template.id}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{template.id}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{template.title}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <input
                    type="checkbox"
                    value={template.id}
                    onChange={() => handleTemplateSelection(template.id)}
                    checked={selectedTemplateIds.includes(template.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center" }}>
                No templates available
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

      <h1>Edit Blog Post ID:{postid}</h1>
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
          placeholder="Enter post title"
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
          htmlFor="description"
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter post description"
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
        onClick={handleCreatePost}
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
        {loading ? "Creating..." : "Create Post"}
      </button>
    </div>
  );
};

export default CreatePost;
