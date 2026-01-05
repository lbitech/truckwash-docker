import { storage } from "./server/storage";
import { db } from "./server/db";
import { users } from "./shared/schema";

async function test() {
    console.log("Testing storage.getUser...");
    try {
        // Ensure mock user exists
        const mockUser = {
            id: "mock-user-id",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            profileImageUrl: "",
            role: "WashOperative",
        };

        // Manually insert if not exists (upsertUser logic)
        await storage.upsertUser(mockUser);
        console.log("Upserted mock user.");

        const user = await storage.getUser("mock-user-id");
        console.log("Retrieved user:", user);
    } catch (error) {
        console.error("Error:", error);
    }
}

test().catch(console.error);
