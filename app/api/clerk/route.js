import { Webhook } from "svix";
import { headers } from "next/headers";
import connectDB from "../../../config/db";
import User from "../../../models/User";

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);

  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let data, type;
  try {
    ({ data, type } = wh.verify(body, svixHeaders));
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDB();

    switch (type) {
      case "user.created":
      case "user.updated":
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          image: data.image_url,
        };

        if (type === "user.created") {
          await User.create(userData);
          console.log("✅ User created:", userData);
        } else {
          await User.findByIdAndUpdate(data.id, userData);
          console.log("✅ User updated:", userData);
        }
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        console.log("🗑️ User deleted:", data.id);
        break;

      default:
        console.log("ℹ️ Unhandled event type:", type);
        break;
    }

    return new Response(JSON.stringify({ message: "Event processed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Webhook handling error:", err);
    return new Response(JSON.stringify({ error: "Webhook handler error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
