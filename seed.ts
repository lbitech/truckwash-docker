import { db } from "./server/db";
import { washtypes, locations, companies, vehicles, users } from "./shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
    console.log("Seeding database...");

    // Clear existing data
    await db.execute(sql`TRUNCATE TABLE vehicles, companies, locations, washtypes, users CASCADE`);
    console.log("Tables truncated.");

    // ... (existing code: Wash Types)
    const washTypesData = [
        { description: "Minibus", price: 22 },
        { description: "Van", price: 20 },
        { description: "Luton Van", price: 22 },
        { description: "Rigid Flat <17 Tonne", price: 24 },
        { description: "Rigid Box <17 Tonne", price: 24 },
        { description: "Tipper", price: 33 },
        { description: "Rigid Tanker", price: 33 },
        { description: "Unit only", price: 22 },
        { description: "Coach / Large Rigid", price: 28 },
        { description: "Unit with slat / skelley", price: 28 },
        { description: "Unit with trailer", price: 30 },
        { description: "Artic Tanker", price: 35 },
        { description: "Trailer Only", price: 27 },
        { description: "Car Transporter", price: 30 },
        { description: "Artic Draw-Bar", price: 32 },
        { description: "Alloys Deep Clean", price: 18 },
    ];
    await db.insert(washtypes).values(washTypesData);
    console.log("Wash types seeded.");

    // ... (existing code: Locations)
    const locationsData = [
        { name: "Lymm Truck Wash", motorway: "M6", area: "Lymm", postcode: "WA13 0SP" },
        { name: "Watford Gap", motorway: "M1", area: "Northampton", postcode: "NN6 7UZ" },
        { name: "Sandbach", motorway: "M6", area: "Sandbach", postcode: "CW11 2FZ" },
        { name: "Keele", motorway: "M6", area: "Keele", postcode: "ST5 5HG" },
        { name: "Tibshelf", motorway: "M1", area: "Tibshelf", postcode: "DE55 5TZ" },
        { name: "Clacket Lane", motorway: "M25", area: "Westerham", postcode: "TN16 2ER" },
        { name: "Thurrock", motorway: "M25", area: "Grays", postcode: "RM16 3BG" },
    ];
    await db.insert(locations).values(locationsData);
    console.log("Locations seeded.");

    // ... (existing code: Companies)
    const companiesData = [
        { name: "Fleet Transport Ltd", transportManager: "John Smith", transportManagerEmail: "john@fleet.co.uk", transportManagerPhone: "01234567890" },
        { name: "Express Logistics", transportManager: "Jane Doe", transportManagerEmail: "jane@express.co.uk", transportManagerPhone: "09876543210" },
    ];
    const insertedCompanies = await db.insert(companies).values(companiesData).returning();
    console.log("Companies seeded.");

    // ... (existing code: Vehicles)
    const vehiclesData = [
        { vreg: "ABC123", coId: insertedCompanies[0].coId, washFreq: 0 },
        { vreg: "XYZ789", coId: insertedCompanies[1].coId, washFreq: 0 },
        { vreg: "DEF456", coId: insertedCompanies[0].coId, washFreq: 0 },
    ];
    await db.insert(vehicles).values(vehiclesData);
    console.log("Vehicles seeded.");

    // Seed mock user
    const hashedPassword = await bcrypt.hash("truckwash123", 10);
    const mockUser = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        password: hashedPassword,
        profileImageUrl: "",
        role: "washOperative",
    } as any;
    await db.insert(users).values(mockUser);
    console.log("User seeded (password: truckwash123).");

    console.log("Seeding complete.");
}

seed().catch(console.error);
