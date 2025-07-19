import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const users = await User.find().select("name email image");
  console.log("✅ USERS FETCHED:", users); // Debug here
  return Response.json({ users });
}
