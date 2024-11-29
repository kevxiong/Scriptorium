"use client";

import React, { useState, CSSProperties } from "react";
import CodeEditor from "../src/app/components/CodeEditor";
import StandardInput from "../src/app/components/StandardInput";
import ExecuteButton from "../src/app/components/ExecuteButton";
import OutputDisplay from "../src/app/components/OutputDisplay";
import { useRouter } from "next/router";

export default function CodeExecution() {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleExecute = async () => {
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, input }),
      });

      const data = await response.json();

      if (response.ok) {
        setOutput(data.output);
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const saveastemp = async () => {
    router.push(`/save-template?code=${code}`);
  };

  // Styles
  const styles: Record<string, CSSProperties> = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    header: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
      marginBottom: "1rem",
    },
    controlRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px", // Ensures spacing between the dropdown and button
    },
    label: {
      fontSize: "1rem",
      fontWeight: "500",
      color: "#555",
      marginBottom: "0.5rem",
    },
    select: {
      padding: "10px",
      fontSize: "1rem",
      border: "1px solid #ccc",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor: "#fff",
      width: "100%",
      maxWidth: "200px",
      transition: "border-color 0.2s ease",
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "1rem",
      textAlign: "center",
      transition: "background-color 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
    },
  };

  return (
    <div style={styles.container}>
      {/* Home Button */}
      <button
        onClick={() => router.push(`/posts`)}
        style={{
          ...styles.button,
          backgroundColor: "#28a745",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#218838")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
      >
        Home
      </button>

      {/* Page Header */}
      <h1 style={styles.header}>Code Execution</h1>

      {/* Language Selector and Save Template Button */}
      <div style={styles.controlRow}>
        <div>
          <label style={styles.label}>Select Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.select}
            onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="php">PHP</option>
            <option value="csharp">C#</option>
            <option value="swift">Swift</option>
          </select>
        </div>
        <button
          onClick={saveastemp}
          style={styles.button}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#007BFF")
          }
        >
          Save as Template
        </button>
      </div>

      {/* Code Editor */}
      <CodeEditor language={language} code={code} setCode={setCode} />

      {/* Standard Input */}
      <StandardInput input={input} setInput={setInput} />

      {/* Execute Button */}
      <ExecuteButton onClick={handleExecute} loading={loading} />

      {/* Output Display */}
      <OutputDisplay output={output} error={error} />
    </div>
  );
}
