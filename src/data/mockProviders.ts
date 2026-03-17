export type ServiceCategory = 'plumber' | 'cook' | 'drycleaner' | 'electrician';

export interface MockProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  distance: string;
  isOnline: boolean;
  latitude: number;
  longitude: number;
  services: string[];
  avatar: string;
}

// Centered around Delhi, India
export const mockProviders: MockProvider[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    category: 'plumber',
    rating: 4.8,
    reviewCount: 124,
    hourlyRate: 350,
    distance: '1.2 km',
    isOnline: true,
    latitude: 28.6139,
    longitude: 77.2090,
    services: ['Pipe Repair', 'Tap Installation', 'Drain Cleaning'],
    avatar: 'RK',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    category: 'cook',
    rating: 4.9,
    reviewCount: 89,
    hourlyRate: 500,
    distance: '0.8 km',
    isOnline: true,
    latitude: 28.6180,
    longitude: 77.2150,
    services: ['North Indian', 'South Indian', 'Chinese'],
    avatar: 'PS',
  },
  {
    id: '3',
    name: 'Amit Patel',
    category: 'electrician',
    rating: 4.6,
    reviewCount: 67,
    hourlyRate: 400,
    distance: '2.1 km',
    isOnline: false,
    latitude: 28.6100,
    longitude: 77.2020,
    services: ['Wiring', 'Fan Installation', 'MCB Repair'],
    avatar: 'AP',
  },
  {
    id: '4',
    name: 'Sunita Devi',
    category: 'drycleaner',
    rating: 4.7,
    reviewCount: 156,
    hourlyRate: 250,
    distance: '1.5 km',
    isOnline: true,
    latitude: 28.6200,
    longitude: 77.2050,
    services: ['Laundry', 'Ironing', 'Stain Removal'],
    avatar: 'SD',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    category: 'plumber',
    rating: 4.5,
    reviewCount: 43,
    hourlyRate: 300,
    distance: '3.0 km',
    isOnline: true,
    latitude: 28.6050,
    longitude: 77.2180,
    services: ['Water Tank', 'Bathroom Fitting', 'Pipe Repair'],
    avatar: 'VS',
  },
  {
    id: '6',
    name: 'Meena Kumari',
    category: 'cook',
    rating: 4.4,
    reviewCount: 31,
    hourlyRate: 450,
    distance: '1.8 km',
    isOnline: false,
    latitude: 28.6160,
    longitude: 77.1980,
    services: ['Bengali', 'Mughlai', 'Continental'],
    avatar: 'MK',
  },
  {
    id: '7',
    name: 'Ravi Teja',
    category: 'electrician',
    rating: 4.9,
    reviewCount: 201,
    hourlyRate: 500,
    distance: '0.5 km',
    isOnline: true,
    latitude: 28.6145,
    longitude: 77.2110,
    services: ['AC Repair', 'Inverter Setup', 'Full Wiring'],
    avatar: 'RT',
  },
  {
    id: '8',
    name: 'Kavita Joshi',
    category: 'drycleaner',
    rating: 4.3,
    reviewCount: 78,
    hourlyRate: 200,
    distance: '2.5 km',
    isOnline: true,
    latitude: 28.6080,
    longitude: 77.2130,
    services: ['Dry Clean', 'Steam Press', 'Curtain Cleaning'],
    avatar: 'KJ',
  },
];

export const categories: { id: ServiceCategory; label: string; labelHi: string }[] = [
  { id: 'plumber', label: 'Plumber', labelHi: 'प्लंबर' },
  { id: 'cook', label: 'Cook', labelHi: 'रसोइया' },
  { id: 'drycleaner', label: 'Drycleaner', labelHi: 'ड्राईक्लीनर' },
  { id: 'electrician', label: 'Electrician', labelHi: 'इलेक्ट्रीशियन' },
];
