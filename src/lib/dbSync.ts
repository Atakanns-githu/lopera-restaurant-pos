import { supabase, isSupabaseConfigured } from './supabase';
import { Order, TableItem, InventoryItem, TableStatus } from '@/types/pos';

export async function syncOrderToSupabase(order: Order): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error: orderError } = await supabase.from('orders').upsert({
      id: order.id,
      table_id: order.tableId,
      table_number: order.tableNumber,
      section: order.section,
      waiter_id: order.waiterId,
      waiter_name: order.waiterName,
      guest_count: order.guestCount,
      subtotal: order.subtotal,
      discount_rate: order.discountRate,
      discount_amount: order.discountAmount,
      cover_charge: order.coverCharge,
      tax_rate: order.taxRate,
      total: order.total,
      paid_amount: order.paidAmount,
      remaining_amount: order.remainingAmount,
      status: order.status,
      created_at: order.createdAt,
      closed_at: order.closedAt,
    });

    if (orderError) {
      console.warn('Supabase order sync warning:', orderError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase order sync error:', err);
    return false;
  }
}

export async function syncTableStatusToSupabase(
  tableId: string,
  status: TableStatus
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('tables')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', tableId);

    if (error) {
      console.warn('Supabase table sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase table sync error:', err);
    return false;
  }
}

export async function syncInventoryToSupabase(
  itemId: string,
  newStock: number
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('inventory')
      .update({
        current_stock: newStock,
        last_updated: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) {
      console.warn('Supabase inventory sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase inventory sync error:', err);
    return false;
  }
}
