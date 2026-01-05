import {
  washtypes,
  locations,
  vehicles,
  washes,
  companies,
  users,
  type WashType,
  type Location,
  type InsertLocation,
  type Vehicle,
  type Wash,
  type InsertWash,
  type InsertVehicle,
  type Company,
  type InsertCompany,
  type User,
  type UpsertUser,
  type InsertWashType,
  washLists,
  type WashList,
  type InsertWashList,
  invoices,
  type Invoice,
  type InsertInvoice,
  insertUserSchema,
  type InsertUser,
  type UserRole,
  pagePermissions,
  type PagePermission,
  type InsertPagePermission,
  SYSTEM_PAGES,
  USER_ROLES
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  getWashTypes(): Promise<WashType[]>;
  getLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: number): Promise<void>;
  getLocationById(id: number): Promise<Location | undefined>;
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(coId: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(coId: number): Promise<void>;
  getCompanyById(coId: number): Promise<Company | undefined>;
  getVehicles(): Promise<Vehicle[]>;
  getVehicleByVreg(vreg: string): Promise<Vehicle | undefined>;
  getVehiclesByCompany(coId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(vreg: string, vehicle: Partial<Omit<InsertVehicle, 'vreg'>>): Promise<Vehicle>;
  deleteVehicle(vreg: string): Promise<void>;
  getWashes(): Promise<Wash[]>;
  getWashesByCompany(coId: number): Promise<Wash[]>;
  createWash(wash: InsertWash): Promise<Wash>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  createWashType(washType: InsertWashType): Promise<WashType>;
  updateWashType(id: number, washType: Partial<InsertWashType>): Promise<WashType>;
  deleteWashType(id: number): Promise<void>;
  deleteWashType(id: number): Promise<void>;
  getWashType(id: number): Promise<WashType | undefined>;
  createWashList(washList: InsertWashList): Promise<WashList>;
  getWashLists(): Promise<WashList[]>;
  getWashListById(id: number): Promise<WashList | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoices(): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  getPagePermissions(): Promise<PagePermission[]>;
  getPagePermissionsByRole(role: string): Promise<PagePermission[]>;
  updatePagePermission(role: string, pageRoute: string, isAllowed: number): Promise<PagePermission>;
}

export class MemStorage implements IStorage {
  private washTypes: WashType[] = [
    { wtid: 1, description: "Minibus", price: 22 },
    { wtid: 2, description: "Van", price: 20 },
    { wtid: 3, description: "Luton Van", price: 22 },
    { wtid: 4, description: "Rigid Flat <17 Tonne", price: 24 },
    { wtid: 5, description: "Rigid Box <17 Tonne", price: 24 },
    { wtid: 6, description: "Tipper", price: 33 },
    { wtid: 7, description: "Rigid Tanker", price: 33 },
    { wtid: 8, description: "Unit only", price: 22 },
    { wtid: 9, description: "Coach / Large Rigid", price: 28 },
    { wtid: 10, description: "Unit with slat / skelley", price: 28 },
    { wtid: 11, description: "Unit with trailer", price: 30 },
    { wtid: 12, description: "Artic Tanker", price: 35 },
    { wtid: 13, description: "Trailer Only", price: 27 },
    { wtid: 14, description: "Car Transporter", price: 30 },
    { wtid: 15, description: "Artic Draw-Bar", price: 32 },
    { wtid: 16, description: "Alloys Deep Clean", price: 18 },
  ];

  private washListsArray: WashList[] = [];
  private nextWashListId = 1;

  private invoicesArray: Invoice[] = [];
  private nextInvoiceId = 1;

  private pagePermissionsArray: PagePermission[] = [];
  private nextPagePermissionId = 1;

  private companiesArray: Company[] = [
    { coId: 1, name: "Fleet Transport Ltd", transportManager: "John Smith", transportManagerEmail: "john@fleet.co.uk", transportManagerPhone: "01234567890", poContact: null, poContactEmail: null, poContactPhone: null, plContact: null, plContactEmail: null, plContactPhone: null, createdAt: new Date() },
    { coId: 2, name: "Express Logistics", transportManager: "Jane Doe", transportManagerEmail: "jane@express.co.uk", transportManagerPhone: "09876543210", poContact: null, poContactEmail: null, poContactPhone: null, plContact: null, plContactEmail: null, plContactPhone: null, createdAt: new Date() },
  ];
  private nextCoId = 3;

  private vehiclesMap: Map<string, Vehicle> = new Map([
    ["ABC123", { vreg: "ABC123", coId: 1, washFreq: 0, lastWashDate: null, lastWashType: null }],
    ["XYZ789", { vreg: "XYZ789", coId: 2, washFreq: 0, lastWashDate: null, lastWashType: null }],
    ["DEF456", { vreg: "DEF456", coId: 1, washFreq: 0, lastWashDate: null, lastWashType: null }],
  ]);

  private washesArray: Wash[] = [];
  private nextWashId = 1;

  private usersMap: Map<string, User> = new Map();

  async getWashTypes(): Promise<WashType[]> {
    return [...this.washTypes].sort((a, b) => a.wtid - b.wtid);
  }

  async getWashType(id: number): Promise<WashType | undefined> {
    return this.washTypes.find(w => w.wtid === id);
  }

  async createWashType(washType: InsertWashType): Promise<WashType> {
    const newWashType: WashType = {
      wtid: this.washTypes.length + 1,
      description: washType.description,
      price: washType.price,
    };
    this.washTypes.push(newWashType);
    return newWashType;
  }

  async updateWashType(id: number, updates: Partial<InsertWashType>): Promise<WashType> {
    const index = this.washTypes.findIndex(w => w.wtid === id);
    if (index === -1) throw new Error("Wash type not found");

    const updated = { ...this.washTypes[index], ...updates };
    this.washTypes[index] = updated;
    return updated;
  }

  async deleteWashType(id: number): Promise<void> {
    const index = this.washTypes.findIndex(w => w.wtid === id);
    if (index === -1) throw new Error("Wash type not found");
    this.washTypes.splice(index, 1);
  }

  async getLocations(): Promise<Location[]> {
    return [];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    throw new Error("Location creation not supported in MemStorage");
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location> {
    throw new Error("Location update not supported in MemStorage");
  }

  async deleteLocation(id: number): Promise<void> {
    throw new Error("Location deletion not supported in MemStorage");
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    return undefined;
  }

  async getCompanies(): Promise<Company[]> {
    return [...this.companiesArray].sort((a, b) => a.name.localeCompare(b.name));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const company: Company = {
      coId: this.nextCoId++,
      name: insertCompany.name,
      transportManager: insertCompany.transportManager ?? null,
      transportManagerEmail: insertCompany.transportManagerEmail ?? null,
      transportManagerPhone: insertCompany.transportManagerPhone ?? null,
      poContact: insertCompany.poContact ?? null,
      poContactEmail: insertCompany.poContactEmail ?? null,
      poContactPhone: insertCompany.poContactPhone ?? null,
      plContact: insertCompany.plContact ?? null,
      plContactEmail: insertCompany.plContactEmail ?? null,
      plContactPhone: insertCompany.plContactPhone ?? null,
      createdAt: new Date(),
    };
    this.companiesArray.push(company);
    return company;
  }

  async updateCompany(coId: number, updates: Partial<InsertCompany>): Promise<Company> {
    const index = this.companiesArray.findIndex(c => c.coId === coId);
    if (index === -1) {
      throw new Error("Company not found");
    }
    this.companiesArray[index] = {
      ...this.companiesArray[index],
      ...updates,
    };
    return this.companiesArray[index];
  }

  async deleteCompany(coId: number): Promise<void> {
    const index = this.companiesArray.findIndex(c => c.coId === coId);
    if (index === -1) {
      throw new Error("Company not found");
    }
    const vehiclesForCompany = await this.getVehiclesByCompany(coId);
    if (vehiclesForCompany.length > 0) {
      throw new Error("Cannot delete company with associated vehicles");
    }
    this.companiesArray.splice(index, 1);
  }

  async getCompanyById(coId: number): Promise<Company | undefined> {
    return this.companiesArray.find(c => c.coId === coId);
  }

  async getVehiclesByCompany(coId: number): Promise<Vehicle[]> {
    return Array.from(this.vehiclesMap.values()).filter(v => v.coId === coId);
  }

  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehiclesMap.values()).sort((a, b) => a.vreg.localeCompare(b.vreg));
  }

  async getVehicleByVreg(vreg: string): Promise<Vehicle | undefined> {
    return this.vehiclesMap.get(vreg.toUpperCase());
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const vreg = vehicle.vreg.toUpperCase();
    const existingVehicle = this.vehiclesMap.get(vreg);

    if (existingVehicle) {
      if (existingVehicle.coId === 999999 && vehicle.coId !== 999999) {
        this.washesArray = this.washesArray.map(w =>
          w.vreg === vreg ? { ...w, coId: vehicle.coId } : w
        );
      }
      const updated: Vehicle = {
        ...existingVehicle,
        coId: vehicle.coId,
        washFreq: vehicle.washFreq ?? existingVehicle.washFreq,
        lastWashDate: vehicle.lastWashDate ?? existingVehicle.lastWashDate,
        lastWashType: vehicle.lastWashType ?? existingVehicle.lastWashType,
      };
      this.vehiclesMap.set(vreg, updated);
      return updated;
    }

    const newVehicle: Vehicle = {
      vreg,
      coId: vehicle.coId,
      washFreq: vehicle.washFreq ?? 0,
      lastWashDate: vehicle.lastWashDate ?? null,
      lastWashType: vehicle.lastWashType ?? null,
    };
    this.vehiclesMap.set(vreg, newVehicle);

    // Defensive reconciliation
    this.washesArray = this.washesArray.map(w =>
      w.vreg === vreg ? { ...w, coId: vehicle.coId } : w
    );

    return newVehicle;
  }

  async updateVehicle(vreg: string, updates: Partial<Omit<InsertVehicle, 'vreg'>>): Promise<Vehicle> {
    const vehicle = this.vehiclesMap.get(vreg.toUpperCase());
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    const updated = { ...vehicle, ...updates };
    this.vehiclesMap.set(vreg.toUpperCase(), updated);
    return updated;
  }

  async deleteVehicle(vreg: string): Promise<void> {
    if (!this.vehiclesMap.has(vreg.toUpperCase())) {
      throw new Error("Vehicle not found");
    }
    this.vehiclesMap.delete(vreg.toUpperCase());
  }

  async getWashes(): Promise<Wash[]> {
    return [...this.washesArray].sort((a, b) => b.washId - a.washId);
  }

  async getWashesByCompany(coId: number): Promise<Wash[]> {
    return this.washesArray
      .filter(w => w.coId === coId)
      .sort((a, b) => b.washId - a.washId);
  }

  async createWash(insertWash: InsertWash): Promise<Wash> {
    const wash: Wash = {
      ...insertWash,
      washId: this.nextWashId++,
      washDate: new Date(),
      driverName: insertWash.driverName ?? null,
    };
    this.washesArray.push(wash);
    return wash;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      profileImageUrl: user.profileImageUrl ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      email: user.email ?? null,
      role: (user.role as UserRole) || "washOperative"
    };
    this.usersMap.set(newUser.id, newUser);
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = userData.id ? this.usersMap.get(userData.id) : undefined;

    const user: User = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email ?? existingUser?.email ?? null,
      firstName: userData.firstName ?? existingUser?.firstName ?? null,
      lastName: userData.lastName ?? existingUser?.lastName ?? null,
      password: userData.password || existingUser?.password || "",
      profileImageUrl: userData.profileImageUrl ?? existingUser?.profileImageUrl ?? null,
      role: userData.role ?? existingUser?.role ?? "washOperative",
      createdAt: existingUser?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    this.usersMap.set(user.id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.usersMap.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.usersMap.set(id, updated);
    return updated;
  }

  async createWashList(washList: InsertWashList): Promise<WashList> {
    const newWashList: WashList = {
      ...washList,
      id: this.nextWashListId++,
      generatedAt: new Date(),
    };
    this.washListsArray.push(newWashList);
    return newWashList;
  }

  async getWashLists(): Promise<WashList[]> {
    return [...this.washListsArray].sort((a, b) => b.id - a.id);
  }

  async getWashListById(id: number): Promise<WashList | undefined> {
    return this.washListsArray.find(i => i.id === id);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: this.nextInvoiceId++,
      generatedAt: new Date(),
      poNumber: invoice.poNumber ?? null,
    };
    this.invoicesArray.push(newInvoice);
    return newInvoice;
  }

  async getInvoices(): Promise<Invoice[]> {
    return [...this.invoicesArray].sort((a, b) => b.id - a.id);
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    return this.invoicesArray.find(i => i.id === id);
  }

  async getPagePermissions(): Promise<PagePermission[]> {
    return [...this.pagePermissionsArray];
  }

  async getPagePermissionsByRole(role: string): Promise<PagePermission[]> {
    return this.pagePermissionsArray.filter(p => p.role === role);
  }

  async updatePagePermission(role: string, pageRoute: string, isAllowed: number): Promise<PagePermission> {
    const index = this.pagePermissionsArray.findIndex(p => p.role === role && p.pageRoute === pageRoute);
    if (index !== -1) {
      this.pagePermissionsArray[index].isAllowed = isAllowed;
      return this.pagePermissionsArray[index];
    }
    const newPermission: PagePermission = {
      id: this.nextPagePermissionId++,
      role,
      pageRoute,
      isAllowed
    };
    this.pagePermissionsArray.push(newPermission);
    return newPermission;
  }
}

