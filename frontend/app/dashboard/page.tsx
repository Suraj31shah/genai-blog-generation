"use client";

import { useAuth } from "../../src/context/AuthContext";
import { logout } from "../../src/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold">Welcome {user.email}</h1>

      <button
        onClick={logout}
        className="mt-6 rounded bg-red-600 px-6 py-3"
      >
        Logout
      </button>
    </div>
  );
}
