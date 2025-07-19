"use client";

import Link from "next/link";
import AdminDashboard from "@/admin/app/page";

export default function Home() {
  return (
    <div className="bg-black text-[#4ED7F1] min-h-screen p-6">
      <AdminDashboard />
    </div>
  );
}
