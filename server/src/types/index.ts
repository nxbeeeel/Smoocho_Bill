// User and Authentication Types
export interface User {
  id: string;
  user_id?: string; // Alias for id for compatibility
  username: string;
  email: string;
  password_hash: string;
  pin_hash?: string; // For PIN-based authentication
  role: 'admin' | 'manager' | 'cashier' | 'staff';
  permissions: Permission[];
  profile: UserProfile;
  is_active: boolean;
  is_locked: boolean;
  is_system?: boolean; // System user flag
  failed_login_attempts: number;
  last_login?: Date;
  last_activity?: Date;
  password_changed_at: Date;
  pin_changed_at?: Date;
  session_timeout_minutes: number;
  must_change_password: boolean;
  locked_at?: Date;
  locked_by?: string;
  lock_reason?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  display_name?: string; // Display name for compatibility
  phone?: string;
  address?: string;
  avatar_url?: string;
  employee_id?: string;
  department?: string;
  shift_start?: string; // HH:MM format
  shift_end?: string; // HH:MM format
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Permission {
  id: string;
  name: string;
  resource: string; // e.g., 'products', 'orders', 'reports'
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'cancel' | 'export';
  conditions?: Record<string, any>; // Additional conditions
  description?: string;
  is_system?: boolean; // System permission flag
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  is_system?: boolean; // Alias for is_system_role
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  userId: string;
  username: string;
  role: string;
  permissions: Permission[];
  sessionId: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  username: string;
  password?: string;
  pin?: string;
  remember_me?: boolean;
  device_info?: {
    user_agent: string;
    ip_address: string;
    device_name?: string;
  };
}

export interface LoginResponse {
  success: boolean;
  user: Omit<User, 'password_hash' | 'pin_hash'>;
  token: string;
  refresh_token: string;
  expires_in: number;
  permissions: Permission[];
  session_id: string;
  must_change_password?: boolean;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash' | 'pin_hash'>;
  token: string;
  refresh_token: string;
  permissions: Permission[];
}

export interface SessionInfo {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string;
  user_agent: string;
  device_info?: any;
  is_active: boolean;
  last_activity: Date;
  expires_at: Date;
  created_at: Date;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource?: string;
  resource_id?: string;
  details?: any;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  session_id?: string;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_history_count: number;
  max_age_days: number;
  lockout_attempts: number;
  lockout_duration_minutes: number;
}

export interface PinPolicy {
  length: number;
  allow_sequential: boolean;
  allow_repeated: boolean;
  max_age_days: number;
  lockout_attempts: number;
}

// Promotion and Discount Types
export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping' | 'category_discount';
  value: number;
  min_order_amount?: number;
  minimum_order_amount?: number; // Alias for compatibility
  max_discount_amount?: number;
  maximum_discount_amount?: number; // Alias for compatibility
  applicable_products?: string[]; // Product IDs
  applicable_categories?: string[]; // Category IDs
  start_date: Date;
  end_date: Date;
  valid_from?: Date; // Alias for start_date
  valid_to?: Date; // Alias for end_date
  usage_limit?: number;
  usage_limit_per_customer?: number;
  used_count: number;
  is_active: boolean;
  is_stackable: boolean;
  customer_eligibility?: {
    new_customers_only?: boolean;
    min_previous_orders?: number;
    excluded_customers?: string[];
  };
  conditions?: {
    day_of_week?: number[]; // 0-6 (Sunday-Saturday)
    time_of_day?: {
      start: string; // HH:MM
      end: string; // HH:MM
    };
    payment_methods?: string[];
    order_types?: string[];
  };
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface PromotionUsage {
  id: string;
  promotion_id: string;
  order_id: string;
  customer_phone?: string;
  discount_amount: number;
  used_at: Date;
  applied_at?: Date; // Alias for used_at
  cashier_id: string;
}

export interface DiscountApplication {
  promotion_id: string;
  promotion_code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  discount_amount: number;
  applicable_items?: Array<{
    product_id: string;
    quantity: number;
    original_price: number;
    discounted_price: number;
  }>;
}

// Security Types
export interface SecurityEvent {
  id: string;
  event_type: 'login_success' | 'login_failure' | 'logout' | 'password_change' | 'account_locked' | 'permission_denied' | 'suspicious_activity';
  user_id?: string;
  username?: string;
  ip_address: string;
  user_agent: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: Date;
}

export interface AccessAttempt {
  id: string;
  username: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  timestamp: Date;
  geolocation?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

export interface SecurityConfiguration {
  id: string;
  setting_name: string;
  setting_value: any;
  description: string;
  updated_at: Date;
  updated_by: string;
}

// Admin Dashboard Types
export interface DashboardStats {
  total_users: number;
  active_sessions: number;
  failed_logins_today: number;
  locked_accounts: number;
  recent_activities: UserActivity[];
  security_events: SecurityEvent[];
  top_active_users: Array<{
    user_id: string;
    username: string;
    activity_count: number;
  }>;
}

export interface UserManagementFilter {
  role?: string;
  is_active?: boolean;
  is_locked?: boolean;
  last_login_from?: Date;
  last_login_to?: Date;
  created_from?: Date;
  created_to?: Date;
  search?: string;
}

export interface BulkUserAction {
  action: 'activate' | 'deactivate' | 'unlock' | 'delete' | 'reset_password' | 'assign_role';
  user_ids: string[];
  parameters?: any;
  performed_by: string;
  performed_at: Date;
}

// Audit Trail Types
export interface AuditLog {
  id: string;
  user_id?: string;
  username?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  session_id?: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module: string;
  details?: any;
  timestamp: Date;
  correlation_id?: string;
}

// Authentication Middleware Types
export interface AuthenticatedRequest extends Request {
  user: AuthPayload;
  session: SessionInfo;
}

export interface AuthMiddlewareOptions {
  required_permissions?: Permission[];
  required_role?: string;
  allow_expired?: boolean;
  check_session?: boolean;
}

// User Creation and Update Types
export interface CreateUserRequest {
  username: string;
  email: string;
  password?: string;
  pin?: string;
  role: string;
  profile: Omit<UserProfile, 'avatar_url'>;
  permissions?: Permission[];
  session_timeout_minutes?: number;
  must_change_password?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  role?: string;
  profile?: Partial<UserProfile>;
  permissions?: Permission[];
  is_active?: boolean;
  session_timeout_minutes?: number;
  must_change_password?: boolean;
}

export interface ChangePasswordRequest {
  current_password?: string;
  current_pin?: string;
  new_password?: string;
  new_pin?: string;
  force_change?: boolean;
}

// JWT Token Types
export interface JWTTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface RefreshTokenRequest {
  refresh_token: string;
  device_info?: {
    user_agent: string;
    ip_address: string;
  };
}

// Request Extensions
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      session?: SessionInfo;
    }
  }
}

