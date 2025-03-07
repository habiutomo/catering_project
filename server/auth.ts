import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { Merchant, Customer } from "@shared/schema";

const scryptAsync = promisify(scrypt);

declare global {
  namespace Express {
    interface User {
      id: number;
      type: "merchant" | "customer";
      username: string;
      companyName: string;
    }
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "development_secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    "merchant",
    new LocalStrategy(async (username, password, done) => {
      const merchant = await storage.getMerchantByUsername(username);
      if (!merchant || !(await comparePasswords(password, merchant.password))) {
        return done(null, false);
      }
      return done(null, {
        id: merchant.id,
        type: "merchant" as const,
        username: merchant.username,
        companyName: merchant.companyName,
      });
    }),
  );

  passport.use(
    "customer",
    new LocalStrategy(async (username, password, done) => {
      const customer = await storage.getCustomerByUsername(username);
      if (!customer || !(await comparePasswords(password, customer.password))) {
        return done(null, false);
      }
      return done(null, {
        id: customer.id,
        type: "customer" as const,
        username: customer.username,
        companyName: customer.companyName,
      });
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, `${user.type}:${user.id}`);
  });

  passport.deserializeUser(async (id: string, done) => {
    const [type, userId] = id.split(":");
    try {
      if (type === "merchant") {
        const merchant = await storage.getMerchant(parseInt(userId));
        if (!merchant) return done(null, false);
        return done(null, {
          id: merchant.id,
          type: "merchant" as const,
          username: merchant.username,
          companyName: merchant.companyName,
        });
      } else {
        const customer = await storage.getCustomer(parseInt(userId));
        if (!customer) return done(null, false);
        return done(null, {
          id: customer.id,
          type: "customer" as const,
          username: customer.username,
          companyName: customer.companyName,
        });
      }
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/merchant/register", async (req, res, next) => {
    try {
      const existingMerchant = await storage.getMerchantByUsername(req.body.username);
      if (existingMerchant) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const merchant = await storage.createMerchant({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(
        {
          id: merchant.id,
          type: "merchant" as const,
          username: merchant.username,
          companyName: merchant.companyName,
        },
        (err) => {
          if (err) return next(err);
          res.status(201).json(merchant);
        },
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/customer/register", async (req, res, next) => {
    try {
      const existingCustomer = await storage.getCustomerByUsername(req.body.username);
      if (existingCustomer) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const customer = await storage.createCustomer({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(
        {
          id: customer.id,
          type: "customer" as const,
          username: customer.username,
          companyName: customer.companyName,
        },
        (err) => {
          if (err) return next(err);
          res.status(201).json(customer);
        },
      );
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/auth/merchant/login",
    passport.authenticate("merchant"),
    (req, res) => {
      res.json(req.user);
    },
  );

  app.post(
    "/api/auth/customer/login",
    passport.authenticate("customer"),
    (req, res) => {
      res.json(req.user);
    },
  );

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
