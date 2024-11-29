"use client";

interface ExecuteButtonProps {
  onClick: () => void;
  loading: boolean;
}

export default function ExecuteButton({ onClick, loading }: ExecuteButtonProps) {
  return (

    
    <button
      onClick={onClick}
      disabled={loading}
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
      {loading ? "Executing..." : "Run Code"}
    </button>
  );
}
