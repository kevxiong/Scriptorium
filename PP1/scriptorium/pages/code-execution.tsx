// pages/code-execution.tsx
"use client";

import React, { useState } from "react";
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

  return (
    <div className="container mx-auto p-6">
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
      <h1 className="text-3xl font-bold mb-4">Code Execution</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1 block w-40 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <CodeEditor language={language} code={code} setCode={setCode} />
      <StandardInput input={input} setInput={setInput} />
      <ExecuteButton onClick={handleExecute} loading={loading} />
      <OutputDisplay output={output} error={error} />


      <button
        onClick={saveastemp}
        style={{
          padding: "10px 15px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Save as Template
      </button>
    </div>
    
  );
}
