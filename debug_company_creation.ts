import { storage } from "./server/storage";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkDatabase() {
    console.log("Checking database columns for 'companies' table...");
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'companies'
            ORDER BY column_name
        `);
        console.log("Columns in 'companies' table:");
        console.table(result.rows);

        console.log("\nAttempting to create a test company...");
        const newCompany = await storage.createCompany({
            name: "Test Bug Company",
            transportManager: "Bug Reporter",
            transportManagerEmail: "bug@example.com",
            transportManagerPhone: "123456789",
            poContact: "PO Person",
            poContactEmail: "po@example.com",
            poContactPhone: "987654321",
            plContact: "PL Person",
            plContactEmail: "pl@example.com",
            plContactPhone: "555555555"
        });
        console.log("Success! Created company:", newCompany);
    } catch (error) {
        console.error("CAUGHT ERROR:", error);
    } finally {
        process.exit();
    }
}

checkDatabase();
