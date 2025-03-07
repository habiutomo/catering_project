import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireMerchant(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated() || req.user.type !== "merchant") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

function requireCustomer(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated() || req.user.type !== "customer") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Menu Items
  app.get("/api/merchants/:merchantId/menu", async (req, res) => {
    const items = await storage.getMenuItems(parseInt(req.params.merchantId));
    res.json(items);
  });

  app.post(
    "/api/menu-items",
    requireMerchant,
    upload.single("image"),
    async (req, res) => {
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
      const item = await storage.createMenuItem(req.user.id, {
        ...req.body,
        imageUrl,
      });
      res.status(201).json(item);
    },
  );

  app.patch(
    "/api/menu-items/:id",
    requireMerchant,
    upload.single("image"),
    async (req, res) => {
      const update = { ...req.body };
      if (req.file) {
        update.imageUrl = `/uploads/${req.file.filename}`;
      }
      const item = await storage.updateMenuItem(parseInt(req.params.id), update);
      res.json(item);
    },
  );

  app.delete("/api/menu-items/:id", requireMerchant, async (req, res) => {
    await storage.deleteMenuItem(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Orders
  app.get("/api/orders", requireAuth, async (req, res) => {
    const orders = await storage.getOrders(
      req.user.type === "merchant" ? req.user.id : undefined,
      req.user.type === "customer" ? req.user.id : undefined,
    );
    res.json(orders);
  });

  app.post("/api/orders", requireCustomer, async (req, res) => {
    const order = await storage.createOrder(req.body.order, req.body.items);
    res.status(201).json(order);
  });

  app.patch("/api/orders/:id/status", requireMerchant, async (req, res) => {
    const order = await storage.updateOrderStatus(
      parseInt(req.params.id),
      req.body.status,
    );
    res.json(order);
  });

  const httpServer = createServer(app);
  return httpServer;
}
