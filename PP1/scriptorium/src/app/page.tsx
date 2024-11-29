// pages/auth.tsx
"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "success" or "error"

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const apiUrl = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const requestBody = isLogin
      ? { email, password }
      : { email, password, firstName, lastName };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setModalMessage(data.message);
        setModalType("success");
      } else {
        setModalMessage(data.error);
        setModalType("error");
      }
    } catch (error) {
      setModalMessage("An unexpected error occurred.");
      setModalType("error");
    } finally {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Signup'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {!isLogin && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>

          {isLogin && (
            <button
              onClick={() => router.push(`/posts`)}
              style={{
                background: "transparent",
                border: "none",
                color: "#007BFF",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              proceed to app
            </button>
          )}

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 mt-4 block text-center hover:underline"
          >
            {isLogin ? 'Switch to Signup' : 'Switch to Login'}
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            {modalType === "success" && (
              <div className="text-green-500 font-bold mb-4">Success!</div>
            )}
            {modalType === "error" && (
              <div className="text-red-500 font-bold mb-4">Error!</div>
            )}
            <div className="mb-4">{modalMessage}</div>
            <button
              onClick={handleCloseModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
