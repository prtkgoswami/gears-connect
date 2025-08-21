import { UserProfile, Vehicle, Meetup } from "../types/models";

export const MEETUP_LIST: Meetup[] = [
  {
    id: "123456",
    organizer: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    createdAt: 1754893584,
    updatedAt: 1754893584,
    tags: [],
    vehicleTypes: [],
    title: "Sunday Morning Coffee & Cars",
    venue: {
      title: "Starbucks Parking Lot - Downtown",
      address: "Address Block",
      googleMapLink: "https://maps.google.com/?q=Starbucks+Downtown",
    },
    date: 1754893584,
    duration: "2 hours",
    description:
      "Join fellow car enthusiasts for a relaxed Sunday morning gathering. Bring your ride and enjoy great coffee while admiring a diverse collection of vehicles. From daily drivers to weekend warriors, all cars are welcome in this friendly, family-oriented event. Perfect for networking and sharing automotive passion.",
    isPrivate: false,
    cost: 0,
    participationLimit: 50,
    rules: "No burnouts, respect the venue, clean up after yourself",
    participants: [
      {
        userId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
        vehicles: ["1234", "4567"],
        status: "confirmed",
        joinedAt: 1754893584
      }
    ],
  },
  {
    id: "234567",
    organizer: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    createdAt: 1754893584,
    updatedAt: 1754893584,
    tags: [],
    vehicleTypes: [],
    title: "Track Day at Willow Springs",
    venue: {
      title: "Willow Springs International Raceway",
      address: "Address Block",
      googleMapLink:
        "https://maps.google.com/?q=Willow+Springs+International+Raceway",
    },
    date: 1754893584,
    duration: "8 hours",
    description:
      "Experience the thrill of driving your car at its limits on a professional race track. This full-day event includes multiple track sessions, professional instruction, and technical inspection. Perfect for enthusiasts wanting to improve their driving skills in a safe, controlled environment.",
    isPrivate: true,
    cost: 250,
    participationLimit: 2,
    rules: "Helmet required, tech inspection mandatory, no passengers",
    participants: [
        {
            userId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo1",
            vehicles: ["1234", "4567"],
            status: "confirmed",
            joinedAt: 1754893584
        },
        {
            userId: "1etf6iqAPOP2Dz9jUQy2rbnqdj32",
            vehicles: ["1234", "4567"],
            status: "pending",
            joinedAt: 1754893584
        }
    ],
  },
  {
    id: "345678",
    organizer: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    createdAt: 1754893584,
    updatedAt: 1754893584,
    tags: [],
    vehicleTypes: ["cars", "bikes"],
    title: "Cars & Coffee Monthly Meet",
    venue: {
      title: "Central Park Plaza",
      address: "Address Block",
      googleMapLink: "https://maps.google.com/?q=Central+Park+Plaza",
    },
    date: 1754893584,
    duration: "3 hours",
    description:
      "Our largest monthly gathering brings together car enthusiasts from all walks of life. From classic muscle cars to modern supercars, vintage imports to custom builds - diversity is celebrated. Enjoy coffee, pastries, and great conversations while exploring an incredible variety of automotive craftsmanship.",
    isPrivate: false,
    cost: 0,
    participationLimit: 100,
    rules: "All cars welcome, no racing, family-friendly event",
    participants: [
        {
          userId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
          vehicles: ["1234", "4567"],
          status: "confirmed",
          joinedAt: 1754893584
        }
    ],
  },
  {
    id: "456789",
    organizer: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    createdAt: 1754893584,
    updatedAt: 1754893584,
    tags: ["suv", "offroad", "trucks"],
    vehicleTypes: ["cars", "bikes"],
    title: "Mountain Drive & Lunch",
    venue: {
      title: "Scenic Mountain Road - Starting at Base Camp",
      address: "Address Block",
      googleMapLink:
        "https://maps.google.com/?q=Scenic+Mountain+Road+Base+Camp",
    },
    date: 1754893584,
    duration: "6 hours",
    description:
      "Escape the city for a breathtaking mountain drive through winding roads and stunning vistas. This guided convoy experience includes scenic photo stops, driving tips for mountain roads, and concludes with a delicious group lunch at a mountaintop restaurant with panoramic views.",
    isPrivate: false,
    cost: 25,
    participationLimit: 20,
    rules: "Keep group together, obey speed limits, lunch included",
    participants: [
        {
          userId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
          vehicles: ["1234", "4567"],
          status: "confirmed",
          joinedAt: 1754893584
        }
    ],
  },
  {
    id: "123456",
    organizer: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    createdAt: 1754893584,
    updatedAt: 1754893584,
    tags: ["exotics"],
    vehicleTypes: ["cars"],
    title: "Exotic Car Show & Dinner",
    venue: {
      title: "Luxury Hotel Ballroom & Valet",
      address: "Address Block",
      googleMapLink: "https://maps.google.com/?q=Luxury+Hotel+Ballroom",
    },
    date: 1754893584,
    duration: "4 hours",
    description:
      "An exclusive evening celebrating the pinnacle of automotive engineering and design. This upscale event features rare supercars, luxury vehicles, and exotic imports. Enjoy fine dining, networking with fellow collectors, and the opportunity to get up close with some of the world's most desirable automobiles.",
    isPrivate: true,
    cost: 150,
    participationLimit: 40,
    rules:
      "Exotic cars only (Ferrari, Lamborghini, McLaren, etc.), formal attire, valet parking included",
    participants: [
    ],
  },
];

