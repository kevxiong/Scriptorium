import { useState } from "react";
import { useRouter } from "next/router";

const Report = () => {
  const router = useRouter();
  const { postid, parentid } = router.query;
  const [replyContent, setReplyContent] = useState("");

  // Convert postid and parentid to integers
  const postId = postid ? parseInt(postid as string, 10) : null;
  const parentId = parentid ? parseInt(parentid as string, 10) : null;

  const handlecommentreport = async () => {
    if (!replyContent) {
      alert("report content cannot be empty!");
      return;
    }

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: parentId,
          reason: replyContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post report");
      }
      alert("report submitted successfully!");
      setReplyContent(""); // Clear the content
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting your report.");
    }
  };
  return (
    <div>
      <h1>Report reason</h1>
      <div>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write your reply..."
          style={{ width: "100%", height: "100px" }}
        />
        <button onClick={handlecommentreport}>Submit Report</button>
      </div>
    </div>
  );
};

export default Report;
