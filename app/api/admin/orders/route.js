// admin/app/api/admin/orders/route.js
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find();

    const users = await User.find().select("name email image");

    const enrichedOrders = orders.map(order => {
      const user = users.find(u => u.name === order.userId); // match by name
      return {
        ...order.toObject(),
        user: {
          name: user?.name || "Unknown",
          email: user?.email || "",
          image: user?.image || "",
        },
      };
    });

    return Response.json({ orders: enrichedOrders });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch orders" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
