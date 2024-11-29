"use client";

import React, { CSSProperties } from "react";

interface StandardInputProps {
  input: string;
  setInput: (value: string) => void;
}

export default function StandardInput({ input, setInput }: StandardInputProps) {
  // Define styles with proper TypeScript typing
  const styles: Record<string, CSSProperties> = {
    container: {
      marginTop: "1rem", // Equivalent to mt-4
      width: "100%", // Ensure the container uses full width
      maxWidth: "600px", // Limit the width for responsiveness
    },
    label: {
      display: "block",
      fontSize: "0.875rem", // Equivalent to text-sm
      fontWeight: 500, // Medium font weight
      color: "#4a5568", // Equivalent to text-gray-700
    },
    textarea: {
      marginTop: "0.5rem", // Space above the textarea
      marginBottom: "1rem", // Added space below the textarea
      width: "100%", // Full width within the container
      maxWidth: "100%", // Prevent overflow
      padding: "0.75rem", // Equivalent to p-3
      border: "1px solid #d1d5db", // Equivalent to border-gray-300
      borderRadius: "0.5rem", // Equivalent to rounded-lg
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // Equivalent to shadow-sm
      fontSize: "0.875rem", // Equivalent to text-sm
      color: "#4a5568", // Equivalent to text-gray-700
      resize: "none", // Prevent resizing
      transition: "all 0.2s", // Smooth transition for hover/focus effects
    },
    textareaFocus: {
      borderColor: "#3b82f6", // Equivalent to focus:border-blue-500
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)", // Equivalent to focus:ring-2 focus:ring-blue-500
    },
  };

  // Merge default and focus styles dynamically
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    Object.assign(e.target.style, styles.textareaFocus);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    Object.assign(e.target.style, styles.textarea);
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Standard Input</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter input for your program"
        style={styles.textarea}
        onFocus={handleFocus}
        onBlur={handleBlur}
      ></textarea>
    </div>
  );
}
