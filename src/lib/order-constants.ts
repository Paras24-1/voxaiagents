// Map database status values to user-friendly titles
export const STATUS_TITLES: Record<string, string> = {
  placed: 'Order Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// Map status to thematic colors for HTML emails
export const STATUS_COLORS: Record<string, string> = {
  placed: '#3b82f6', // blue
  processing: '#f59e0b', // amber
  shipped: '#8b5cf6', // purple
  out_for_delivery: '#06b6d4', // cyan
  delivered: '#10b981', // emerald
  cancelled: '#ef4444', // red
}
