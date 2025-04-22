
export interface BookingDetails {
  id: string;
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}
