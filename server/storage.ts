import { 
  merchants, customers, menuItems, orders, orderItems,
  type Merchant, type Customer, type MenuItem, type Order, type OrderItem,
  type InsertMerchant, type InsertCustomer, type InsertMenuItem, type InsertOrder, type InsertOrderItem 
} from "@shared/schema";
import { eq } from "drizzle-orm";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth
  getMerchant(id: number): Promise<Merchant | undefined>;
  getMerchantByUsername(username: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByUsername(username: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Menu Items
  getMenuItems(merchantId: number): Promise<MenuItem[]>;
  createMenuItem(merchantId: number, item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  // Orders
  getOrders(merchantId?: number, customerId?: number): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private merchants: Map<number, Merchant>;
  private customers: Map<number, Customer>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.merchants = new Map();
    this.customers = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getMerchant(id: number): Promise<Merchant | undefined> {
    return this.merchants.get(id);
  }

  async getMerchantByUsername(username: string): Promise<Merchant | undefined> {
    return Array.from(this.merchants.values()).find(
      (merchant) => merchant.username === username
    );
  }

  async createMerchant(merchant: InsertMerchant): Promise<Merchant> {
    const id = this.currentId++;
    const newMerchant = { ...merchant, id };
    this.merchants.set(id, newMerchant);
    return newMerchant;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByUsername(username: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.username === username
    );
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const newCustomer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async getMenuItems(merchantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.merchantId === merchantId
    );
  }

  async createMenuItem(merchantId: number, item: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentId++;
    const newItem = { ...item, id, merchantId };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const existingItem = this.menuItems.get(id);
    if (!existingItem) throw new Error("Menu item not found");
    
    const updatedItem = { ...existingItem, ...item };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    this.menuItems.delete(id);
  }

  async getOrders(merchantId?: number, customerId?: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((order) => {
      if (merchantId && order.merchantId !== merchantId) return false;
      if (customerId && order.customerId !== customerId) return false;
      return true;
    });
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderId = this.currentId++;
    const newOrder = { ...order, id: orderId, orderDate: new Date() };
    this.orders.set(orderId, newOrder);

    items.forEach((item) => {
      const itemId = this.currentId++;
      this.orderItems.set(itemId, { ...item, id: itemId, orderId });
    });

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();