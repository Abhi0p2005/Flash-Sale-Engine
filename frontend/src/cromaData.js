export const cromaCategories = [
  { id: 'mobiles', name: 'Mobiles', icon: '📱' },
  { id: 'tvs', name: 'Televisions', icon: '📺' },
  { id: 'laptops', name: 'Laptops', icon: '💻' },
  { id: 'ac', name: 'Air Conditioners', icon: '❄️' },
  { id: 'refrigerators', name: 'Refrigerators', icon: '🧊' },
  { id: 'audio', name: 'Headphones & Earphones', icon: '🎧' },
  { id: 'kitchen', name: 'Kitchen Appliances', icon: '🍳' },
  { id: 'grooming', name: 'Grooming', icon: '🪮' }
];

export const cromaProducts = [
  {
    id: 1,
    brand: 'vivo',
    name: 'X300 FE 5G',
    originalPrice: 129999,
    salePrice: 71999,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', // Placeholder green smartphone
    category: 'mobiles'
  },
  {
    id: 2,
    brand: 'vivo',
    name: 'V40 5G',
    originalPrice: 39999,
    salePrice: 32199,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300', // Placeholder teal smartphone
    category: 'mobiles'
  },
  {
    id: 3,
    brand: 'vivo',
    name: 'V70 5G',
    originalPrice: 50000,
    salePrice: 43999,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300', // Placeholder rose smartphone
    category: 'mobiles'
  },
  {
    id: 4,
    brand: 'oppo',
    name: 'K14x 5G',
    originalPrice: 19999,
    salePrice: 18144,
    image: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=300', // Placeholder white/blue smartphone
    category: 'mobiles'
  }
];

export const smartphoneBrands = [
  { name: 'Apple', logo: '🍏', bgColor: 'from-orange-600 to-amber-900' },
  { name: 'OnePlus', logo: '1️⃣+', bgColor: 'from-gray-700 to-red-900' },
  { name: 'Samsung', logo: '🌌', bgColor: 'from-purple-600 to-indigo-950' },
  { name: 'Vivo', logo: '🔵', bgColor: 'from-blue-600 to-cyan-950' }
];

export const MOCK_USER_PROFILE = {
  name: "Abhishek Kamat",
  email: "abhishek.kamat@coep.edu.in",
  phone: "+91 98765 43210",
  addresses: [
    { id: 1, type: "Home", detail: "Hostel 3, COEP Technological University, Shivajinagar, Pune - 411005" },
    { id: 2, type: "Office", detail: "Capulus Tech Solutions, Baner, Pune - 411045" }
  ]
};