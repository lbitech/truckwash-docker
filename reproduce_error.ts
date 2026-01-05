import { storage } from "./server/storage";
import { db } from "./server/db";
import { companies } from "./shared/schema";
import { eq } from "drizzle-orm";

async function debug() {
    console.log("Starting debug script...");
    try {
        // 1. Check if 'Express Logistics' exists and get its coId
        const allCompanies = await storage.getCompanies();
        const expressLogistics = allCompanies.find(c => c.name.includes("Express Logistics"));

        if (!expressLogistics) {
            console.error("Express Logistics not found in database!");
            return;
        }
        console.log(`Found Express Logistics with coId: ${expressLogistics.coId}`);

        // 2. Try to create/assign vehicle XL67HFT to Express Logistics
        console.log("Attempting storage.createVehicle for XL67HFT...");
        const result = await storage.createVehicle({
            vreg: "XL67HFT",
            coId: expressLogistics.coId,
            washFreq: 0
        });
        console.log("Success! Result:", result);

    } catch (error) {
        console.error("CAUGHT ERROR:", error);
        if (error instanceof Error) {
            console.error("Stack trace:", error.stack);
        }
    } finally {
        // Close DB connection if necessary, but scripts usually just exit
        process.exit();
    }
}

debug();