// Product and Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  price: number;
  cost_price?: number;
  image_url?: string;
  sku?: string;
  barcode?: string;
  is_available: boolean;
  is_active: boolean;
  sort_order: number;
  recipe_items?: RecipeItem[];
  preparation_time?: number;
  created_at: Date;
  updated_at: Date;
}

export interface RecipeItem {
  inventory_id: string;
  quantity: number;
  unit: string;
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  order_type: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;
  subtotal: number;
  discount_amount: number;
  discount_type?: 'percentage' | 'fixed';
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  external_order_id?: string;
  external_platform?: 'zomato' | 'swiggy';
  order_date: Date;
  estimated_ready_time?: Date;
  completed_at?: Date;
  cashier_id: string;
  is_synced: boolean;
  order_items?: OrderItem[]; // Order items for compatibility
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  item_total: number;
  special_instructions?: string;
  created_at: Date;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: 'cash' | 'card' | 'upi' | 'zomato' | 'swiggy';
  amount: number;
  transaction_id?: string;
  paytm_transaction_id?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: Date;
  is_synced: boolean;
  created_at: Date;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit?: number;
  supplier_name?: string;
  supplier_contact?: string;
  expiry_date?: Date;
  last_restocked?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StockTransaction {
  id: string;
  inventory_item_id: string;
  transaction_type: TransactionType;
  quantity: number;
  cost_per_unit?: number;
  total_cost?: number;
  reference_type?: ReferenceType;
  reference_id?: string;
  notes?: string;
  user_id: string;
  created_at: Date;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type ReferenceType = 'ORDER' | 'RESTOCK' | 'MANUAL' | 'WASTAGE';

// Report Types
export interface DailySalesReport {
  date: string;
  total_sales: number;
  total_orders: number;
  cash_sales: number;
  card_sales: number;
  upi_sales: number;
  online_sales: number;
  average_order_value: number;
  top_selling_items: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  payment_method_breakdown: {
    cash: { count: number; amount: number };
    card: { count: number; amount: number };
    upi: { count: number; amount: number };
    online: { count: number; amount: number };
  };
  hourly_sales: Array<{
    hour: number;
    sales: number;
    orders: number;
  }>;
}

export interface MonthlySalesReport {
  month: string;
  year: number;
  total_sales: number;
  total_orders: number;
  total_profit: number;
  daily_breakdown: Array<{
    date: string;
    sales: number;
    orders: number;
    profit: number;
  }>;
  top_selling_items: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
    profit: number;
  }>;
  payment_trends: {
    cash_percentage: number;
    card_percentage: number;
    upi_percentage: number;
    online_percentage: number;
  };
  stock_usage: Array<{
    inventory_item_id: string;
    item_name: string;
    total_used: number;
    cost: number;
  }>;
}

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  payment_method?: 'cash' | 'card' | 'upi' | 'online' | 'all';
  order_type?: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy' | 'all';
  cashier_id?: string;
}

