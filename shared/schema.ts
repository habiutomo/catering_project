import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  phone: text("phone").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  deliveryDate: timestamp("delivery_date").notNull(),
  status: text("status").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
});

// Insert Schemas
export const insertMerchantSchema = createInsertSchema(merchants)
  .pick({
    username: true,
    password: true,
    companyName: true,
    address: true,
    description: true,
    phone: true,
  });

export const insertCustomerSchema = createInsertSchema(customers)
  .pick({
    username: true,
    password: true,
    companyName: true,
    address: true,
    phone: true,
  });

export const insertMenuItemSchema = createInsertSchema(menuItems)
  .pick({
    name: true,
    description: true,
    price: true,
    imageUrl: true,
  });

export const insertOrderSchema = createInsertSchema(orders)
  .pick({
    customerId: true,
    merchantId: true,
    deliveryDate: true,
    status: true,
    totalAmount: true,
  });

export const insertOrderItemSchema = createInsertSchema(orderItems)
  .pick({
    orderId: true,
    menuItemId: true,
    quantity: true,
    price: true,
  });

// Types
export type Merchant = typeof merchants.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
