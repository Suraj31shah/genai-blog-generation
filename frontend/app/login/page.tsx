"use client";

import { useEffect } from "react";
import { loginWithEmail, loginWithGoogle } from "../../src/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-zinc-900 p-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Login</h1>

        <button
          onClick={loginWithGoogle}
          className="w-full rounded bg-white py-3 font-semibold text-black"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-zinc-400">
          Don’t have an account?{" "}
          <a href="/register" className="text-green-500">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
