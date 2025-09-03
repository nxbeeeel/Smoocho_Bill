// Core Types for Smoocho POS System

// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Product and Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  category?: Category;
  price: number;
  cost_price?: number;
  image_url?: string;
  sku?: string;
  barcode?: string;
  is_available: boolean;
  is_active: boolean;
  sort_order: number;
  preparation_time?: number;
  recipe_items?: RecipeIngredient[];
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  product_id: string;
  inventory_item_id: string;
  inventory_item?: InventoryItem;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
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
  expiry_date?: string;
  last_restocked?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  low_stock_warning?: boolean;
}

export interface StockTransaction {
  id: string;
  inventory_item_id: string;
  inventory_item?: InventoryItem;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTAGE';
  quantity: number;
  cost_per_unit?: number;
  total_cost?: number;
  reference_type?:
    | 'ORDER'
    | 'RESTOCK'
    | 'MANUAL'
    | 'WASTAGE'
    | 'RECIPE_DEDUCTION';
  reference_id?: string;
  notes?: string;
  user_id: string;
  user?: User;
  created_at: string;
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
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  external_order_id?: string;
  external_platform?: 'zomato' | 'swiggy';
  order_date: string;
  estimated_ready_time?: string;
  completed_at?: string;
  cashier_id: string;
  cashier?: User;
  order_items: OrderItem[];
  payments: Payment[];
  is_synced: boolean;
  can_edit: boolean;
  edit_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  product_name: string;
  product_price: number;
  quantity: number;
  item_total: number;
  special_instructions?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: 'cash' | 'card' | 'upi' | 'zomato' | 'swiggy';
  amount: number;
  transaction_id?: string;
  paytm_transaction_id?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
  is_synced: boolean;
  created_at: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  special_instructions?: string;
  item_total: number;
  stock_warning?: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  discount_type?: 'percentage' | 'fixed';
  tax_amount: number;
  total_amount: number;
  order_type: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy';
  table_number?: string;
  customer_info?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

// Business Configuration
export interface BusinessConfig {
  name: string;
  address: string;
  phone: string;
  gst_number?: string;
  tax_rate: number;
  currency: {
    code: string;
    symbol: string;
    decimals: number;
  };
  order_number_prefix: string;
  receipt_footer: string;
  low_stock_threshold: number;
  auto_deduct_stock: boolean;
  app?: {
    name: string;
    version: string;
  };
}

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

// Integration Types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'payment' | 'order_platform' | 'delivery';
  is_enabled: boolean;
  is_active: boolean;
  is_configured: boolean;
  settings: Record<string, any>;
  api_credentials?: {
    api_key?: string;
    secret_key?: string;
    merchant_id?: string;
    partner_id?: string;
    auth_token?: string;
    webhook_url?: string;
  };
  last_sync?: string;
  sync_frequency?: number;
  error_count?: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationStats {
  total_orders_synced: number;
  last_sync_time: string;
  active_integrations: number;
}

export interface PaymentStats {
  total_transactions: number;
  success_rate: number;
  total_amount: number;
}

export interface IntegrationsState {
  zomato: IntegrationConfig;
  swiggy: IntegrationConfig;
  paytm: IntegrationConfig;
  stats: IntegrationStats;
  payment_stats: PaymentStats;
}

// External Order Types
export interface ZomatoOrder {
  order_id: string;
  restaurant_id: string;
  order_status:
    | 'placed'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'dispatched'
    | 'delivered'
    | 'cancelled';
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

export interface SwiggyOrder {
  order_id: string;
  restaurant_id: string;
  order_state:
    | 'ORDER_PLACED'
    | 'ORDER_ACCEPTED'
    | 'FOOD_PREP_STARTED'
    | 'FOOD_READY'
    | 'ORDER_DISPATCHED'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED';
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

// Offline State Types
export interface OfflineState {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingOperations: number;
  syncInProgress: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and Search Types
export interface ProductFilter {
  category_id?: string;
  is_available?: boolean;
  search?: string;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface OrderFilter {
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  order_type?: Order['order_type'];
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Print Types
export interface PrintJob {
  type: 'receipt' | 'report' | 'label';
  data: any;
  options?: {
    copies?: number;
    paper_size?: string;
  };
}

export interface PrinterConfig {
  name: string;
  type: 'thermal' | 'regular';
  connection: 'usb' | 'bluetooth' | 'network';
  settings: {
    width: number;
    characters_per_line: number;
    paper_size: string;
  };
}

// Store Types
export interface RootState {
  auth: AuthState;
  cart: Cart;
  offline: OfflineState;
  notifications: Notification[];
}

// Component Props Types
export interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableProps<T = any> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// Alert System Types
export interface AlertConfiguration {
  id: string;
  alert_type:
    | 'low_stock'
    | 'critical_stock'
    | 'expired_items'
    | 'daily_summary'
    | 'custom';
  is_enabled: boolean;
  threshold_value?: number;
  threshold_type?: 'quantity' | 'percentage' | 'days';
  notification_channels: ('whatsapp' | 'email' | 'sms')[];
  recipients: AlertRecipient[];
  schedule?: {
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    days?: number[];
  };
  message_template_id?: string;
  cooldown_minutes?: number;
  created_at: string;
  updated_at: string;
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
  alert_types: string[];
  is_active: boolean;
  created_at: string;
}

export interface AlertInstance {
  id: string;
  configuration_id: string;
  alert_type: AlertConfiguration['alert_type'];
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: any;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';
  recipients: string[];
  delivery_attempts: AlertDeliveryAttempt[];
  scheduled_for?: string;
  created_at: string;
  sent_at?: string;
  resolved_at?: string;
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
  attempted_at: string;
  delivered_at?: string;
  delivery_confirmation?: {
    read_at?: string;
    clicked_at?: string;
    response?: string;
  };
}

export interface AlertTemplate {
  id: string;
  name: string;
  alert_type: AlertConfiguration['alert_type'];
  channel: 'whatsapp' | 'email' | 'sms';
  subject_template?: string;
  message_template: string;
  variables: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertHistory {
  id: string;
  alert_id: string;
  action:
    | 'created'
    | 'sent'
    | 'delivered'
    | 'failed'
    | 'resolved'
    | 'cancelled';
  details: string;
  metadata?: any;
  user_id?: string;
  timestamp: string;
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
    content?: string;
    path?: string;
    contentType?: string;
  }>;
}

// Inventory Alert Types
export interface InventoryAlert {
  id: string;
  inventory_item_id: string;
  alert_type:
    | 'low_stock'
    | 'critical_stock'
    | 'out_of_stock'
    | 'expiring_soon'
    | 'expired';
  threshold_value: number;
  current_value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'suppressed';
  first_detected: string;
  last_checked: string;
  resolved_at?: string;
  suppressed_until?: string;
  notification_sent: boolean;
  notification_count: number;
  last_notification_sent?: string;
}

// Background Job Types
export interface BackgroundJob {
  id: string;
  job_type: 'stock_check' | 'daily_summary' | 'cleanup' | 'alert_retry';
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
    cron_expression?: string;
    next_run: string;
  };
  is_enabled: boolean;
  config: any;
  last_run?: string;
  last_status?: 'success' | 'failed' | 'running';
  last_error?: string;
  run_count: number;
  created_at: string;
  updated_at: string;
}

export interface JobExecution {
  id: string;
  job_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  result?: any;
  error_message?: string;
  logs: string[];
}

// Alert Metrics Types
export interface AlertMetrics {
  period_start: string;
  period_end: string;
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

// Alert State Management
export interface AlertState {
  configurations: AlertConfiguration[];
  recipients: AlertRecipient[];
  templates: AlertTemplate[];
  active_alerts: AlertInstance[];
  alert_history: AlertHistory[];
  statistics: AlertStatistics | null;
  whatsapp_config: WhatsAppConfig | null;
  smtp_config: SMTPConfig | null;
  loading: {
    configurations: boolean;
    sending: boolean;
    testing: boolean;
  };
  error: string | null;
}

// Sync and Offline Types
export interface CloudSyncConfig {
  provider: 'firebase' | 'supabase';
  project_id: string;
  api_key: string;
  auth_domain?: string;
  database_url?: string;
  storage_bucket?: string;
  messaging_sender_id?: string;
  app_id: string;
  measurement_id?: string;
  enabled: boolean;
}

export interface SyncRecord {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  operation_type:
    | 'order'
    | 'payment'
    | 'inventory_update'
    | 'stock_transaction';
  data: any;
  timestamp: string;
  is_synced: boolean;
  sync_attempts: number;
  last_sync_attempt?: string;
  last_attempt?: string;
  error_message?: string;
  sync_status?: 'pending' | 'syncing' | 'completed' | 'failed';
  priority?: number;
}

export interface SyncBatch {
  id: string;
  batch_number: number;
  records: SyncRecord[];
  created_at: string;
  synced_at?: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error_message?: string;
}

export interface SyncSession {
  id: string;
  started_at: string;
  ended_at?: string;
  completed_at?: string;
  status: 'active' | 'completed' | 'failed' | 'running';
  session_type: string;
  trigger: string;
  device_id: string;
  total_records: number;
  records_processed: number;
  records_synced: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  conflict_records: number;
  errors: string[];
  duration_ms?: number;
}

export interface SyncMetrics {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  average_sync_duration: number;
  last_sync_duration?: number;
  records_synced_today: number;
  sync_errors_today: number;
  total_records_synced: number;
  error_rate: number;
  sync_efficiency: number;
  conflicts_resolved: number;
  average_sync_time_ms: number;
  data_transferred_bytes: number;
  bandwidth_utilization: number;
}

export interface NetworkStatus {
  is_online: boolean;
  connection_type?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  connection_quality?: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  strength?: number;
  latency_ms?: number;
  bandwidth_mbps?: number;
  uptime_percentage?: number;
  last_check: string;
  consecutive_failures: number;
}

export interface SyncConflict {
  id: string;
  local_record?: SyncRecord;
  remote_record?: SyncRecord;
  conflict_type:
    | 'data_mismatch'
    | 'deletion_conflict'
    | 'version_conflict'
    | 'delete_modified'
    | 'create_duplicate'
    | 'concurrent_edit'
    | 'version';
  resolution_strategy?: 'local_wins' | 'remote_wins' | 'manual' | 'merge';
  table_name: string;
  record_id: string;
  local_data: any;
  remote_data: any;
  resolved: boolean;
  resolved_data?: any;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  sync_record_id: string;
  created_at: string;
}

export interface MergeRule {
  table_name: string;
  field_name: string;
  strategy:
    | 'local_wins'
    | 'remote_wins'
    | 'manual'
    | 'merge'
    | 'custom'
    | 'newest_wins';
  custom_function?: string;
  custom_resolver?: string;
  priority: number;
}

export interface MergeResult {
  success: boolean;
  merged_data: any;
  conflicts?: string[];
  conflicts_found: number;
  conflicts_resolved: number;
  merge_strategy_used: string;
  manual_resolution_required: boolean;
  field_resolutions: any[];
  resolution_notes?: string;
}

export interface SyncQueue {
  id: string;
  name: string;
  description?: string;
  priority: number;
  is_enabled: boolean;
  max_retries: number;
  retry_delay: number;
  max_size: number;
  current_size: number;
  paused: boolean;
  processing: boolean;
  last_processed?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueItem {
  id: string;
  queue_id: string;
  data: any;
  payload: any;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  max_attempts: number;
  next_attempt?: string;
  scheduled_for?: string;
  processing_started_at?: string;
  completed_at?: string;
  error_message?: string;
  result?: any;
  created_at: string;
  processed_at?: string;
}

export interface OfflineOperation {
  id: string;
  type: 'order' | 'payment' | 'inventory_update' | 'stock_transaction';
  operation_type:
    | 'order'
    | 'payment'
    | 'inventory_update'
    | 'stock_transaction';
  data: any;
  operation_data: any;
  status: 'pending' | 'synced' | 'failed' | 'completed';
  entity_id: string;
  timestamp: string;
  executed_at?: string;
  created_at: string;
  synced_at?: string;
  error_message?: string;
}

export interface OfflineBill {
  id: string;
  order_data: Order;
  payment_data: Payment[];
  inventory_updates: any[];
  created_at: string;
  synced_at?: string;
  sync_status?: 'pending' | 'synced' | 'failed';
  retry_count?: number;
}

export interface OfflineInventoryUpdate {
  id: string;
  inventory_item_id: string;
  quantity_change: number;
  reason: string;
  reference_type: 'order' | 'manual' | 'wastage';
  reference_id?: string;
  created_at: string;
  synced_at?: string;
}

export interface OfflineStorageInfo {
  total_size: number;
  used_size: number;
  available_size: number;
  database_size: number;
  cache_size: number;
  storage_type: string;
  database_name: string;
  database_version: number;
  total_size_bytes: number;
  used_size_bytes: number;
  available_size_bytes: number;
  table_sizes: Record<string, number>;
  auto_cleanup_enabled: boolean;
  retention_days: number;
  last_cleanup: string;
  cleanup_frequency: number;
}

export interface SyncHealth {
  last_successful_sync: string;
  sync_frequency: number;
  error_rate: number;
  average_sync_duration: number;
  pending_operations: number;
  database_integrity: 'good' | 'warning' | 'error';
}

export interface SyncEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'conflict_detected';
  timestamp: string;
  details: any;
  user_id?: string;
}

export interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
  current_operation: string;
  estimated_time_remaining?: number;
}

export interface SyncState {
  is_syncing: boolean;
  last_sync: string;
  next_sync: string;
  pending_operations: number;
  failed_operations: number;
  sync_health: SyncHealth;
  current_sync_session?: SyncSession;
}

export interface SyncConfiguration {
  auto_sync: boolean;
  sync_interval: number;
  batch_size: number;
  retry_attempts: number;
  retry_delay: number;
  conflict_resolution: 'local_wins' | 'remote_wins' | 'manual';
  offline_storage_limit: number;
  cleanup_frequency: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'tablet' | 'mobile' | 'desktop' | 'pos_terminal';
  os: string;
  os_version: string;
  app_version: string;
  last_seen: string;
  is_active: boolean;
}

export interface SyncEnvironment {
  is_development: boolean;
  is_testing: boolean;
  is_production: boolean;
  api_endpoint: string;
  sync_timeout: number;
  max_concurrent_syncs: number;
}

// Integration Types
export interface IntegrationStatus {
  id: string;
  integration_id: string;
  platform: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  is_enabled: boolean;
  is_connected: boolean;
  orders_synced_today: number;
  last_sync: string;
  sync_frequency: number;
  error_count: number;
  last_error?: string;
  next_sync: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentIntegrationRequest {
  amount: number;
  currency: string;
  order_id: string;
  customer_info: {
    name: string;
    phone?: string;
    email?: string;
  };
  payment_method: 'card' | 'upi' | 'netbanking';
  metadata?: Record<string, any>;
}

export interface PaymentIntegrationResponse {
  success: boolean;
  transaction_id?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  redirect_url?: string;
  payment_gateway: string;
  response_data?: any;
}

export interface PaytmPayment {
  id: string;
  order_id: string;
  orderId: string;
  transaction_id: string;
  amount: number;
  txnAmount: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'card' | 'upi' | 'netbanking';
  customer_info: {
    name: string;
    phone?: string;
    email?: string;
  };
  mobileNo: string;
  email: string;
  custId: string;
  callbackUrl: string;
  gateway_response: any;
  created_at: string;
  updated_at: string;
}

export interface ReportSummary {
  id: string;
  report_type: 'daily' | 'monthly' | 'custom';
  period: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_orders: number;
  total_profit: number;
  generated_at: string;
  generated_by: string;
  is_synced: boolean;
  export_formats: string[];
  data?: DailySalesReport | MonthlySalesReport;
  created_at: string;
  updated_at: string;
}

export interface OfflineStorage {
  is_available: boolean;
  database_size: number;
  available_space: number;
  last_backup: string;
  backup_frequency: number;
  auto_cleanup: boolean;
  cleanup_threshold: number;
}

export interface SyncOperation {
  id: string;
  type: 'upload' | 'download';
  entity: string;
  entityId: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
}