export interface ReportSummary {
  id: string;
  report_type: 'daily' | 'monthly';
  period: string;
  generated_at: Date;
  data: DailySalesReport | MonthlySalesReport;
  is_synced: boolean;
}

// Sync Types
export interface SyncOperation {
  id: string;
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  error_message?: string;
  created_at: Date;
  processed_at?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Types
export interface BaseFilter {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProductFilter extends BaseFilter {
  category_id?: string;
  is_available?: boolean;
}

export interface OrderFilter extends BaseFilter {
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  order_type?: Order['order_type'];
  date_from?: string;
  date_to?: string;
}

// Error Types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Socket.IO Types
export interface SocketEventData {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

// External Integration Types
export interface ZomatoWebhook {
  order_id: string;
  restaurant_id: string;
  order_status: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
  delivery_time: string;
}

export interface SwiggyWebhook {
  order_id: string;
  partner_order_id: string;
  order_state: string;
  customer_details: {
    name: string;
    phone_number: string;
  };
  order_items: Array<{
    name: string;
    quantity: number;
    total_individual_price: number;
  }>;
  order_total: number;
  expected_delivery_time: string;
}

// Settings Types
export interface Setting {
  key: string;
  value: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updated_at: Date;
}

// Error Types - AppError is already defined as a class above

// Integration Types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'payment' | 'order_platform' | 'delivery';
  is_enabled: boolean;
  settings: Record<string, any>;
  api_credentials?: {
    api_key?: string;
    secret_key?: string;
    merchant_id?: string;
    partner_id?: string;
    auth_token?: string;
    webhook_url?: string;
  };
  last_sync?: Date;
  sync_frequency?: number; // in minutes
  error_count?: number;
  last_error?: string;
  created_at: Date;
  updated_at: Date;
}

// Zomato Integration Types
export interface ZomatoOrder {
  order_id: string;
  restaurant_id: string;
  order_status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    item_id: string;
    name: string;
    price: number;
    quantity: number;
    instructions?: string;
  }>;
  order_value: {
    subtotal: number;
    taxes: number;
    delivery_charge: number;
    total: number;
  };
  delivery_details?: {
    estimated_time: string;
    delivery_boy?: {
      name: string;
      phone: string;
    };
  };
  payment_method: 'prepaid' | 'cod';
  order_time: string;
  preparation_time?: number;
}

// Swiggy Integration Types
export interface SwiggyOrder {
  order_id: string;
  restaurant_id: string;
  order_state: 'ORDER_PLACED' | 'ORDER_ACCEPTED' | 'FOOD_PREP_STARTED' | 'FOOD_READY' | 'ORDER_DISPATCHED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED';
  customer_details: {
    customer_name: string;
    customer_phone: string;
    delivery_address?: {
      complete_address: string;
      lat: number;
    longitude: number;
    };
  };
  order_items: Array<{
    item_id: string;
    item_name: string;
    item_price: number;
    quantity: number;
    item_total: number;
    addons?: Array<{
      addon_name: string;
      addon_price: number;
    }>;
    special_instructions?: string;
  }>;
  order_total: {
    item_total: number;
    delivery_charges: number;
    packing_charges: number;
    total_taxes: number;
    grand_total: number;
  };
  payment_mode: 'PREPAID' | 'COD';
  placed_time: string;
  estimated_delivery_time?: string;
  delivery_partner?: {
    partner_name: string;
    partner_contact: string;
    tracking_url?: string;
  };
}

// Paytm Integration Types
export interface PaytmConfig {
  merchant_id: string;
  merchant_key: string;
  environment: 'staging' | 'production';
  callback_url: string;
  website: string;
}

export interface PaytmPaymentRequest {
  order_id: string;
  amount: number;
  customer_id?: string;
  mobile_number?: string;
  email?: string;
  transaction_type: 'SALE' | 'REFUND';
  payment_mode?: 'CARD' | 'UPI' | 'WALLET';
}

export interface PaytmPaymentResponse {
  txn_id: string;
  order_id: string;
  amount: number;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  response_code: string;
  response_message: string;
  txn_date: string;
  gateway_name?: string;
  bank_name?: string;
  payment_mode?: string;
  checksum?: string;
}

// Order Integration Mapping
export interface ExternalOrderMapping {
  id: string;
  external_order_id: string;
  platform: 'zomato' | 'swiggy';
  local_order_id: string;
  sync_status: 'pending' | 'synced' | 'failed';
  sync_attempts: number;
  last_sync_attempt?: Date;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

// Integration Sync Log
export interface IntegrationSyncLog {
  id: string;
  integration_id: string;
  sync_type: 'orders' | 'payments' | 'status_update';
  status: 'success' | 'error' | 'partial';
  records_processed: number;
  records_failed: number;
  start_time: Date;
  end_time?: Date;
  error_details?: string;
  metadata?: Record<string, any>;
}

// Payment Integration Types
export interface PaymentIntegrationRequest {
  integration_type: 'paytm';
  amount: number;
  order_id: string;
  payment_method: 'card' | 'upi' | 'wallet';
  customer_details?: {
    mobile?: string;
    email?: string;
  };
}

export interface PaymentIntegrationResponse {
  success: boolean;
  transaction_id?: string;
  status: 'success' | 'failed' | 'pending';
  amount?: number;
  payment_method?: string;
  error_message?: string;
  gateway_response?: any;
}

// Integration Webhook Types
export interface IntegrationWebhook {
  id: string;
  integration_id: string;
  platform: 'zomato' | 'swiggy' | 'paytm';
  event_type: string;
  payload: Record<string, any>;
  processed: boolean;
  processing_attempts: number;
  created_at: Date;
  processed_at?: Date;
}

// Offline/Online Sync Types
export interface SyncRecord {
  id: string;
  table_name: string;
  record_id: string;
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: Date;
  sync_status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';
  retry_count: number;
  last_attempt?: Date;
  error_message?: string;
  device_id: string;
  user_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SyncBatch {
  id: string;
  records: SyncRecord[];
  batch_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  success_count: number;
  failure_count: number;
  conflict_count: number;
}

export interface SyncConflict {
  id: string;
  sync_record_id: string;
  table_name: string;
  record_id: string;
  local_data: any;
  remote_data: any;
  conflict_type: 'version' | 'concurrent_edit' | 'delete_modified' | 'create_duplicate';
  resolution_strategy: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  resolved: boolean;
  resolved_data?: any;
  resolved_at?: Date;
  resolved_by?: string;
  created_at: Date;
}

export interface SyncLog {
  id: string;
  sync_session_id: string;
  log_level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
  timestamp: Date;
  context?: {
    table_name?: string;
    record_id?: string;
    operation?: string;
    user_id?: string;
  };
}

export interface SyncSession {
  id: string;
  session_type: 'full' | 'incremental' | 'conflict_resolution';
  trigger: 'manual' | 'scheduled' | 'connection_restored' | 'conflict_detected';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  conflict_records: number;
  started_at: Date;
  completed_at?: Date;
  duration_ms?: number;
  network_quality?: 'excellent' | 'good' | 'fair' | 'poor';
  data_usage_bytes?: number;
  device_id: string;
  user_id?: string;
}

export interface SyncConfiguration {
  id: string;
  table_name: string;
  sync_enabled: boolean;
  sync_direction: 'upload' | 'download' | 'bidirectional';
  conflict_resolution: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  sync_frequency_minutes: number;
  batch_size: number;
  priority: number;
  last_sync?: Date;
  auto_sync: boolean;
  sync_conditions?: {
    wifi_only?: boolean;
    battery_threshold?: number;
    storage_threshold?: number;
  };
}

export interface OfflineOperation {
  id: string;
  operation_type: 'billing' | 'inventory_update' | 'payment' | 'report_generation';
  entity_type: 'order' | 'payment' | 'inventory' | 'product' | 'category';
  entity_id: string;
  operation_data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  dependencies?: string[]; // IDs of other operations this depends on
  executed_at?: Date;
  error_message?: string;
  rollback_data?: any;
}

export interface NetworkStatus {
  is_online: boolean;
  connection_type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  connection_quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  latency_ms?: number;
  bandwidth_mbps?: number;
  last_check: Date;
  consecutive_failures: number;
  uptime_percentage: number;
}

export interface SyncMetrics {
  total_records_synced: number;
  successful_syncs: number;
  failed_syncs: number;
  conflicts_resolved: number;
  average_sync_time_ms: number;
  data_transferred_bytes: number;
  last_full_sync?: Date;
  sync_efficiency: number; // percentage
  bandwidth_utilization: number;
  error_rate: number;
}

export interface CloudSyncConfig {
  provider: 'firebase' | 'supabase';
  enabled: boolean;
  project_id: string;
  api_key: string;
  auth_domain?: string;
  database_url?: string;
  storage_bucket?: string;
  messaging_sender_id?: string;
  app_id?: string;
  measurement_id?: string;
  encryption_enabled: boolean;
  compression_enabled: boolean;
  sync_timeout_ms: number;
  max_retry_attempts: number;
  retry_delay_ms: number;
}

export interface OfflineStorageInfo {
  storage_type: 'indexeddb' | 'sqlite' | 'localstorage';
  database_name: string;
  database_version: number;
  total_size_bytes: number;
  used_size_bytes: number;
  available_size_bytes: number;
  table_sizes: Record<string, number>;
  last_cleanup?: Date;
  auto_cleanup_enabled: boolean;
  retention_days: number;
}

export interface SyncHealth {
  overall_status: 'healthy' | 'warning' | 'critical' | 'offline';
  last_successful_sync?: Date;
  pending_operations: number;
  failed_operations: number;
  conflicts_pending: number;
  storage_usage_percentage: number;
  network_quality: NetworkStatus['connection_quality'];
  battery_level?: number;
  issues: Array<{
    type: 'connectivity' | 'storage' | 'conflicts' | 'performance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggested_action?: string;
  }>;
  recommendations: string[];
}

// Merge Strategy Types
export interface MergeRule {
  table_name: string;
  field_name: string;
  strategy: 'local_wins' | 'remote_wins' | 'newest_wins' | 'manual' | 'custom';
  custom_resolver?: string; // function name for custom resolution
  priority: number;
}

export interface MergeResult {
  success: boolean;
  merged_data: any;
  conflicts_found: number;
  conflicts_resolved: number;
  manual_resolution_required: boolean;
  merge_strategy_used: string;
  field_resolutions: Array<{
    field_name: string;
    local_value: any;
    remote_value: any;
    resolved_value: any;
    strategy_used: string;
  }>;
}

// Sync Event Types
export interface SyncEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'conflict_detected' | 'connection_changed' | 'batch_processed';
  timestamp: Date;
  session_id?: string;
  data?: any;
  error?: string;
}

export interface SyncProgress {
  session_id: string;
  stage: 'initializing' | 'uploading' | 'downloading' | 'resolving_conflicts' | 'finalizing';
  progress_percentage: number;
  current_operation: string;
  records_processed: number;
  total_records: number;
  estimated_time_remaining_ms?: number;
  current_speed_records_per_second?: number;
}

// Queue Management Types
export interface SyncQueue {
  id: string;
  name: string;
  priority: number;
  max_size: number;
  current_size: number;
  processing: boolean;
  paused: boolean;
  created_at: Date;
  last_processed?: Date;
}

export interface QueueItem {
  id: string;
  queue_id: string;
  payload: any;
  priority: number;
  attempts: number;
  max_attempts: number;
  scheduled_for?: Date;
  created_at: Date;
  processing_started_at?: Date;
  completed_at?: Date;
  error_message?: string;
}

// Device and Environment Types
export interface DeviceInfo {
  device_id: string;
  device_name: string;
  platform: 'web' | 'mobile' | 'desktop';
  os: string;
  browser?: string;
  app_version: string;
  last_seen: Date;
  sync_capabilities: {
    supports_background_sync: boolean;
    supports_service_worker: boolean;
    max_storage_mb: number;
    preferred_batch_size: number;
  };
}

export interface SyncEnvironment {
  environment: 'development' | 'staging' | 'production';
  debug_mode: boolean;
  performance_monitoring: boolean;
  detailed_logging: boolean;
  sync_analytics: boolean;
  backup_enabled: boolean;
  encryption_required: boolean;
}

// Alert System Types
export interface AlertConfiguration {
  id: string;
  alert_type: 'low_stock' | 'critical_stock' | 'expired_items' | 'daily_summary' | 'custom';
  is_enabled: boolean;
  threshold_value?: number;
  threshold_type?: 'quantity' | 'percentage' | 'days';
  notification_channels: ('whatsapp' | 'email' | 'sms')[];
  recipients: AlertRecipient[];
  schedule?: {
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM format
    days?: number[]; // 0-6 for weekly, 1-31 for monthly
  };
  message_template_id?: string;
  cooldown_minutes?: number; // Minimum time between same alerts
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface AlertRecipient {
  id: string;
  name: string;
  type: 'admin' | 'manager' | 'staff' | 'external';
  contact_methods: {
    whatsapp?: string;
    email?: string;
    sms?: string;
  };
  alert_types: string[]; // Which alert types this recipient should receive
  is_active: boolean;
  created_at: Date;
}

export interface AlertInstance {
  id: string;
  configuration_id: string;
  alert_type: AlertConfiguration['alert_type'];
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: any; // Context data (inventory items, order info, etc.)
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';
  recipients: string[]; // Recipient IDs
  delivery_attempts: AlertDeliveryAttempt[];
  scheduled_for?: Date;
  created_at: Date;
  sent_at?: Date;
  resolved_at?: Date;
  resolved_by?: string;
}

export interface AlertDeliveryAttempt {
  id: string;
  alert_id: string;
  recipient_id: string;
  channel: 'whatsapp' | 'email' | 'sms';
  status: 'pending' | 'sending' | 'delivered' | 'failed' | 'bounced';
  provider_response?: any;
  error_message?: string;
  attempt_number: number;
  attempted_at: Date;
  delivered_at?: Date;
  delivery_confirmation?: {
    read_at?: Date;
    clicked_at?: Date;
    response?: string;
  };
}

export interface AlertTemplate {
  id: string;
  name: string;
  alert_type: AlertConfiguration['alert_type'];
  channel: 'whatsapp' | 'email' | 'sms';
  subject_template?: string; // For emails
  message_template: string;
  variables: string[]; // Available template variables
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AlertHistory {
  id: string;
  alert_id: string;
  action: 'created' | 'sent' | 'delivered' | 'failed' | 'resolved' | 'cancelled';
  details: string;
  metadata?: any;
  user_id?: string;
  timestamp: Date;
}

export interface AlertStatistics {
  total_alerts: number;
  alerts_by_type: Record<string, number>;
  alerts_by_status: Record<string, number>;
  delivery_success_rate: number;
  average_delivery_time_minutes: number;
  failed_deliveries: number;
  recent_alerts: AlertInstance[];
  top_failing_recipients: Array<{
    recipient_id: string;
    failure_count: number;
  }>;
}

// WhatsApp Business API Types
export interface WhatsAppConfig {
  business_account_id: string;
  access_token: string;
  phone_number_id: string;
  webhook_verify_token: string;
  webhook_secret?: string;
  api_version: string;
  is_enabled: boolean;
}

export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  image?: {
    link?: string;
    caption?: string;
  };
  document?: {
    link?: string;
    filename?: string;
    caption?: string;
  };
}

export interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

// SMTP Email Types
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from_email: string;
  from_name: string;
  is_enabled: boolean;
}

export interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

// Alert Queue Types
export interface AlertQueue {
  id: string;
  name: string;
  priority: number;
  max_size: number;
  current_size: number;
  processing: boolean;
  paused: boolean;
  retry_config: {
    max_attempts: number;
    retry_delays: number[]; // In milliseconds
  };
  created_at: Date;
  last_processed?: Date;
}

export interface AlertQueueItem {
  id: string;
  queue_id: string;
  alert_id: string;
  recipient_id: string;
  channel: 'whatsapp' | 'email' | 'sms';
  priority: number;
  attempts: number;
  max_attempts: number;
  scheduled_for?: Date;
  payload: {
    message: string;
    subject?: string;
    template_data?: any;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: Date;
  processing_started_at?: Date;
  completed_at?: Date;
}

// Background Job Types
export interface BackgroundJob {
  id: string;
  job_type: 'stock_check' | 'daily_summary' | 'cleanup' | 'alert_retry';
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
    cron_expression?: string;
    next_run: Date;
  };
  is_enabled: boolean;
  config: any;
  last_run?: Date;
  last_status?: 'success' | 'failed' | 'running';
  last_error?: string;
  run_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface JobExecution {
  id: string;
  job_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: Date;
  completed_at?: Date;
  duration_ms?: number;
  result?: any;
  error_message?: string;
  logs: string[];
}

// Inventory Alert Types
export interface InventoryAlert {
  id: string;
  inventory_item_id: string;
  alert_type: 'low_stock' | 'critical_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  threshold_value: number;
  current_value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'suppressed';
  first_detected: Date;
  last_checked: Date;
  resolved_at?: Date;
  suppressed_until?: Date;
  notification_sent: boolean;
  notification_count: number;
  last_notification_sent?: Date;
}

// Alert Metrics Types
export interface AlertMetrics {
  period_start: Date;
  period_end: Date;
  total_alerts_generated: number;
  alerts_by_type: Record<string, number>;
  alerts_by_severity: Record<string, number>;
  notification_success_rate: number;
  whatsapp_delivery_rate: number;
  email_delivery_rate: number;
  sms_delivery_rate: number;
  average_response_time_minutes: number;
  top_alert_triggers: Array<{
    inventory_item_id: string;
    item_name: string;
    alert_count: number;
  }>;
  recipient_engagement: Array<{
    recipient_id: string;
    alerts_received: number;
    response_rate: number;
  }>;
}

// Request Extensions
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}