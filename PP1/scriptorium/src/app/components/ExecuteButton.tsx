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
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Executing..." : "Run Code"}
    </button>
  );
}
