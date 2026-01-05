import { jsPDF } from "jspdf";
import * as fs from "fs";

const doc = new jsPDF();
let yPos = 20;
const pageWidth = 210;
const margin = 20;
const contentWidth = pageWidth - 2 * margin;

function addTitle(text: string) {
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(text, pageWidth / 2, yPos, { align: "center" });
  yPos += 12;
}

function addHeading(text: string) {
  checkNewPage(15);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(text, margin, yPos);
  yPos += 8;
}

function addSubheading(text: string) {
  checkNewPage(12);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(text, margin, yPos);
  yPos += 6;
}

function addParagraph(text: string) {
  checkNewPage(10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, contentWidth);
  doc.text(lines, margin, yPos);
  yPos += lines.length * 5 + 3;
}

function addBullet(text: string, indent: number = 0) {
  checkNewPage(8);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const bulletX = margin + indent;
  const textX = bulletX + 5;
  const lines = doc.splitTextToSize(text, contentWidth - indent - 5);
  doc.text("•", bulletX, yPos);
  doc.text(lines, textX, yPos);
  yPos += lines.length * 5 + 2;
}

function addTableRow(col1: string, col2: string, col3: string, isHeader: boolean = false) {
  checkNewPage(8);
  doc.setFontSize(9);
  doc.setFont("helvetica", isHeader ? "bold" : "normal");
  doc.text(col1, margin, yPos);
  doc.text(col2, margin + 50, yPos);
  doc.text(col3, margin + 100, yPos);
  yPos += 5;
}

function addSpace(height: number = 5) {
  yPos += height;
}

function checkNewPage(neededSpace: number) {
  if (yPos + neededSpace > 280) {
    doc.addPage();
    yPos = 20;
  }
}

addTitle("UK Truck Clean");
addParagraph("Application Specification Document");
addParagraph("Generated: " + new Date().toLocaleDateString("en-GB"));
addSpace(10);

addHeading("1. Overview");
addParagraph("UK Truck Clean is a comprehensive web application designed to manage truck cleaning operations across various UK motorway service locations. The application streamlines fleet management, facilitates detailed wash recording, and provides an easily searchable historical record of all cleaning activities.");
addSpace();

addHeading("2. Design Philosophy");
addSubheading("2.1 Visual Design");
addBullet("Clean, minimalist interface inspired by Linear and Notion aesthetics");
addBullet("Blue water droplet branding theme reflecting the truck wash business");
addBullet("Consistent use of Shadcn/ui components with Radix UI primitives");
addBullet("Tailwind CSS for responsive styling");
addBullet("Lucide React icons for visual cues and actions");
addSpace();

addSubheading("2.2 Responsive Design");
addBullet("Mobile-first approach with responsive layouts for all pages");
addBullet("Collapsible tables for mobile viewing");
addBullet("Touch-friendly interface elements");
addBullet("Responsive grid layouts (lg:grid-cols-2 for two-column sections)");
addSpace();

addSubheading("2.3 User Experience");
addBullet("Loading skeletons for all data fetching operations");
addBullet("Toast notifications for user feedback");
addBullet("Form validation with clear error messages");
addBullet("Pagination for large datasets (20 items per page)");
addBullet("Real-time search filtering");
addSpace();

addHeading("3. Application Pages");
addSubheading("3.1 Landing Page (/)");
addParagraph("Public-facing homepage showcasing UK Truck Clean services:");
addBullet("Header with logo and login button");
addBullet("Hero section with 'Professional Truck Cleaning' heading");
addBullet("Pricing table displaying all 16 wash types with prices");
addBullet("Contact note for fleet deals (Gary Taylor - 07970 842 423)");
addBullet("Location table with 7 numbered UK motorway service locations");
addBullet("Interactive map using React Leaflet with OpenStreetMap tiles");
addBullet("Custom numbered markers matching location table");
addBullet("Company footer with contact information");
addSpace();

addSubheading("3.2 Fleet Management Page (/manage)");
addParagraph("Authenticated route for managing companies and vehicles:");
addBullet("Company Management: CRUD operations with validation");
addBullet("Vehicle Management: Registration, company assignment, wash frequency");
addBullet("Search functionality for both companies and vehicles");
addBullet("Pagination with 20 items per page");
addBullet("Referential integrity enforcement");
addSpace();

