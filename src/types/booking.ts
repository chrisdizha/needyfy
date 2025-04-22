
export interface BookingDetails {
  id: string;
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentId?: string;
  created?: Date;
  notes?: string;
}

export type BookingFilters = {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startDate?: Date;
  endDate?: Date;
}
