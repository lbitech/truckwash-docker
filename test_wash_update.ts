
import { storage } from "./server/storage";
import { insertWashTypeSchema } from "./shared/schema";

async function test() {
    console.log("Testing updateWashType...");
    try {
        // 1. Validate Schema behavior
        console.log("Testing Schema Validation with float...");
        try {
            insertWashTypeSchema.partial().parse({ price: 22.50 });
            console.log("Schema ACCEPTED 22.50");
        } catch (e) {
            console.log("Schema REJECTED 22.50:", (e as Error).message);
        }

        // 2. Test Storage update (assuming ID 33 exists from partial curl output earlier)
        // We will try to set it to 23 first to verify connection, then 23.5

        console.log("Updating ID 33 to price 23...");
        await storage.updateWashType(33, { price: 23 });
        let wt = await storage.getWashType(33);
        console.log("WashType 33 price:", wt?.price);

        console.log("Updating ID 33 to price 23.5...");
        await storage.updateWashType(33, { price: 23.5 });
        wt = await storage.getWashType(33);
        console.log("WashType 33 price:", wt?.price);

    } catch (error) {
        console.error("Test Error:", error);
    }
}

test().catch(console.error);
