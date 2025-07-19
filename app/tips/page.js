'use client';

import { useEffect, useState } from 'react';

export default function TipsPage() {
  const [tips, setTips] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch('/api/admin/tips');
        const data = await res.json();
        setTips(data.tips || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('Failed to fetch tips:', err);
      }
    };

    fetchTips();
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#4ED7F1] p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex justify-center items-center">
        <h1 className="text-3xl font-bold mb-1">Admin Tips Overview</h1>
      </div>

      {/* Total Tips */}
      <div className="bg-[#111] border border-[#4ED7F1] rounded-xl p-6 mb-6 shadow-md">
        <h2 className="text-xl font-semibold mb-2">Total Tips Received</h2>
        <p className="text-3xl font-bold">₹{total}</p>
      </div>

      {/* Donor List */}
      <div className="bg-[#111] border border-[#4ED7F1] rounded-xl p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Donor List</h2>

        {tips.length === 0 ? (
          <p className="text-gray-400">No tips received yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-[#1a1a1a] border border-[#4ED7F1] rounded-lg p-4 space-y-2"
              >
                <div className="text-lg font-semibold truncate">{tip.name}</div>
                <div className="text-base">💰 ₹{tip.amount}</div>
                <div className="text-sm text-gray-400">
                  🕒 {new Date(tip.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
