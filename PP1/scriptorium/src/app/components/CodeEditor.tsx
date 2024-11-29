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
      case "python":
        return "python";
      case "javascript":
        return "javascript";
      case "java":
        return "java";
      case "c":
        return "c";
      case "cpp":
        return "cpp";
      case "ruby":
        return "ruby";
      case "go":
        return "go";
      case "php":
        return "php";
      case "csharp":
        return "csharp";
      case "swift":
        return "swift";
      default:
        return "plaintext";
    }
  }

  // Styles
  const styles = {
    container: {
      height: "450px",
      border: "1px solid #e0e0e0",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#f9f9f9",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 15px",
      backgroundColor: "#007bff",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "16px",
    },
    languageTag: {
      backgroundColor: "#0056b3",
      padding: "5px 10px",
      borderRadius: "5px",
      fontSize: "12px",
      color: "#fff",
    },
    editor: {
      flexGrow: 1,
      backgroundColor: "#1e1e1e",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header with language display */}
      <div style={styles.header}>
        Code Editor
        <span style={styles.languageTag}>{language.toUpperCase()}</span>
      </div>

      {/* Monaco Editor */}
      <div style={styles.editor}>
        <Editor
          height="100%"
          language={mapLanguage(language)}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false }, // Disable minimap for a cleaner look
            fontSize: 14,
            wordWrap: "on", // Enable word wrapping
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
