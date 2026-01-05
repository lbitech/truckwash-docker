import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWashSchema, insertCompanySchema, insertVehicleSchema, insertWashTypeSchema, insertWashListSchema, insertInvoiceSchema, insertUserSchema, insertLocationSchema, type User } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

async function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user;
  console.log("isAdmin check for user:", user?.email, "role:", user?.role);
  if (user.role === "superAdmin" || user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
}


export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Admin User Management Routes
  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.updateUser(req.params.id, { role });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(validatedData.email!);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid user data", details: error.message });
      } else {
        console.error("Failed to create user:", error);
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.post("/api/admin/users/:id/reset-password", isAdmin, async (req, res) => {
    try {
      const newPassword = randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.params.id, { password: hashedPassword });
      res.json({ newPassword });
    } catch (error) {
      console.error("Failed to reset password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });



  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        res.json(null);
        return;
      }

      const userId = req.session.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/washtypes", async (_req, res) => {
    try {
      const washTypes = await storage.getWashTypes();
      res.json(washTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wash types" });
    }
  });

  app.post("/api/washtypes", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWashTypeSchema.parse(req.body);
      const washType = await storage.createWashType(validatedData);
      res.status(201).json(washType);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid wash type data", details: error.message });
      } else {
        console.error("Failed to create wash type:", error);
        res.status(500).json({ error: "Failed to create wash type" });
      }
    }
  });

  app.patch("/api/washtypes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWashTypeSchema.partial().parse(req.body);
      const washType = await storage.updateWashType(id, validatedData);
      res.json(washType);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid wash type data", details: error.message });
      } else if (error instanceof Error && error.message === "Wash type not found") {
        res.status(404).json({ error: "Wash type not found" });
      } else {
        console.error("Failed to update wash type:", error);
        res.status(500).json({ error: "Failed to update wash type" });
      }
    }
  });

  app.delete("/api/washtypes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWashType(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Wash type not found") {
        res.status(404).json({ error: "Wash type not found" });
      } else {
        console.error("Failed to delete wash type:", error);
        res.status(500).json({ error: "Failed to delete wash type" });
      }
    }
  });

  app.get("/api/locations", async (_req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid location data", details: error.message });
      } else {
        console.error("Failed to create location:", error);
        res.status(500).json({ error: "Failed to create location" });
      }
    }
  });

  app.patch("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, validatedData);
      res.json(location);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid location data", details: error.message });
      } else if (error instanceof Error && error.message === "Location not found") {
        res.status(404).json({ error: "Location not found" });
      } else {
        console.error("Failed to update location:", error);
        res.status(500).json({ error: "Failed to update location" });
      }
    }
  });

  app.delete("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLocation(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Location not found") {
        res.status(404).json({ error: "Location not found" });
      } else {
        console.error("Failed to delete location:", error);
        res.status(500).json({ error: "Failed to delete location" });
      }
    }
  });

  app.get("/api/companies", isAuthenticated, async (_req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid company data", details: error.message });
      } else {
        console.error("Failed to create company:", error);
        res.status(500).json({ error: "Failed to create company. Please try again.", details: error instanceof Error ? error.message : String(error) });
      }
    }
  });

  app.patch("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const coId = parseInt(req.params.id);
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(coId, validatedData);
      res.json(company);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid company data", details: error.message });
      } else if (error instanceof Error && error.message === "Company not found") {
        res.status(404).json({ error: "Company not found" });
      } else {
        console.error("Failed to update company:", error);
        res.status(500).json({ error: "Failed to update company. Please try again." });
      }
    }
  });

  app.delete("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const coId = parseInt(req.params.id);
      await storage.deleteCompany(coId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Cannot delete company with associated vehicles") {
        res.status(409).json({ error: "Cannot delete company with associated vehicles. Please delete or reassign all vehicles first." });
      } else if (error instanceof Error && error.message === "Company not found") {
        res.status(404).json({ error: "Company not found" });
      } else {
        console.error("Failed to delete company:", error);
        res.status(500).json({ error: "Failed to delete company. Please try again." });
      }
    }
  });

  app.get("/api/vehicles", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (user.role === "transportAdmin") {
        if (!user.coId) {
          return res.json([]);
        }
        const vehicles = await storage.getVehiclesByCompany(user.coId);
        return res.json(vehicles);
      }
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", isAuthenticated, async (req, res) => {
    try {
      const vreg = req.body.vreg?.toUpperCase();
      if (!vreg) {
        return res.status(400).json({ error: "Vehicle registration is required" });
      }

      const vehicleData = insertVehicleSchema.parse({
        vreg,
        coId: Number(req.body.coId),
        washFreq: req.body.washFreq !== undefined ? Number(req.body.washFreq) : undefined,
      });

      console.log("POST /api/vehicles - data:", vehicleData);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("POST /api/vehicles - Detailed Error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid vehicle data", details: error.message });
      } else {
        console.error("Failed to create/update vehicle:", error);
        res.status(500).json({ error: "Failed to create/update vehicle. Please try again." });
      }
    }
  });

  app.get("/api/vehicles/:vreg", isAuthenticated, async (req, res) => {
    try {
      const vehicle = await storage.getVehicleByVreg(req.params.vreg);
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }

      const company = await storage.getCompanyById(vehicle.coId);
      const companyName = company?.name || "Unknown";

      res.json({ ...vehicle, companyName });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.patch("/api/vehicles/:vreg", isAuthenticated, async (req, res) => {
    try {
      const vreg = req.params.vreg.toUpperCase();
      const validatedData = insertVehicleSchema.omit({ vreg: true }).partial().parse(req.body);

      if (validatedData.coId !== undefined) {
        const company = await storage.getCompanyById(validatedData.coId);
        if (!company) {
          res.status(400).json({ error: "Selected company does not exist" });
          return;
        }
      }

      const vehicle = await storage.updateVehicle(vreg, validatedData);
      res.json(vehicle);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid vehicle data", details: error.message });
      } else if (error instanceof Error && error.message === "Vehicle not found") {
        res.status(404).json({ error: "Vehicle not found" });
      } else {
        console.error("Failed to update vehicle:", error);
        res.status(500).json({ error: "Failed to update vehicle. Please try again." });
      }
    }
  });

  app.delete("/api/vehicles/:vreg", isAuthenticated, async (req, res) => {
    try {
      const vreg = req.params.vreg.toUpperCase();
      await storage.deleteVehicle(vreg);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Vehicle not found") {
        res.status(404).json({ error: "Vehicle not found" });
      } else {
        console.error("Failed to delete vehicle:", error);
        res.status(500).json({ error: "Failed to delete vehicle. Please try again." });
      }
    }
  });

  app.get("/api/washes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (user.role === "transportAdmin") {
        if (!user.coId) {
          return res.json([]);
        }
        const washes = await storage.getWashesByCompany(user.coId);
        return res.json(washes);
      }
      const washes = await storage.getWashes();
      res.json(washes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch washes" });
    }
  });

  app.post("/api/washes", isAuthenticated, async (req, res) => {
    try {
      const vreg = req.body.vreg?.toUpperCase();
      let coId = req.body.coId;

      if (!vreg) {
        res.status(400).json({ error: "Vehicle registration is required" });
        return;
      }

      const existingVehicle = await storage.getVehicleByVreg(vreg);

      if (!existingVehicle) {
        coId = 999999;
        await storage.createVehicle({
          vreg,
          coId,
          washFreq: 0,
          lastWashDate: undefined,
          lastWashType: undefined,
        });
      } else {
        if (existingVehicle.lastWashDate) {
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const nextWashDue = new Date(existingVehicle.lastWashDate);
          nextWashDue.setUTCHours(0, 0, 0, 0);

          if (today <= nextWashDue) {
            const nextWashDateStr = nextWashDue.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'UTC'
            });
            res.status(400).json({
              error: `This vehicle cannot be washed until after ${nextWashDateStr}. The next wash is due on that date.`
            });
            return;
          }
        }

        if (!coId) {
          coId = existingVehicle.coId;
        }
      }

      const validatedData = insertWashSchema.parse({
        vreg,
        coId,
        location: req.body.location,
        washType: req.body.washType,
        driverName: req.body.driverName,
      });

      const wash = await storage.createWash(validatedData);
      res.status(201).json(wash);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid wash data", details: error.message });
      } else {
        console.error("Failed to create wash:", error);
        res.status(500).json({ error: "Failed to record wash. Please try again." });
      }
    }
  });

  app.post("/api/wash-lists", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWashListSchema.parse(req.body);
      const washList = await storage.createWashList(validatedData);
      res.status(201).json(washList);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid wash list data", details: error.message });
      } else {
        console.error("Failed to create wash list:", error);
        res.status(500).json({ error: "Failed to save wash list" });
      }
    }
  });

  app.get("/api/wash-lists", isAuthenticated, async (_req, res) => {
    try {
      const washLists = await storage.getWashLists();
      // Enrich with company name and omit pdfContent for list view
      const washListsWithCompany = await Promise.all(washLists.map(async (washList) => {
        const company = await storage.getCompanyById(washList.coId);
        const { pdfContent, ...washListWithoutPdf } = washList;
        return {
          ...washListWithoutPdf,
          companyName: company?.name || "Unknown Company"
        };
      }));
      // Sort desc by id (newest first)
      washListsWithCompany.sort((a, b) => b.id - a.id);
      res.json(washListsWithCompany);
    } catch (error) {
      console.error("Failed to fetch wash lists:", error);
      res.status(500).json({ error: "Failed to fetch wash lists" });
    }
  });

  app.get("/api/wash-lists/:id/download", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const washList = await storage.getWashListById(id);

      if (!washList) {
        res.status(404).json({ error: "Wash list not found" });
        return;
      }

      const company = await storage.getCompanyById(washList.coId);
      const companyName = company?.name.replace(/[^a-z0-9]/gi, '_') || "Unknown";
      const dateStr = washList.generatedAt ? new Date(washList.generatedAt).toISOString().split('T')[0] : 'date';
      const filename = `wash_list_${companyName}_${dateStr}.pdf`;

      // Convert Base64 to Buffer
      const pdfBuffer = Buffer.from(washList.pdfContent, 'base64');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Failed to download wash list:", error);
      res.status(500).json({ error: "Failed to download wash list" });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid invoice data", details: error.message });
      } else {
        console.error("Failed to create invoice:", error);
        res.status(500).json({ error: "Failed to save invoice" });
      }
    }
  });

  app.get("/api/invoices", isAuthenticated, async (_req, res) => {
    try {
      const invoices = await storage.getInvoices();
      const invoicesWithCompany = await Promise.all(invoices.map(async (invoice) => {
        const company = await storage.getCompanyById(invoice.coId);
        const { pdfContent, ...invoiceWithoutPdf } = invoice;
        return {
          ...invoiceWithoutPdf,
          companyName: company?.name || "Unknown Company"
        };
      }));
      invoicesWithCompany.sort((a, b) => b.id - a.id);
      res.json(invoicesWithCompany);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id/download", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(id);

      if (!invoice) {
        res.status(404).json({ error: "Invoice not found" });
        return;
      }

      const company = await storage.getCompanyById(invoice.coId);
      const companyName = company?.name.replace(/[^a-z0-9]/gi, '_') || "Unknown";
      const dateStr = invoice.generatedAt ? new Date(invoice.generatedAt).toISOString().split('T')[0] : 'date';
      const filename = `invoice_${companyName}_${dateStr}.pdf`;

      const pdfBuffer = Buffer.from(invoice.pdfContent, 'base64');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      res.status(500).json({ error: "Failed to download invoice" });
    }
  });

  app.get("/api/permissions", isAuthenticated, async (_req, res) => {
    try {
      const permissions = await storage.getPagePermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });

  app.post("/api/permissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (user?.role !== "superAdmin" && user?.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const { role, pageRoute, isAllowed } = req.body;
      const permission = await storage.updatePagePermission(role, pageRoute, isAllowed);
      res.json(permission);
    } catch (error) {
      console.error("Failed to update permission:", error);
      res.status(500).json({ error: "Failed to update permission" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
