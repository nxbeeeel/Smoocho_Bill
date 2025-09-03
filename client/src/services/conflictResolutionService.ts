import {
  SyncConflict,
  SyncRecord,
  MergeRule,
  MergeResult,
  Order,
  Payment,
  InventoryItem,
  Product,
  Category,
} from '../types';

/**
 * Conflict Resolution Service
 *
 * Handles data conflicts between local and remote records with:
 * - Configurable merge rules
 * - Automatic conflict detection
 * - Multiple resolution strategies
 * - Manual conflict resolution
 * - Conflict history tracking
 */
export class ConflictResolutionService {
  private mergeRules: Map<string, MergeRule[]> = new Map();
  private conflictHistory: SyncConflict[] = [];
  private customResolvers: Map<string, Function> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.loadConflictHistory();
  }

  // Initialize default merge rules for different entity types
  private initializeDefaultRules(): void {
    this.setupOrderRules();
    this.setupPaymentRules();
    this.setupInventoryRules();
    this.setupProductRules();
    this.setupCategoryRules();
    this.setupGeneralRules();
  }

  // Setup merge rules for orders
  private setupOrderRules(): void {
    const orderRules: MergeRule[] = [
      {
        table_name: 'orders',
        field_name: 'status',
        strategy: 'newest_wins',
        priority: 1,
      },
      {
        table_name: 'orders',
        field_name: 'payment_status',
        strategy: 'newest_wins',
        priority: 1,
      },
      {
        table_name: 'orders',
        field_name: 'total_amount',
        strategy: 'local_wins', // Local calculations take precedence
        priority: 2,
      },
      {
        table_name: 'orders',
        field_name: 'customer_name',
        strategy: 'remote_wins', // Customer data from cloud is authoritative
        priority: 3,
      },
      {
        table_name: 'orders',
        field_name: 'completed_at',
        strategy: 'newest_wins',
        priority: 1,
      },
      {
        table_name: 'orders',
        field_name: 'order_items',
        strategy: 'custom',
        custom_resolver: 'mergeOrderItems',
        priority: 1,
      },
    ];

    this.mergeRules.set('orders', orderRules);
  }

  // Setup merge rules for payments
  private setupPaymentRules(): void {
    const paymentRules: MergeRule[] = [
      {
        table_name: 'payments',
        field_name: 'payment_status',
        strategy: 'newest_wins',
        priority: 1,
      },
      {
        table_name: 'payments',
        field_name: 'transaction_id',
        strategy: 'remote_wins', // Transaction IDs from payment gateway are authoritative
        priority: 1,
      },
      {
        table_name: 'payments',
        field_name: 'amount',
        strategy: 'local_wins', // Local calculations
        priority: 2,
      },
      {
        table_name: 'payments',
        field_name: 'payment_date',
        strategy: 'newest_wins',
        priority: 1,
      },
    ];

    this.mergeRules.set('payments', paymentRules);
  }

  // Setup merge rules for inventory
  private setupInventoryRules(): void {
    const inventoryRules: MergeRule[] = [
      {
        table_name: 'inventory',
        field_name: 'current_stock',
        strategy: 'custom',
        custom_resolver: 'mergeInventoryStock',
        priority: 1,
      },
      {
        table_name: 'inventory',
        field_name: 'minimum_stock',
        strategy: 'remote_wins', // Management settings
        priority: 2,
      },
      {
        table_name: 'inventory',
        field_name: 'cost_per_unit',
        strategy: 'newest_wins',
        priority: 2,
      },
      {
        table_name: 'inventory',
        field_name: 'supplier_name',
        strategy: 'remote_wins',
        priority: 3,
      },
      {
        table_name: 'inventory',
        field_name: 'last_restocked',
        strategy: 'newest_wins',
        priority: 1,
      },
    ];

    this.mergeRules.set('inventory', inventoryRules);
  }

  // Setup merge rules for products
  private setupProductRules(): void {
    const productRules: MergeRule[] = [
      {
        table_name: 'products',
        field_name: 'price',
        strategy: 'remote_wins', // Pricing decisions from management
        priority: 1,
      },
      {
        table_name: 'products',
        field_name: 'is_available',
        strategy: 'local_wins', // Local availability status
        priority: 1,
      },
      {
        table_name: 'products',
        field_name: 'name',
        strategy: 'remote_wins', // Product catalog from management
        priority: 2,
      },
      {
        table_name: 'products',
        field_name: 'description',
        strategy: 'remote_wins',
        priority: 3,
      },
      {
        table_name: 'products',
        field_name: 'recipe_items',
        strategy: 'remote_wins', // Recipe management
        priority: 2,
      },
    ];

    this.mergeRules.set('products', productRules);
  }

  // Setup merge rules for categories
  private setupCategoryRules(): void {
    const categoryRules: MergeRule[] = [
      {
        table_name: 'categories',
        field_name: 'name',
        strategy: 'remote_wins',
        priority: 1,
      },
      {
        table_name: 'categories',
        field_name: 'sort_order',
        strategy: 'remote_wins',
        priority: 2,
      },
      {
        table_name: 'categories',
        field_name: 'is_active',
        strategy: 'remote_wins',
        priority: 1,
      },
    ];

    this.mergeRules.set('categories', categoryRules);
  }

  // Setup general merge rules
  private setupGeneralRules(): void {
    const generalRules: MergeRule[] = [
      {
        table_name: '*',
        field_name: 'created_at',
        strategy: 'local_wins', // Creation timestamp should not change
        priority: 1,
      },
      {
        table_name: '*',
        field_name: 'updated_at',
        strategy: 'newest_wins',
        priority: 1,
      },
      {
        table_name: '*',
        field_name: 'id',
        strategy: 'local_wins', // IDs should not change
        priority: 1,
      },
    ];

    this.mergeRules.set('*', generalRules);
  }

  // Register custom resolver functions
  private registerCustomResolvers(): void {
    // Order items merger
    this.customResolvers.set(
      'mergeOrderItems',
      (localItems: any[], remoteItems: any[]) => {
        // Merge order items by product_id, summing quantities
        const mergedItems = new Map();

        [...localItems, ...remoteItems].forEach(item => {
          const key = item.product_id;
          if (mergedItems.has(key)) {
            const existing = mergedItems.get(key);
            existing.quantity += item.quantity;
            existing.item_total += item.item_total;
          } else {
            mergedItems.set(key, { ...item });
          }
        });

        return Array.from(mergedItems.values());
      }
    );

    // Inventory stock merger
    this.customResolvers.set(
      'mergeInventoryStock',
      (localStock: number, remoteStock: number, context: any) => {
        // For inventory, we need to consider transactions that happened
        // Use the most conservative (lower) stock level to prevent overselling
        return Math.min(localStock, remoteStock);
      }
    );
  }

  // Detect conflicts between local and remote records
  detectConflict(
    localRecord: SyncRecord,
    remoteRecord: any
  ): SyncConflict | null {
    const localTimestamp = new Date(localRecord.timestamp).getTime();
    const remoteTimestamp = new Date(
      remoteRecord.timestamp || remoteRecord.updated_at
    ).getTime();

    // Check if timestamps are close enough to indicate concurrent editing
    const timeDiff = Math.abs(localTimestamp - remoteTimestamp);
    const concurrentThreshold = 5 * 60 * 1000; // 5 minutes

    if (timeDiff < concurrentThreshold) {
      // Check for actual data differences
      const hasDataConflicts = this.hasDataConflicts(
        localRecord.data,
        remoteRecord
      );

      if (hasDataConflicts) {
        return this.createConflictRecord(localRecord, remoteRecord);
      }
    }

    return null;
  }

  // Check if there are actual data differences
  private hasDataConflicts(localData: any, remoteData: any): boolean {
    const localKeys = new Set(Object.keys(localData));
    const remoteKeys = new Set(Object.keys(remoteData));

    // Check for different field values
    for (const key of localKeys) {
      if (remoteKeys.has(key)) {
        const localValue = localData[key];
        const remoteValue = remoteData[key];

        // Skip certain fields that are expected to be different
        if (['updated_at', 'sync_status', 'device_id'].includes(key)) {
          continue;
        }

        if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
          return true;
        }
      }
    }

    return false;
  }

  // Create conflict record
  private createConflictRecord(
    localRecord: SyncRecord,
    remoteRecord: any
  ): SyncConflict {
    const conflictType = this.determineConflictType(localRecord, remoteRecord);

    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sync_record_id: localRecord.id,
      table_name: localRecord.table_name,
      record_id: localRecord.record_id,
      local_data: localRecord.data,
      remote_data: remoteRecord,
      conflict_type: conflictType,
      resolution_strategy: this.getDefaultResolutionStrategy(
        localRecord.table_name
      ),
      resolved: false,
      created_at: new Date().toISOString(),
    };

    this.conflictHistory.push(conflict);
    this.saveConflictHistory();

    console.warn(
      `⚠️ Conflict detected: ${conflict.table_name}/${conflict.record_id} (${conflict.conflict_type})`
    );
    return conflict;
  }

  // Determine conflict type
  private determineConflictType(
    localRecord: SyncRecord,
    remoteRecord: any
  ): SyncConflict['conflict_type'] {
    if (localRecord.operation === 'DELETE' && remoteRecord) {
      return 'delete_modified';
    }

    if (localRecord.operation === 'CREATE' && remoteRecord) {
      return 'create_duplicate';
    }

    const localTimestamp = new Date(localRecord.timestamp).getTime();
    const remoteTimestamp = new Date(
      remoteRecord.updated_at || remoteRecord.timestamp
    ).getTime();

    if (Math.abs(localTimestamp - remoteTimestamp) < 60000) {
      // 1 minute
      return 'concurrent_edit';
    }

    return 'version';
  }

  // Get default resolution strategy for table
  private getDefaultResolutionStrategy(
    tableName: string
  ): SyncConflict['resolution_strategy'] {
    // Default strategies based on table importance
    const defaultStrategies: Record<
      string,
      SyncConflict['resolution_strategy']
    > = {
      orders: 'merge',
      payments: 'local_wins',
      inventory: 'merge',
      products: 'remote_wins',
      categories: 'remote_wins',
    };

    return defaultStrategies[tableName] || 'manual';
  }

  // Resolve conflict automatically
  async resolveConflict(conflict: SyncConflict): Promise<MergeResult> {
    console.log(
      `🔄 Resolving conflict: ${conflict.table_name}/${conflict.record_id}`
    );

    let mergeResult: MergeResult;

    switch (conflict.resolution_strategy) {
      case 'local_wins':
        mergeResult = this.resolveLocalWins(conflict);
        break;
      case 'remote_wins':
        mergeResult = this.resolveRemoteWins(conflict);
        break;
      case 'merge':
        mergeResult = this.resolveMerge(conflict);
        break;
      case 'manual':
        mergeResult = this.prepareManualResolution(conflict);
        break;
      default:
        throw new Error(
          `Unknown resolution strategy: ${conflict.resolution_strategy}`
        );
    }

    if (mergeResult.success && !mergeResult.manual_resolution_required) {
      await this.markConflictResolved(conflict, mergeResult.merged_data);
    }

    return mergeResult;
  }

  // Resolve with local data winning
  private resolveLocalWins(conflict: SyncConflict): MergeResult {
    return {
      success: true,
      merged_data: conflict.local_data,
      conflicts_found: 1,
      conflicts_resolved: 1,
      manual_resolution_required: false,
      merge_strategy_used: 'local_wins',
      field_resolutions: [],
    };
  }

  // Resolve with remote data winning
  private resolveRemoteWins(conflict: SyncConflict): MergeResult {
    return {
      success: true,
      merged_data: conflict.remote_data,
      conflicts_found: 1,
      conflicts_resolved: 1,
      manual_resolution_required: false,
      merge_strategy_used: 'remote_wins',
      field_resolutions: [],
    };
  }

  // Resolve by merging data according to rules
  private resolveMerge(conflict: SyncConflict): MergeResult {
    const tableRules = this.mergeRules.get(conflict.table_name) || [];
    const generalRules = this.mergeRules.get('*') || [];
    const allRules = [...tableRules, ...generalRules];

    const mergedData = { ...conflict.local_data };
    const fieldResolutions: MergeResult['field_resolutions'] = [];
    let conflictsFound = 0;
    let conflictsResolved = 0;

    // Process each field according to merge rules
    for (const [fieldName, localValue] of Object.entries(conflict.local_data)) {
      const remoteValue = conflict.remote_data[fieldName];

      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        conflictsFound++;

        const rule = this.findMergeRule(allRules, fieldName);
        const resolvedValue = this.applyMergeRule(
          rule,
          fieldName,
          localValue,
          remoteValue,
          conflict
        );

        mergedData[fieldName] = resolvedValue;
        conflictsResolved++;

        fieldResolutions.push({
          field_name: fieldName,
          local_value: localValue,
          remote_value: remoteValue,
          resolved_value: resolvedValue,
          strategy_used: rule?.strategy || 'newest_wins',
        });
      }
    }

    // Add any remote fields that don't exist locally
    for (const [fieldName, remoteValue] of Object.entries(
      conflict.remote_data
    )) {
      if (!(fieldName in mergedData)) {
        mergedData[fieldName] = remoteValue;

        fieldResolutions.push({
          field_name: fieldName,
          local_value: undefined,
          remote_value: remoteValue,
          resolved_value: remoteValue,
          strategy_used: 'remote_wins',
        });
      }
    }

    return {
      success: true,
      merged_data: mergedData,
      conflicts_found: conflictsFound,
      conflicts_resolved: conflictsResolved,
      manual_resolution_required: false,
      merge_strategy_used: 'merge',
      field_resolutions: fieldResolutions,
    };
  }

  // Find applicable merge rule for field
  private findMergeRule(
    rules: MergeRule[],
    fieldName: string
  ): MergeRule | null {
    return (
      rules
        .filter(rule => rule.field_name === fieldName)
        .sort((a, b) => a.priority - b.priority)[0] || null
    );
  }

  // Apply merge rule to resolve field conflict
  private applyMergeRule(
    rule: MergeRule | null,
    fieldName: string,
    localValue: any,
    remoteValue: any,
    conflict: SyncConflict
  ): any {
    if (!rule) {
      // Default to newest wins
      const localTimestamp = new Date(
        conflict.local_data.updated_at || conflict.local_data.timestamp
      ).getTime();
      const remoteTimestamp = new Date(
        conflict.remote_data.updated_at || conflict.remote_data.timestamp
      ).getTime();
      return remoteTimestamp > localTimestamp ? remoteValue : localValue;
    }

    switch (rule.strategy) {
      case 'local_wins':
        return localValue;
      case 'remote_wins':
        return remoteValue;
      case 'newest_wins':
        const localTime = new Date(
          conflict.local_data.updated_at || conflict.local_data.timestamp
        ).getTime();
        const remoteTime = new Date(
          conflict.remote_data.updated_at || conflict.remote_data.timestamp
        ).getTime();
        return remoteTime > localTime ? remoteValue : localValue;
      case 'custom':
        if (
          rule.custom_resolver &&
          this.customResolvers.has(rule.custom_resolver)
        ) {
          const resolver = this.customResolvers.get(rule.custom_resolver)!;
          return resolver(localValue, remoteValue, conflict);
        }
        return localValue;
      default:
        return localValue;
    }
  }

  // Prepare conflict for manual resolution
  private prepareManualResolution(conflict: SyncConflict): MergeResult {
    return {
      success: false,
      merged_data: null,
      conflicts_found: 1,
      conflicts_resolved: 0,
      manual_resolution_required: true,
      merge_strategy_used: 'manual',
      field_resolutions: [],
    };
  }

  // Mark conflict as resolved
  private async markConflictResolved(
    conflict: SyncConflict,
    resolvedData: any
  ): Promise<void> {
    conflict.resolved = true;
    conflict.resolved_data = resolvedData;
    conflict.resolved_at = new Date().toISOString();

    this.saveConflictHistory();
    console.log(
      `✅ Conflict resolved: ${conflict.table_name}/${conflict.record_id}`
    );
  }

  // Get all unresolved conflicts
  getUnresolvedConflicts(): SyncConflict[] {
    return this.conflictHistory.filter(conflict => !conflict.resolved);
  }

  // Get conflicts for specific table
  getConflictsForTable(tableName: string): SyncConflict[] {
    return this.conflictHistory.filter(
      conflict => conflict.table_name === tableName
    );
  }

  // Get conflict statistics
  getConflictStatistics(): {
    total: number;
    resolved: number;
    unresolved: number;
    by_type: Record<string, number>;
    by_table: Record<string, number>;
  } {
    const stats = {
      total: this.conflictHistory.length,
      resolved: this.conflictHistory.filter(c => c.resolved).length,
      unresolved: this.conflictHistory.filter(c => !c.resolved).length,
      by_type: {} as Record<string, number>,
      by_table: {} as Record<string, number>,
    };

    this.conflictHistory.forEach(conflict => {
      stats.by_type[conflict.conflict_type] =
        (stats.by_type[conflict.conflict_type] || 0) + 1;
      stats.by_table[conflict.table_name] =
        (stats.by_table[conflict.table_name] || 0) + 1;
    });

    return stats;
  }

  // Manually resolve conflict
  async manuallyResolveConflict(
    conflictId: string,
    resolvedData: any,
    resolvedBy: string
  ): Promise<void> {
    const conflict = this.conflictHistory.find(c => c.id === conflictId);
    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    conflict.resolved = true;
    conflict.resolved_data = resolvedData;
    conflict.resolved_at = new Date().toISOString();
    conflict.resolved_by = resolvedBy;

    this.saveConflictHistory();
    console.log(
      `✅ Conflict manually resolved: ${conflict.table_name}/${conflict.record_id} by ${resolvedBy}`
    );
  }

  // Add custom merge rule
  addMergeRule(rule: MergeRule): void {
    const tableRules = this.mergeRules.get(rule.table_name) || [];
    tableRules.push(rule);
    this.mergeRules.set(rule.table_name, tableRules);

    // Save to localStorage
    this.saveMergeRules();
    console.log(
      `📋 Added merge rule for ${rule.table_name}.${rule.field_name}: ${rule.strategy}`
    );
  }

  // Remove merge rule
  removeMergeRule(tableName: string, fieldName: string): boolean {
    const tableRules = this.mergeRules.get(tableName);
    if (!tableRules) return false;

    const initialLength = tableRules.length;
    const filteredRules = tableRules.filter(
      rule => rule.field_name !== fieldName
    );

    if (filteredRules.length < initialLength) {
      this.mergeRules.set(tableName, filteredRules);
      this.saveMergeRules();
      console.log(`🗑️ Removed merge rule for ${tableName}.${fieldName}`);
      return true;
    }

    return false;
  }

  // Get merge rules for table
  getMergeRules(tableName: string): MergeRule[] {
    return this.mergeRules.get(tableName) || [];
  }

  // Save merge rules to localStorage
  private saveMergeRules(): void {
    const rulesObject = Object.fromEntries(this.mergeRules);
    localStorage.setItem('mergeRules', JSON.stringify(rulesObject));
  }

  // Load merge rules from localStorage
  private loadMergeRules(): void {
    const saved = localStorage.getItem('mergeRules');
    if (saved) {
      try {
        const rulesObject = JSON.parse(saved);
        this.mergeRules = new Map(Object.entries(rulesObject));
      } catch (error) {
        console.error('Failed to load merge rules:', error);
      }
    }
  }

  // Save conflict history to localStorage
  private saveConflictHistory(): void {
    localStorage.setItem(
      'conflictHistory',
      JSON.stringify(this.conflictHistory)
    );
  }

  // Load conflict history from localStorage
  private loadConflictHistory(): void {
    const saved = localStorage.getItem('conflictHistory');
    if (saved) {
      try {
        this.conflictHistory = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load conflict history:', error);
        this.conflictHistory = [];
      }
    }
  }

  // Clear old resolved conflicts
  cleanupResolvedConflicts(olderThanDays: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const initialCount = this.conflictHistory.length;

    this.conflictHistory = this.conflictHistory.filter(conflict => {
      if (!conflict.resolved) return true;

      const resolvedDate = new Date(conflict.resolved_at!);
      return resolvedDate > cutoffDate;
    });

    const removedCount = initialCount - this.conflictHistory.length;

    if (removedCount > 0) {
      this.saveConflictHistory();
      console.log(`🧹 Cleaned up ${removedCount} old resolved conflicts`);
    }

    return removedCount;
  }

  // Reset all conflicts (for testing/debugging)
  resetConflicts(): void {
    this.conflictHistory = [];
    this.saveConflictHistory();
    console.log('🔄 Reset all conflicts');
  }

  // Export conflict resolution configuration
  exportConfiguration(): { mergeRules: any; conflictHistory: SyncConflict[] } {
    return {
      mergeRules: Object.fromEntries(this.mergeRules),
      conflictHistory: this.conflictHistory,
    };
  }

  // Import conflict resolution configuration
  importConfiguration(config: {
    mergeRules?: any;
    conflictHistory?: SyncConflict[];
  }): void {
    if (config.mergeRules) {
      this.mergeRules = new Map(Object.entries(config.mergeRules));
      this.saveMergeRules();
    }

    if (config.conflictHistory) {
      this.conflictHistory = config.conflictHistory;
      this.saveConflictHistory();
    }

    console.log('📥 Imported conflict resolution configuration');
  }
}

// Export singleton instance
export const conflictResolutionService = new ConflictResolutionService();