addSubheading("3.3 Record Wash Page (/record)");
addParagraph("Authenticated route for logging vehicle washes:");
addBullet("Vehicle registration lookup");
addBullet("Location selection from database");
addBullet("Wash type selection with 16 predefined options");
addBullet("Date picker for wash date");
addBullet("Automatic vehicle last_wash_date and last_wash_type updates");
addBullet("Next wash due calculation based on wash frequency");
addSpace();

addSubheading("3.4 View Records Page (/records)");
addParagraph("Authenticated route for viewing wash history:");
addBullet("Searchable and sortable wash records table");
addBullet("Filter by company, vehicle, location, date range");
addBullet("PDF invoice generation for billing");
addBullet("Company selection and date range inputs");
addBullet("Professional invoice format with itemized wash details");
addSpace();

addHeading("4. Functionality");
addSubheading("4.1 Authentication");
addBullet("Replit Auth integration for secure login");
addBullet("Role-based access control (admin, operator)");
addBullet("Protected routes for authenticated users");
addBullet("User upsert pattern on login");
addSpace();

addSubheading("4.2 Vehicle Management");
addBullet("Automatic uppercase for vehicle registrations");
addBullet("Company assignment with placeholder (CoID=999999) for unknown vehicles");
addBullet("Wash frequency configuration (days between washes)");
addBullet("Last wash date and type tracking");
addBullet("Cascading company ID updates for wash records");
addSpace();

addSubheading("4.3 Wash Recording");
addBullet("16 predefined wash types with pricing");
addBullet("7 UK motorway service locations");
addBullet("Automatic next wash due calculation");
addBullet("Database transaction for atomic updates");
addSpace();

addSubheading("4.4 Invoice Generation");
addBullet("PDF generation using jsPDF library");
addBullet("Company selection (excludes placeholder company)");
addBullet("Date range filtering for invoice period");
addBullet("Itemized wash records with prices");
addBullet("Total cost and wash count summary");
addBullet("Automatic filename generation");
addSpace();

addSubheading("4.5 Search and Pagination");
addBullet("Client-side real-time filtering");
addBullet("Case-insensitive search across multiple fields");
addBullet("20 items per page pagination");
addBullet("Automatic page clamping when filtered data shrinks");
addBullet("Previous/Next and numbered page navigation");
addSpace();

addHeading("5. Database Structure");
addParagraph("PostgreSQL database via Neon serverless platform with Drizzle ORM.");
addSpace();

addSubheading("5.1 Companies Table");
addTableRow("Column", "Type", "Description", true);
addTableRow("co_id", "serial (PK)", "Auto-incrementing company ID");
addTableRow("name", "varchar(100)", "Company name");
addTableRow("contact_name", "varchar(100)", "Contact person name");
addTableRow("contact_email", "varchar(100)", "Contact email address");
addTableRow("contact_phone", "varchar(20)", "Contact phone number");
addTableRow("created_at", "timestamp", "Record creation timestamp");
addSpace();

addSubheading("5.2 Vehicles Table");
addTableRow("Column", "Type", "Description", true);
addTableRow("vreg", "varchar(10) (PK)", "Vehicle registration");
addTableRow("co_id", "integer (FK)", "Company ID reference");
addTableRow("wash_freq", "integer", "Wash frequency in days");
addTableRow("last_wash_date", "date", "Date of last wash (or next due)");
addTableRow("last_wash_type", "integer", "Last wash type ID");
addSpace();

addSubheading("5.3 Washes Table");
addTableRow("Column", "Type", "Description", true);
addTableRow("wash_id", "serial (PK)", "Auto-incrementing wash ID");
addTableRow("vreg", "varchar(10)", "Vehicle registration");
addTableRow("co_id", "integer", "Company ID at time of wash");
addTableRow("location", "varchar(100)", "Wash location name");
addTableRow("wash_type", "integer", "Wash type ID");
addTableRow("wash_date", "date", "Date of wash");
addSpace();

