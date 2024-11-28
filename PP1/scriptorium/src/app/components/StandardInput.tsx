"use client";

import React from "react";

interface StandardInputProps {
  input: string;
  setInput: (value: string) => void;
}

export default function StandardInput({ input, setInput }: StandardInputProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Standard Input</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="mt-1 block w-full h-20 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter input for your program"
      ></textarea>
    </div>
  );
}
