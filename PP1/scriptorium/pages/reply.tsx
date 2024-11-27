import { useState } from "react";
import { useRouter } from "next/router";

const Reply = () => {
  const router = useRouter();
  const { postid, parentid } = router.query;
  const [replyContent, setReplyContent] = useState("");

  // Convert postid and parentid to integers
  const postId = postid ? parseInt(postid as string, 10) : null;
  const parentId = parentid ? parseInt(parentid as string, 10) : null;

  const handlePostReply = async () => {
    if (!replyContent) {
      alert("Reply content cannot be empty!");
      return;
    }

    try {
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId,
          parentId: parentId,
          content: replyContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post reply");
      }

      // Handle successful reply submission (e.g., redirect or show success message)
      alert("Reply submitted successfully!");
      setReplyContent(""); // Clear the content
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("An error occurred while submitting your reply.");
    }
  };

  return (
    <div>
      <h1>Reply to Comment</h1>
      <div>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write your reply..."
          style={{ width: "100%", height: "100px" }}
        />
        <button onClick={handlePostReply}>Submit Reply</button>
      </div>
    </div>
  );
};

export default Reply;
