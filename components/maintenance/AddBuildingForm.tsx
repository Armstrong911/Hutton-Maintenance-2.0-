"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddBuildingForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/buildings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"), strataPlan: form.get("strataPlan"),
        address: form.get("address"), city: form.get("city"),
        province: form.get("province"), postalCode: form.get("postalCode"),
      }),
    });
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Building Name *</label>
          <input name="name" required className="input" placeholder="The Regency" /></div>
        <div><label className="label">Strata Plan # *</label>
          <input name="strataPlan" required className="input" placeholder="BCS1234" /></div>
      </div>
      <div><label className="label">Street Address *</label>
        <input name="address" required className="input" placeholder="540 Michigan Street" /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="label">City</label>
          <input name="city" className="input" defaultValue="Victoria" /></div>
        <div><label className="label">Province</label>
          <input name="province" className="input" defaultValue="BC" /></div>
        <div><label className="label">Postal Code</label>
          <input name="postalCode" className="input" placeholder="V8V 1R7" /></div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5">
        {loading ? "Adding…" : "Add Building"}
      </button>
    </form>
  );
}