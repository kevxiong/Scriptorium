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

  // Helper function to map the language to Monaco Editor's supported languages
  function mapLanguage(lang: string): string {
    switch (lang.toLowerCase()) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'ruby':
        return 'ruby';
      case 'go':
        return 'go';
      case 'php':
        return 'php';
      case 'csharp':
        return 'csharp';
      case 'swift':
        return 'swift';
      default:
        return 'plaintext';
    }
  }

  return (
    <div style={{ height: "400px", border: "1px solid #ccc" }}>
      <Editor
        height="100%"
        language={mapLanguage(language)} // Use the helper function to map the language
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
