"use client";

import { useState } from "react";
import { registerWithEmail, loginWithGoogle } from "../../src/lib/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerWithEmail(email, password);
      alert("Account created successfully!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-zinc-900 p-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Create Account</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full rounded bg-zinc-800 p-3 text-white outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full rounded bg-zinc-800 p-3 text-white outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-green-600 py-3 font-semibold text-black"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="my-6 text-center text-zinc-400">OR</div>

        <button
          onClick={loginWithGoogle}
          className="w-full rounded bg-white py-3 font-semibold text-black"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