export class DatabaseStorage implements IStorage {
  async getWashTypes(): Promise<WashType[]> {
    return await db.select().from(washtypes).orderBy(washtypes.wtid);
  }

  async getWashType(id: number): Promise<WashType | undefined> {
    const [washType] = await db.select().from(washtypes).where(eq(washtypes.wtid, id));
    return washType;
  }

  async createWashType(washType: InsertWashType): Promise<WashType> {
    const [newWashType] = await db.insert(washtypes).values(washType).returning();
    return newWashType;
  }

  async updateWashType(id: number, updates: Partial<InsertWashType>): Promise<WashType> {
    const [updated] = await db
      .update(washtypes)
      .set(updates)
      .where(eq(washtypes.wtid, id))
      .returning();

    if (!updated) throw new Error("Wash type not found");
    return updated;
  }

  async deleteWashType(id: number): Promise<void> {
    await db.delete(washtypes).where(eq(washtypes.wtid, id));
  }

  async getLocations(): Promise<Location[]> {
    const results = await db.select().from(locations);
    return results.sort((a, b) => a.locationId - b.locationId);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: number, updates: Partial<InsertLocation>): Promise<Location> {
    const [updated] = await db
      .update(locations)
      .set(updates)
      .where(eq(locations.locationId, id))
      .returning();

    if (!updated) throw new Error("Location not found");
    return updated;
  }