addSubheading("5.4 Wash Types Table");
addTableRow("Column", "Type", "Description", true);
addTableRow("wtid", "serial (PK)", "Wash type ID");
addTableRow("description", "varchar(100)", "Wash type description");
addTableRow("price", "integer", "Price in pounds");
addParagraph("Pre-seeded with 16 wash types: Minibus (£15), Single Deck Bus (£25), Double Deck Bus (£30), Midi Coach (£35), Full Size Coach (£40), Artic Unit (£20), Artic Trailer (£18), Artic Unit & Trailer (£35), 7.5T-18T Rigid (£18), 18T+ Rigid (£22), Van (£12), 4x4/SUV (£10), Car (£8), Minibus Valet (£45), Single Deck Bus Valet (£50), Double Deck Bus Valet (£55).");
addSpace();

addSubheading("5.5 Locations Table");
addTableRow("Column", "Type", "Description", true);
addTableRow("location_id", "serial (PK)", "Location ID");
addTableRow("name", "varchar(100)", "Location name");
addTableRow("motorway", "varchar(10)", "Motorway reference");
addTableRow("area", "varchar(50)", "Geographic area");
addTableRow("postcode", "varchar(10)", "UK postcode");
addParagraph("Pre-seeded with 7 UK locations: Chester (M56), Stafford South (M6), Rownhams (M27), Strensham (M5), Tibshelf (M1), Taunton Deane (M5), Hollies (M6).");
addSpace();

addSubheading("5.6 Users Table");
addTableRow("Column", "Type", "Description", true);
addTableRow("id", "varchar (PK)", "Replit user ID");
addTableRow("email", "varchar", "User email");
addTableRow("first_name", "varchar", "First name");
addTableRow("last_name", "varchar", "Last name");
addTableRow("profile_image_url", "varchar", "Profile image URL");
addTableRow("role", "varchar", "User role (admin/operator)");
addTableRow("created_at", "timestamp", "Account creation date");
addTableRow("updated_at", "timestamp", "Last update date");
addSpace();

addHeading("6. Technical Stack");
addSubheading("6.1 Frontend");
addBullet("React 18 with TypeScript");
addBullet("Vite for development and building");
addBullet("Shadcn/ui + Radix UI for components");
addBullet("Tailwind CSS for styling");
addBullet("TanStack Query for data fetching and caching");
addBullet("React Hook Form with Zod validation");
addBullet("Wouter for client-side routing");
addBullet("React Leaflet for interactive maps");
addBullet("jsPDF for PDF generation");
addSpace();

addSubheading("6.2 Backend");
addBullet("Express.js with TypeScript");
addBullet("Drizzle ORM for database operations");
addBullet("Passport.js for authentication");
addBullet("Express sessions with PostgreSQL store");
addBullet("RESTful API architecture");
addSpace();

addSubheading("6.3 Database");
addBullet("PostgreSQL via Neon serverless platform");
addBullet("Drizzle Kit for schema management");
addBullet("Type-safe queries with Drizzle ORM");
addBullet("Shared Zod schemas for validation");
addSpace();

addHeading("7. API Endpoints");
addSubheading("7.1 Public Endpoints");
addBullet("GET /api/locations - List all locations");
addBullet("GET /api/washtypes - List all wash types");
addSpace();

addSubheading("7.2 Protected Endpoints");
addBullet("GET /api/auth/user - Get current user");
addBullet("GET /api/companies - List companies");
addBullet("POST /api/companies - Create company");
addBullet("PATCH /api/companies/:id - Update company");
addBullet("DELETE /api/companies/:id - Delete company");
addBullet("GET /api/vehicles - List vehicles");
addBullet("POST /api/vehicles - Create vehicle");
addBullet("PATCH /api/vehicles/:vreg - Update vehicle");
addBullet("DELETE /api/vehicles/:vreg - Delete vehicle");
addBullet("GET /api/washes - List wash records");
addBullet("POST /api/washes - Record new wash");
addSpace();

addHeading("8. Contact Information");
addParagraph("UK Truck Clean Ltd");
addParagraph("4 Linden Close, Lymm, WA13 9PH");
addParagraph("Phone: 07970 824 423");
addParagraph("Fleet enquiries: Gary Taylor - 07970 842 423");

const pdfBuffer = doc.output("arraybuffer");
fs.writeFileSync("UK_Truck_Clean_Specification.pdf", Buffer.from(pdfBuffer));
console.log("PDF generated: UK_Truck_Clean_Specification.pdf");
