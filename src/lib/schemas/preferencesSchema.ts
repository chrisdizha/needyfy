
import * as z from 'zod';

export const categoryItems = [
  { id: 'construction', label: 'Construction' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'event_equipment', label: 'Event Equipment' },
  { id: 'home_garden', label: 'Home & Garden' },
  { id: 'photography', label: 'Photography' },
  { id: 'sports', label: 'Sports & Recreation' },
  { id: 'music', label: 'Musical Instruments' },
] as const;

export const preferencesSchema = z.object({
  interests: z.array(z.string()).min(1, {
    message: 'Please select at least one category of interest',
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
  }),
  role: z.enum(['renter', 'provider', 'both']).default('both'),
});

export type PreferencesData = z.infer<typeof preferencesSchema>;
