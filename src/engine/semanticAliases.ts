/**
 * semanticAliases.ts — Semantic Column Alias Deduplication
 * Groups synonymous column names (e.g. total, total_amount, amount) so that
 * schema inference does not generate redundant semantic duplicate columns.
 */

export const SEMANTIC_GROUPS: Record<string, string[]> = {
  TOTAL: [
    'total',
    'total_amount',
    'amount',
    'order_total',
    'grand_total',
    'subtotal',
    'net_amount',
    'gross_amount',
  ],
  FULL_NAME: [
    'name',
    'full_name',
    'customer_name',
    'user_name',
    'client_name',
  ],
  FIRST_NAME: ['first_name', 'given_name', 'fname'],
  LAST_NAME: ['last_name', 'surname', 'family_name', 'lname'],
  EMAIL: ['email', 'email_address', 'user_email', 'mail'],
  PHONE: ['phone', 'phone_number', 'mobile', 'telephone', 'tel'],
  DATE: [
    'created_at',
    'created_date',
    'order_date',
    'date',
    'timestamp',
    'creation_date',
    'registered_at',
  ],
  PRICE: ['price', 'unit_price', 'cost', 'item_price'],
  STATUS: ['status', 'order_status', 'state', 'current_status'],
  ADDRESS: ['address', 'street_address', 'full_address', 'shipping_address', 'billing_address'],
  QUANTITY: ['quantity', 'qty', 'item_count'],
};

// Inverted lookup map for O(1) group lookup
const COLUMN_TO_GROUP = new Map<string, string>();
for (const [groupId, cols] of Object.entries(SEMANTIC_GROUPS)) {
  for (const col of cols) {
    COLUMN_TO_GROUP.set(col.toLowerCase(), groupId);
  }
}

export function getSemanticGroupId(colName: string): string | null {
  return COLUMN_TO_GROUP.get(colName.toLowerCase()) || null;
}

export function areSemanticDuplicates(colA: string, colB: string): boolean {
  const gA = getSemanticGroupId(colA);
  const gB = getSemanticGroupId(colB);
  return Boolean(gA && gB && gA === gB);
}
