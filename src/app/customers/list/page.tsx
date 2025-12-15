"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  remark?: string;
  createdAt: string;
}

export default function CustomerPage() {
  const [tab, setTab] = useState<"add" | "list">("add");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    remark: "",
  });
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/customers", { method: "GET" });
      if (!res.ok) {
        const errorText = await res.text();
        setMessage(`❌ Failed to fetch customers: ${errorText}`);
        return;
      }
      const data: Customer[] = await res.json();
      setCustomers(data);
    } catch (error: any) {
      setMessage("❌ Error fetching customers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "list") fetchCustomers();
  }, [tab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving...");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Customer saved successfully!");
        setForm({ name: "", phone: "", email: "", remark: "" });
        if (tab === "list") fetchCustomers();
      } else {
        setMessage("❌ " + (data.error || "Something went wrong"));
      }
    } catch (error: any) {
      setMessage("❌ " + error.message);
    }
  };

  // Format date and time separately
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Customer Management</h2>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-4 py-2 rounded-xl ${tab === "add" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("add")}
        >
          ➕ Add Customer
        </button>
        <button
          className={`px-4 py-2 rounded-xl ${tab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("list")}
        >
          📄 View Customers
        </button>
      </div>

      {/* Tab Content */}
      {tab === "add" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-xl p-2"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-xl p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-xl p-2"
          />
          <textarea
            name="remark"
            placeholder="Remark"
            value={form.remark}
            onChange={handleChange}
            className="w-full border rounded-xl p-2"
            rows={3}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Save Customer
          </button>
          {message && <p className="text-center mt-4">{message}</p>}
        </form>
      ) : (
        <div>
          {message && <p className="text-center text-red-500 mb-4">{message}</p>}
          {loading ? (
            <p className="text-center">Loading customers...</p>
          ) : customers.length === 0 ? (
            <p className="text-center text-gray-500">No customers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-xl">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Remark</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: Customer) => (
                    <tr key={c.id} className="text-center hover:bg-gray-50">
                      <td className="p-2 border">{c.name}</td>
                      <td className="p-2 border">{c.phone}</td>
                      <td className="p-2 border">{c.email || "-"}</td>
                      <td className="p-2 border">{c.remark || "-"}</td>
                      <td className="p-2 border">{formatDate(c.createdAt)}</td>
                      <td className="p-2 border">{formatTime(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
