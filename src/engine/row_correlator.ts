/**
 * row_correlator.ts — Intra-Row Statistical & Relational Correlator (Layer 4)
 *
 * Enforces realistic mathematical, temporal, demographic, and lifecycle integrity
 * across columns within the same synthetic row.
 */

export function correlateRow(row: Record<string, any>, _tableName = ''): Record<string, any> {
  const keys = Object.keys(row);
  const keyMap = new Map<string, string>();
  for (const k of keys) {
    keyMap.set(k.toLowerCase(), k);
  }

  // ── 1. Full Name & Email Alignment ───────────────────────────────────────────
  const firstNameKey = keyMap.get('first_name') || keyMap.get('firstname');
  const lastNameKey = keyMap.get('last_name') || keyMap.get('lastname');
  const fullNameKey = keyMap.get('name') || keyMap.get('full_name') || keyMap.get('customer_name');
  const emailKey = keyMap.get('email') || keyMap.get('email_address') || keyMap.get('user_email');

  if (firstNameKey && lastNameKey) {
    const fName = String(row[firstNameKey] || '').trim();
    const lName = String(row[lastNameKey] || '').trim();

    if (fullNameKey && fName && lName) {
      row[fullNameKey] = `${fName} ${lName}`;
    }

    if (emailKey && fName && lName) {
      const cleanF = fName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanL = lName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const currentEmail = String(row[emailKey] || '');
      const domain = currentEmail.includes('@') ? currentEmail.split('@')[1] : 'example.com';
      row[emailKey] = `${cleanF}.${cleanL}@${domain}`;
    }
  }

  // ── 2. Age and Birthdate Alignment ───────────────────────────────────────────
  const ageKey = keyMap.get('age');
  const dobKey = keyMap.get('dob') || keyMap.get('birth_date');

  if (ageKey && dobKey) {
    const currentYear = new Date().getFullYear();
    const ageVal = Number(row[ageKey]);
    if (!isNaN(ageVal) && ageVal > 0) {
      const birthYear = currentYear - ageVal;
      const currentDob = String(row[dobKey] || '1990-05-15');
      const monthDay = currentDob.includes('-') && currentDob.split('-').length >= 3
        ? `${currentDob.split('-')[1]}-${currentDob.split('-')[2]}`
        : '06-15';
      row[dobKey] = `${birthYear}-${monthDay}`;
    }
  }

  // ── 3. E-Commerce & Monetary Math (quantity * unit_price = total) ────────────
  const qtyKey = keyMap.get('quantity') || keyMap.get('qty') || keyMap.get('item_count');
  const priceKey = keyMap.get('unit_price') || keyMap.get('price') || keyMap.get('item_price');
  const totalKey = keyMap.get('total') || keyMap.get('total_amount') || keyMap.get('subtotal') || keyMap.get('order_total') || keyMap.get('amount');

  if (qtyKey && priceKey && totalKey) {
    const q = Number(row[qtyKey]);
    const p = Number(row[priceKey]);
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
      row[totalKey] = parseFloat((q * p).toFixed(2));
    }
  }

  // Subtotal + Tax = Total
  const subtotalKey = keyMap.get('subtotal');
  const taxKey = keyMap.get('tax') || keyMap.get('tax_amount');
  const grandTotalKey = keyMap.get('total') || keyMap.get('grand_total') || keyMap.get('total_amount');

  if (subtotalKey && taxKey && grandTotalKey && subtotalKey !== grandTotalKey) {
    const sub = Number(row[subtotalKey]);
    if (!isNaN(sub) && sub > 0) {
      const taxVal = parseFloat((sub * 0.08).toFixed(2));
      row[taxKey] = taxVal;
      row[grandTotalKey] = parseFloat((sub + taxVal).toFixed(2));
    }
  }

  // ── 4. Temporal Integrity (created_at <= updated_at) ──────────────────────────
  const createdKey = keyMap.get('created_at') || keyMap.get('creation_date') || keyMap.get('registered_at');
  const updatedKey = keyMap.get('updated_at') || keyMap.get('last_modified');

  if (createdKey && updatedKey && row[createdKey] && row[updatedKey]) {
    const createdMs = new Date(row[createdKey]).getTime();
    const updatedMs = new Date(row[updatedKey]).getTime();
    if (!isNaN(createdMs) && !isNaN(updatedMs) && updatedMs < createdMs) {
      // Advance updated_at by 1-72 hours after created_at
      const advanced = new Date(createdMs + (Math.floor(Math.random() * 72) + 1) * 3600 * 1000);
      row[updatedKey] = advanced.toISOString().replace('T', ' ').substring(0, 19);
    }
  }

  // start_date <= end_date
  const startKey = keyMap.get('start_date') || keyMap.get('checkin_date') || keyMap.get('departure_time') || keyMap.get('hire_date');
  const endKey = keyMap.get('end_date') || keyMap.get('checkout_date') || keyMap.get('arrival_time') || keyMap.get('termination_date');

  if (startKey && endKey && row[startKey] && row[endKey]) {
    const startMs = new Date(row[startKey]).getTime();
    const endMs = new Date(row[endKey]).getTime();
    if (!isNaN(startMs) && !isNaN(endMs) && endMs < startMs) {
      // Advance end date by 1-14 days
      const advanced = new Date(startMs + (Math.floor(Math.random() * 14) + 1) * 86400 * 1000);
      row[endKey] = row[startKey].includes(':')
        ? advanced.toISOString().replace('T', ' ').substring(0, 19)
        : advanced.toISOString().split('T')[0];
    }
  }

  // ── 5. Status & Lifecycle State Machine ──────────────────────────────────────
  const statusKey = keyMap.get('status') || keyMap.get('order_status');
  const shippedKey = keyMap.get('shipped_at') || keyMap.get('shipped_date');
  const deliveredKey = keyMap.get('delivered_at') || keyMap.get('delivered_date');
  const cancelledKey = keyMap.get('cancelled_at') || keyMap.get('cancelled_date');

  if (statusKey && row[statusKey]) {
    const statusVal = String(row[statusKey]).toUpperCase();
    if (statusVal === 'PENDING' || statusVal === 'PROCESSING' || statusVal === 'PLACED') {
      if (shippedKey) row[shippedKey] = null;
      if (deliveredKey) row[deliveredKey] = null;
      if (cancelledKey) row[cancelledKey] = null;
    } else if (statusVal === 'CANCELLED') {
      if (shippedKey) row[shippedKey] = null;
      if (deliveredKey) row[deliveredKey] = null;
      if (cancelledKey && !row[cancelledKey]) {
        row[cancelledKey] = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }
    } else if (statusVal === 'SHIPPED') {
      if (deliveredKey) row[deliveredKey] = null;
      if (cancelledKey) row[cancelledKey] = null;
      if (shippedKey && !row[shippedKey]) {
        row[shippedKey] = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }
    }
  }

  // ── 6. Strictly Positive Constraints ─────────────────────────────────────────
  for (const k of keys) {
    const lk = k.toLowerCase();
    if (
      lk === 'age' ||
      lk === 'quantity' ||
      lk === 'qty' ||
      lk.includes('count') ||
      lk.includes('price') ||
      lk.includes('cost') ||
      lk.includes('fee')
    ) {
      const val = Number(row[k]);
      if (!isNaN(val) && val < 0) {
        row[k] = Math.abs(val);
      }
    }
  }

  return row;
}
