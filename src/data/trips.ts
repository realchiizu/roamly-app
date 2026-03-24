import tokyoImg from "@/assets/tokyo.jpg";
import parisImg from "@/assets/paris.jpg";
import santoriniImg from "@/assets/santorini.jpg";

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
  icon: string;
}

export interface ItineraryDay {
  day: string;
  items: ItineraryItem[];
}

export interface PackingItem {
  id: string;
  name: string;
  packed: boolean;
}

export interface PackingCategory {
  name: string;
  items: PackingItem[];
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  date: string;
  image: string;
  itinerary: ItineraryDay[];
  packingList: PackingCategory[];
  gallery: string[];
}

export const initialTrips: Trip[] = [
  {
    id: "tokyo",
    destination: "Tokyo",
    country: "Japan",
    date: "2026-04-19",
    image: tokyoImg,
    itinerary: [
      {
        day: "Day 1",
        items: [
          { time: "08:00", title: "Arrive at Narita Airport", description: "Clear customs & take Narita Express to Shinjuku", icon: "✈️" },
          { time: "12:00", title: "Ramen at Ichiran", description: "Famous tonkotsu ramen in Shinjuku", icon: "🍜" },
          { time: "15:00", title: "Meiji Shrine", description: "Walk through the forested path to the iconic shrine", icon: "⛩️" },
          { time: "19:00", title: "Shibuya Crossing", description: "Experience the world's busiest intersection at night", icon: "🌃" },
        ],
      },
      {
        day: "Day 2",
        items: [
          { time: "09:00", title: "Tsukiji Outer Market", description: "Fresh sushi and street food for breakfast", icon: "🍣" },
          { time: "13:00", title: "TeamLab Borderless", description: "Immersive digital art museum", icon: "🎨" },
          { time: "18:00", title: "Akihabara", description: "Explore the electric town and anime culture", icon: "🎮" },
        ],
      },
    ],
    packingList: [
      {
        name: "Essentials",
        items: [
          { id: "t1", name: "Passport", packed: false },
          { id: "t2", name: "Travel Insurance Docs", packed: false },
          { id: "t3", name: "JR Rail Pass", packed: false },
          { id: "t4", name: "Yen Cash", packed: false },
        ],
      },
      {
        name: "Clothing",
        items: [
          { id: "t5", name: "Light Jacket", packed: false },
          { id: "t6", name: "Walking Shoes", packed: false },
          { id: "t7", name: "T-Shirts (x5)", packed: false },
          { id: "t8", name: "Jeans (x2)", packed: false },
        ],
      },
      {
        name: "Tech",
        items: [
          { id: "t9", name: "Camera + Charger", packed: false },
          { id: "t10", name: "Power Adapter (Type A)", packed: false },
          { id: "t11", name: "Portable WiFi", packed: false },
        ],
      },
    ],
    gallery: [],
  },
  {
    id: "paris",
    destination: "Paris",
    country: "France",
    date: "2026-06-15",
    image: parisImg,
    itinerary: [
      {
        day: "Day 1",
        items: [
          { time: "09:00", title: "Croissant at Café de Flore", description: "Classic Parisian breakfast on the Left Bank", icon: "🥐" },
          { time: "11:00", title: "Louvre Museum", description: "See the Mona Lisa and explore the grand galleries", icon: "🖼️" },
          { time: "16:00", title: "Seine River Cruise", description: "Golden hour boat ride past iconic landmarks", icon: "🚢" },
          { time: "20:00", title: "Eiffel Tower at Night", description: "Watch the tower sparkle on the hour", icon: "🗼" },
        ],
      },
    ],
    packingList: [
      {
        name: "Essentials",
        items: [
          { id: "p1", name: "Passport", packed: false },
          { id: "p2", name: "EU Travel Insurance", packed: false },
          { id: "p3", name: "Metro Pass", packed: false },
        ],
      },
      {
        name: "Clothing",
        items: [
          { id: "p4", name: "Trench Coat", packed: false },
          { id: "p5", name: "Comfortable Walking Shoes", packed: false },
          { id: "p6", name: "Evening Outfit", packed: false },
        ],
      },
    ],
    gallery: [],
  },
  {
    id: "santorini",
    destination: "Santorini",
    country: "Greece",
    date: "2026-08-10",
    image: santoriniImg,
    itinerary: [
      {
        day: "Day 1",
        items: [
          { time: "10:00", title: "Arrive at Thira Airport", description: "Transfer to Oia hotel with caldera views", icon: "✈️" },
          { time: "14:00", title: "Lunch at Ammoudi Bay", description: "Fresh seafood by the water", icon: "🐟" },
          { time: "18:30", title: "Oia Sunset", description: "Watch the famous sunset from the castle ruins", icon: "🌅" },
        ],
      },
    ],
    packingList: [
      {
        name: "Essentials",
        items: [
          { id: "s1", name: "Passport", packed: false },
          { id: "s2", name: "Sunscreen SPF 50", packed: false },
          { id: "s3", name: "Sunglasses", packed: false },
        ],
      },
      {
        name: "Clothing",
        items: [
          { id: "s4", name: "Swimsuit (x2)", packed: false },
          { id: "s5", name: "Linen Shirts", packed: false },
          { id: "s6", name: "Sandals", packed: false },
        ],
      },
    ],
    gallery: [],
  },
];
