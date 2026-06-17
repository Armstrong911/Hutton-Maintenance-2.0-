"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddUserForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"), name: form.get("name"),
        password: form.get("password"), isSuperAdmin: form.get("isSuperAdmin") === "on",
      }),
    });
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Full Name</label>
          <input name="name" className="input" placeholder="Jane Smith" /></div>
        <div><label className="label">Email *</label>
          <input name="email" type="email" required className="input" placeholder="jane@example.com" /></div>
      </div>
      <div><label className="label">Temporary Password *</label>
        <input name="password" type="password" required className="input" /></div>
      <div className="flex items-center gap-3">
        <input type="checkbox" name="isSuperAdmin" id="isSuperAdmin" className="w-4 h-4" />
        <label htmlFor="isSuperAdmin" className="text-sm font-serif text-zinc-600">Super Admin (access to all buildings)</label>
      </div>
      <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5">
        {loading ? "Adding…" : "Add User"}
      </button>
    </form>
  );
}