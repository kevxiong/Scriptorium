"use client";

import React from "react";

interface OutputDisplayProps {
  output: string;
  error: string;
}

export default function OutputDisplay({ output, error }: OutputDisplayProps) {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">Output</label>
      <pre className="mt-1 p-4 bg-gray-800 text-white rounded-md overflow-auto h-40">
        {output || "Your program output will appear here"}
      </pre>

      {error && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-red-600">Error</label>
          <pre className="mt-1 p-4 bg-red-800 text-white rounded-md overflow-auto h-40">
            {error}
          </pre>
        </div>
      )}
    </div>
  );
}