  async deleteLocation(id: number): Promise<void> {
    await db.delete(locations).where(eq(locations.locationId, id));
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.locationId, id));
    return location;
  }

  async getCompanies(): Promise<Company[]> {
    const results = await db.select().from(companies);
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(coId: number, updates: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.coId, coId))
      .returning();
    if (!company) {
      throw new Error("Company not found");
    }
    return company;
  }

  async deleteCompany(coId: number): Promise<void> {
    const company = await this.getCompanyById(coId);
    if (!company) {
      throw new Error("Company not found");
    }

    const vehiclesForCompany = await this.getVehiclesByCompany(coId);
    if (vehiclesForCompany.length > 0) {
      throw new Error("Cannot delete company with associated vehicles");
    }

    await db.delete(companies).where(eq(companies.coId, coId));
  }

  async getCompanyById(coId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.coId, coId));
    return company;
  }

  async getVehiclesByCompany(coId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.coId, coId));
  }

  async getVehicles(): Promise<Vehicle[]> {
    const results = await db.select().from(vehicles);
    return results.sort((a, b) => a.vreg.localeCompare(b.vreg));
  }

  async getVehicleByVreg(vreg: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.vreg, vreg.toUpperCase()));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    console.log("storage.createVehicle - input:", vehicle);
    const vreg = vehicle.vreg.toUpperCase();

    return await db.transaction(async (tx) => {
      console.log("storage.createVehicle - transaction started for:", vreg);
      // Check if vehicle already exists
      const [existingVehicle] = await tx
        .select()
        .from(vehicles)
        .where(eq(vehicles.vreg, vreg));

      if (existingVehicle) {
        // If moving to a real company, reconcile ALL "TBC" washes for this vehicle
        if (vehicle.coId !== 999999) {
          await tx
            .update(washes)
            .set({ coId: vehicle.coId })
            .where(
              and(
                eq(washes.vreg, vreg),
                eq(washes.coId, 999999)
              )
            );
        }

        const [updatedVehicle] = await tx
          .update(vehicles)
          .set({
            coId: vehicle.coId,
            washFreq: vehicle.washFreq ?? existingVehicle.washFreq,
            lastWashDate: vehicle.lastWashDate ?? existingVehicle.lastWashDate,
            lastWashType: vehicle.lastWashType ?? existingVehicle.lastWashType,
          })
          .where(eq(vehicles.vreg, vreg))
          .returning();
        return updatedVehicle;
      }

      // If it doesn't exist, create it
      const [newVehicle] = await tx
        .insert(vehicles)
        .values({
          vreg,
          coId: vehicle.coId,
          washFreq: vehicle.washFreq ?? 0,
          lastWashDate: vehicle.lastWashDate ?? null,
          lastWashType: vehicle.lastWashType ?? null,
        })
        .returning();

      // Catch any orphaned "TBC" washes for this vehicle
      if (vehicle.coId !== 999999) {
        await tx
          .update(washes)
          .set({ coId: vehicle.coId })
          .where(
            and(
              eq(washes.vreg, vreg),
              eq(washes.coId, 999999)
            )
          );
      }

      return newVehicle;
    });
  }

  async updateVehicle(vreg: string, updates: Partial<Omit<InsertVehicle, 'vreg'>>): Promise<Vehicle> {
    const currentVehicle = await this.getVehicleByVreg(vreg);
    if (!currentVehicle) {
      throw new Error("Vehicle not found");
    }

    // If changing company, validate the target company exists
    if (updates.coId !== undefined) {
      const targetCompany = await this.getCompanyById(updates.coId);
      if (!targetCompany) {
        throw new Error("Target company not found");
      }
    }

    // Wrap cascade update and vehicle update in a transaction for consistency
    return await db.transaction(async (tx) => {
      // If changing company, cascade update only to "TBC" (999999) wash records
      if (updates.coId !== undefined && updates.coId !== 999999) {
        await tx
          .update(washes)
          .set({ coId: updates.coId })
          .where(
            and(
              eq(washes.vreg, vreg.toUpperCase()),
              eq(washes.coId, 999999)
            )
          );
      }

      const [vehicle] = await tx
        .update(vehicles)
        .set(updates)
        .where(eq(vehicles.vreg, vreg.toUpperCase()))
        .returning();
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }
      return vehicle;
    });
  }

  async deleteVehicle(vreg: string): Promise<void> {
    const vehicle = await this.getVehicleByVreg(vreg);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    await db.delete(vehicles).where(eq(vehicles.vreg, vreg.toUpperCase()));
  }

  async getWashes(): Promise<Wash[]> {
    const results = await db.select().from(washes);
    return results.sort((a, b) => b.washId - a.washId);
  }

  async getWashesByCompany(coId: number): Promise<Wash[]> {
    const results = await db.select().from(washes).where(eq(washes.coId, coId));
    return results.sort((a, b) => b.washId - a.washId);
  }

  async createWash(insertWash: InsertWash): Promise<Wash> {
    return await db.transaction(async (tx) => {
      // Get the vehicle to retrieve its wash frequency
      const [vehicle] = await tx
        .select()
        .from(vehicles)
        .where(eq(vehicles.vreg, insertWash.vreg.toUpperCase()));

      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      // Create the wash record
      const [wash] = await tx.insert(washes).values(insertWash).returning();

      // Calculate next wash due date: current date + wash frequency
      const nextWashDue = new Date(wash.washDate);
      nextWashDue.setDate(nextWashDue.getDate() + vehicle.washFreq);
      const nextWashDueStr = nextWashDue.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      // Update the vehicle's last wash date and type
      await tx
        .update(vehicles)
        .set({
          lastWashDate: nextWashDueStr,
          lastWashType: wash.washType,
        })
        .where(eq(vehicles.vreg, insertWash.vreg.toUpperCase()));

      return wash;
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      role: (user.role as UserRole) || "washOperative"
    }).returning();
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = userData.id ? await this.getUser(userData.id) : undefined;

    const userToInsert: UpsertUser = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email ?? existingUser?.email ?? null,
      firstName: userData.firstName ?? existingUser?.firstName ?? null,
      lastName: userData.lastName ?? existingUser?.lastName ?? null,
      password: userData.password || existingUser?.password || "",
      profileImageUrl: userData.profileImageUrl ?? existingUser?.profileImageUrl ?? null,
      role: userData.role ?? existingUser?.role ?? "washOperative",
      createdAt: existingUser?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    const [user] = await db
      .insert(users)
      .values(userToInsert)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userToInsert.email,
          firstName: userToInsert.firstName,
          lastName: userToInsert.lastName,
          profileImageUrl: userToInsert.profileImageUrl,
          role: userToInsert.role,
          updatedAt: userToInsert.updatedAt,
        },
      })
      .returning();

    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.lastName);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }
  async createWashList(washList: InsertWashList): Promise<WashList> {
    const [newWashList] = await db.insert(washLists).values(washList).returning();
    return newWashList;
  }

  async getWashLists(): Promise<WashList[]> {
    return await db.select().from(washLists).orderBy(washLists.id);
  }

  async getWashListById(id: number): Promise<WashList | undefined> {
    const [washList] = await db.select().from(washLists).where(eq(washLists.id, id));
    return washList;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(invoices.id);
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getPagePermissions(): Promise<PagePermission[]> {
    return await db.select().from(pagePermissions);
  }

  async getPagePermissionsByRole(role: string): Promise<PagePermission[]> {
    return await db.select().from(pagePermissions).where(eq(pagePermissions.role, role));
  }

  async updatePagePermission(role: string, pageRoute: string, isAllowed: number): Promise<PagePermission> {
    const [existing] = await db.select().from(pagePermissions).where(
      and(eq(pagePermissions.role, role), eq(pagePermissions.pageRoute, pageRoute))
    );

    if (existing) {
      const [updated] = await db.update(pagePermissions)
        .set({ isAllowed })
        .where(eq(pagePermissions.id, existing.id))
        .returning();
      return updated;
    }

    const [inserted] = await db.insert(pagePermissions).values({
      role,
      pageRoute,
      isAllowed
    }).returning();
    return inserted;
  }
}

export const storage = new DatabaseStorage();
