"use client";

import React from "react";

interface OutputDisplayProps {
  output: string;
  error: string;
}

export default function OutputDisplay({ output, error }: OutputDisplayProps) {
  // Styles
  const styles = {
    container: {
      marginTop: "1.5rem", // Equivalent to Tailwind's mt-6
      display: "flex",
      flexDirection: "column",
      gap: "1rem", // Space between output and error sections
    },
    label: {
      display: "block",
      fontSize: "0.875rem", // Equivalent to text-sm
      fontWeight: 500, // Medium font weight
      color: "#374151", // Equivalent to text-gray-700
    },
    pre: {
      marginTop: "0.25rem", // Equivalent to mt-1
      padding: "1rem", // Equivalent to p-4
      backgroundColor: "#1f2937", // Equivalent to bg-gray-800
      color: "#ffffff", // Text color
      borderRadius: "0.5rem", // Equivalent to rounded-md
      overflow: "auto",
      height: "160px", // Equivalent to h-40
      fontSize: "0.875rem", // Equivalent to text-sm
      lineHeight: "1.5", // For better readability
      fontFamily: "monospace", // Use a monospace font for code-like output
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for modern look
    },
    errorLabel: {
      color: "#dc2626", // Equivalent to text-red-600
    },
    errorPre: {
      marginTop: "0.25rem", // Equivalent to mt-1
      padding: "1rem", // Equivalent to p-4
      backgroundColor: "#7f1d1d", // Equivalent to bg-red-800
      color: "#ffffff", // Text color
      borderRadius: "0.5rem", // Equivalent to rounded-md
      overflow: "auto",
      height: "160px", // Equivalent to h-40
      fontSize: "0.875rem", // Equivalent to text-sm
      lineHeight: "1.5", // For better readability
      fontFamily: "monospace", // Use a monospace font for code-like error output
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for modern look
    },
  };

  return (
    <div style={styles.container}>
      {/* Output Section */}
      <div>
        <label style={styles.label}>Output</label>
        <pre style={styles.pre}>
          {output || "Your program output will appear here"}
        </pre>
      </div>

      {/* Error Section */}
      {error && (
        <div>
          <label style={{ ...styles.label, ...styles.errorLabel }}>Error</label>
          <pre style={styles.errorPre}>{error}</pre>
        </div>
      )}
    </div>
  );
}
