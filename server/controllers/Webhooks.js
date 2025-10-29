import { Webhook } from "svix";
import User from "../models/User.js";

// Clerk webhook handler
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify webhook signature
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created":
        // Create user in DB
        await User.create({
          _id: data.id,          // Clerk ID as _id
          clerkId: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses[0].email_address,
          image: data.profile_image_url || "", // optional
          resume: "", // you can set later
        });
        break;

      case "user.updated":
        // Update user in DB
        await User.findOneAndUpdate(
          { _id: data.id },
          {
            name: `${data.first_name} ${data.last_name}`,
            email: data.email_addresses[0].email_address,
            image: data.profile_image_url || "",
          }
        );
        break;

      case "user.deleted":
        // Delete user from DB
        await User.findOneAndDelete({ _id: data.id });
        break;

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    console.error("Webhook verification or processing failed:", error);
    res.status(400).send({ status: "failed", message: error.message });
  }
};