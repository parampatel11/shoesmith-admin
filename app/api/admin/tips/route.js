// /app/api/admin/tips/route.js
import { connectDB } from '@/lib/mongodb';
import Tip from '@/models/Tip';

export async function GET() {
  try {
    await connectDB();

    const tips = await Tip.find().sort({ createdAt: -1 });

    const totalAmount = tips.reduce((sum, tip) => sum + tip.amount, 0);

    const simplifiedTips = tips.map(tip => ({
      name: tip.name,
      amount: tip.amount,
      createdAt: tip.createdAt,
    }));

    return Response.json({
      total: totalAmount,
      tips: simplifiedTips,
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return new Response('Failed to fetch tips', { status: 500 });
  }
}
