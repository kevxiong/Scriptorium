// pages/code-execution.tsx
"use client";
import { useEffect, useState, FC } from "react";

import CodeEditor from "../src/app/components/CodeEditor";
import StandardInput from "../src/app/components/StandardInput";
import ExecuteButton from "../src/app/components/ExecuteButton";
import OutputDisplay from "../src/app/components/OutputDisplay";
import { useRouter } from "next/router";

interface Post {
    id: string;
    title: string;
    description: string;
    user: { email: string };
    comments: { id: string; content: string }[];
    tags: { id: string; name: string }[];
    templates: { id: string; title: string }[];
    rating: { upvote: boolean; downvote: boolean }[];
  }
interface Template {
    id: number; // Matches the Int type from Prisma
    title: string;
    code: string;
    explanation?: string | null; // Optional field, can be null
    tags: { id: string; name: string }[];
    userId: number; // Foreign key referencing the User
    user: { email: string };
    posts: Post[]; // Array of related Post objects
    forkedFrom?: number | null; // Optional field for forked template ID
    originalTemplate?: Template | null; // Reference to the original template, if forked
    forks: Template[]; // Array of forked templates
  }

export default function CodeExecution() {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const {templateid } = router.query;

  const [template, setTemplate] = useState<Template | null>(null);
  const [title, setTitle] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");

  useEffect(() => {
    const fetchtemp = async () => {
      try {
        const query: string = templateid?.toString() || "";
        const response = await fetch(`/api/templates/${query}`);
        if (!response.ok) throw new Error("Failed to fetch template");
        const data: Template = await response.json();
        setTemplate(data);
  
        // Set code, title, and explanation after fetching template
        setCode(data.code);
        setTitle(data.title);
        if (data.explanation) {
          setExplanation(data.explanation);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
  
    if (templateid) {
      fetchtemp();
    }
  }, [templateid]);
  

  const edit = (templateid: number) => {
    router.push(`/checkout-template?templateid=${templateid}`);
  };

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
    router.push(`/save-template?code=${code}&titleog=${title}&exgo=${explanation}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Code Execution of template id {templateid}</h1>

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
