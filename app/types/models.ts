export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  description?: string;
  socials: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  statistics: {
    vehiclesOwned: number;
    eventsAttended: number;
    eventsHosted: number;
  };
  createdAt: number;
  lastActive: number;
  vehicleIds: string[]; // Array of vehicle IDs owned by user
  eventHostedIds: string[]; // Array of event IDs hosted by user
  eventAttendedIds: string[]; // Array of event IDs attended by user
};

export type Vehicle = {
  id: string;
  ownerId: string; // userId
  ownerName: string; // denormalized username
  make: string;
  model: string;
  trim: string;
  year: number;
  type: string; // "car, "bike, "plane, "boat"
  category?: string; // "vintage, "sports, "luxury"
  power?: number;
  torque?: number;
  speed?: number; // 0 - 100 kmph time
  isModified: boolean;
  images?: string[]; // URLs
  description: string;
  modDescription?: string;
  createdAt: number;
  updatedAt: number;
};

export type Participant = {
  userId: string;
  username: string;
  status: string; // "confirmed", "pending", "declined"
  vehicles: {
    id: string;
    name: string;
  }[]; // vehicle IDs
  joinedAt: number;
};

export type Venue = {
  googleMapLink: string;
  address: string;
  country: string;
  pincode: string;
};

export type Meetup = {
  id: string;
  title: string;
  description: string;
  date: number
  duration: string;
  venue: Venue;
  organizer: string; // userId
  rules: string;
  cost: number;
  participationLimit: number;
  isPrivate: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  vehicleTypes: string[];
  participants: Participant[];
};
