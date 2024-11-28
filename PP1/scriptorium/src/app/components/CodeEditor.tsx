"use client";

import React from "react";
import Editor, { OnChange } from "@monaco-editor/react";

interface CodeEditorProps {
  language: string; // The language selected by the user
  code: string; // The current code in the editor
  setCode: (value: string) => void; // Function to update the code state
}

export default function CodeEditor({ language, code, setCode }: CodeEditorProps) {
  const handleEditorChange: OnChange = (value) => {
    setCode(value || ""); // Update the code state when the user types
  };

  return (
    <div style={{ height: "400px", border: "1px solid #ccc" }}>
      <Editor
        height="100%"
        language={language} // Dynamically update the language
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark" // Use dark theme for better visibility
        options={{
          minimap: { enabled: false }, // Disable minimap for a cleaner look
          fontSize: 14,
          wordWrap: "on", // Enable word wrapping
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
