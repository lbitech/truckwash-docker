import { db } from "./server/db";
import { users, UserRole, USER_ROLES } from "./shared/schema";
import bcrypt from "bcryptjs";
import 'dotenv/config';

async function createAdmin() {
    // Parse command line arguments
    // Usage: npx tsx create_admin.ts <email> <password> [role]
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log("Usage: npx tsx create_admin.ts <email> <password> [role]");
        console.log("Supported roles: ", USER_ROLES.join(", "));
        console.log("Default role: superAdmin");
        process.exit(1);
    }

    const [email, password, roleArg] = args;
    const role = (roleArg || "superAdmin") as UserRole;

    if (!USER_ROLES.includes(role)) {
        console.error(`Invalid role: ${role}`);
        console.log("Supported roles: ", USER_ROLES.join(", "));
        process.exit(1);
    }

    try {
        console.log(`Creating user with email: ${email} and role: ${role}`);

        const hashedPassword = await bcrypt.hash(password, 10);

        // Using "first_name" and "last_name" placeholders as they aren't provided in args
        // but schema allows them to be null or optional if not enforced.
        // Schema definition: firstName: varchar("first_name"), (nullable by default in drizzle unless .notNull() is used - let's check schema again)
        // Looking at schema.ts in previous turn: firstName is nullable.

        await db.insert(users).values({
            email,
            password: hashedPassword,
            role,
            firstName: "Admin",
            lastName: "User",
        });

        console.log("User created successfully.");
    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        process.exit(0);
    }
}

createAdmin().catch(console.error);
