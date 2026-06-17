"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [["ADMINISTRATION","Administration"],["COUNCIL","Council"],["OWNER","Owner"]];

export function AddBuildingUserForm({ buildingId }: { buildingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch(`/api/buildings/${buildingId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"), name: form.get("name"),
        password: form.get("password") || "ChangeMe123!",
        buildingRole: form.get("role"),
      }),
    });
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Email *</label>
          <input name="email" type="email" required className="input" placeholder="owner@example.com" /></div>
        <div><label className="label">Name</label>
          <input name="name" className="input" placeholder="Jane Smith" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Temp Password (leave blank = ChangeMe123!)</label>
          <input name="password" type="password" className="input" /></div>
        <div><label className="label">Role *</label>
          <select name="role" required className="input">
            {ROLES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5">
        {loading ? "Adding…" : "Add User"}
      </button>
    </form>
  );
}