export const VEHICLE_LIST: Vehicle[] = [
  {
    id: "1234",
    ownerId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    ownerName: "Pratik Goswami",
    make: "Honda",
    model: "Accord",
    trim: "2.0T Sport",
    year: 2018,
    images: ["/images/accord-front.png"],
    isModified: true,
    description:
      "The Honda Accord 2.0T Sport combines premium refinement with serious performance. Its 2.0L turbocharged engine delivers 252 hp through a slick 10-speed automatic, offering smooth, confident acceleration. With its sporty design, spacious interior, adaptive suspension, and daily usability, it’s a perfect blend of comfort and speed — equally at home cruising highways or taking on twisty roads with a grin.",
    modDescription:
      "1. New paint job\n2. New wheels\n3. New exhaust system\n4. New suspension\n5. New brakes\n6. New interior\n7. New engine\n1. New paint job\n2. New wheels\n3. New exhaust system\n4. New suspension\n5. New brakes\n6. New interior\n7. New engine\n1. New paint job\n2. New wheels\n3. New exhaust system\n4. New suspension\n5. New brakes\n6. New interior\n7. New engine",
    speed: 5.5,
    torque: 320,
    power: 250,
    type: "car",
    createdAt: 1754893584,
    updatedAt: 1754893584,
  },
  {
    id: "2345",
    ownerId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    ownerName: "Pratik Goswami",
    make: "Honda",
    model: "Jazz",
    trim: "Sport",
    year: 2009,
    images: [],
    isModified: false,
    description:
      "The Honda Jazz Sport redefines what a compact hatchback can do. Powered by a responsive i-VTEC engine and paired with paddle shifters, it delivers a surprisingly engaging drive. With clever interior packaging, Magic Seats, and sporty styling cues, the Jazz offers exceptional practicality without compromising on style or driving fun — a true urban warrior with everyday versatility and unmistakable Honda reliability.",
    speed: 12.9,
    torque: 110,
    power: 89,
    type: "car",
    createdAt: 1754893584,
    updatedAt: 1754893584,
  },
  {
    id: "3456",
    ownerId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    ownerName: "Pratik Goswami",
    make: "Volkswagen",
    model: "Polo",
    trim: "GT TSI",
    year: 2019,
    images: ["/images/polo-front.png"],
    isModified: false,
    description:
      "The Volkswagen Polo GT TSI is the definitive hot hatch — compact, classy, and exciting to drive. Its 1.0L turbocharged petrol engine paired with the lightning-quick DSG transmission offers a spirited performance and smooth cruising. Premium interiors, a solid Euro build, and sharp dynamics make it a driver’s favorite. Whether darting through city traffic or attacking open roads, the GT TSI delivers fun with refinement.",
    speed: 9.7,
    torque: 175,
    power: 109,
    type: "car",
    createdAt: 1754893584,
    updatedAt: 1754893584,
  },
  {
    id: "4567",
    ownerId: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
    ownerName: "Pratik Goswami",
    make: "Tata",
    model: "Harrier",
    trim: "Black Edition",
    year: 2023,
    images: ["/images/harrier-front.png"],
    isModified: false,
    description:
      "The Tata Harrier Black Edition oozes attitude and road presence with its all-black theme and bold design language. Powered by a refined 2.0L Kryotec diesel engine, it delivers strong torque and highway stability. Inside, it offers a plush, tech-packed cabin with ample space and premium touches. Built on Land Rover’s OmegaArc platform, the Harrier balances ruggedness with sophistication — a true flagship SUV from Tata.",
    speed: 6.3,
    torque: 350,
    power: 167.67,
    type: "car",
    createdAt: 1754893584,
    updatedAt: 1754893584,
  },
];

export const BRAND_LIST = [
  "Honda",
  "Volkswagen",
  "Toyota",
  "Alfa Romeo",
  "Aston Martin",
  "Hyundai",
  "Genesis",
  "Lexus",
  "Acura",
  "Audi",
  "Skoda",
  "Ferrari",
  "Lamborghini",
  "Maserati",
  "Mercedes Benz",
  "BMW",
  "Tata",
  "Mahindra",
  "Nissan",
  "Koenigsseg",
  "Bugatti",
  "Fiat",
  "Pagani",
  "Renault",
  "Suzuki",
];

export const USER_PROFILE: UserProfile = {
  uid: "1etf6iqAPOP2Dz9jUQy2rbnqdjo2",
  name: "Pratik Goswami",
  description:
    "Car enthusiast, track day regular, and lover of all things automotive. Always looking for the next great drive and new friends to share the passion!",
  email: "pratikgoswami8@gmail.com",
  socials: {
    youtube: "https://www.youtube.com/watch?v=9qZPbd-YYvo",
    instagram: "https://www.instagram.com/prtkgoswami8/"
  },
  statistics: {
    vehiclesOwned: VEHICLE_LIST.length,
    eventsAttended: 12,
    eventsHosted: 3,
  },
  vehicleIds: ["1234", "2345", "3456", "4567"],
  createdAt: 1754893584,
  lastActive: 1754893584,
};
