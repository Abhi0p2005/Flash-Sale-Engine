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
  // Mobiles
  { id: 1, brand: 'Vivo', name: 'Vivo V40 5G', originalPrice: 39999, salePrice: 31499, image: '/images/iphone13.png', category: 'mobiles', stockLeft: 5 },
  { id: 2, brand: 'Apple', name: 'iPhone 6', originalPrice: 35900, salePrice: 29900, image: '/images/iphone6.png', category: 'mobiles', stockLeft: 60 },
  { id: 3, brand: 'Apple', name: 'iPhone 13 Pro', originalPrice: 131900, salePrice: 109900, image: '/images/iphone13.png', category: 'mobiles', stockLeft: 56 },
  { id: 19, brand: 'Samsung', name: 'Galaxy S23', originalPrice: 75000, salePrice: 65000, image: '/images/s23.png', category: 'mobiles', stockLeft: 30 },
  
  // Laptops
  { id: 4, brand: 'Apple', name: 'MacBook Pro 14 Inch', originalPrice: 239900, salePrice: 199900, image: '/images/macbook.png', category: 'laptops', stockLeft: 24 },
  { id: 5, brand: 'Asus', name: 'Zenbook Pro', originalPrice: 215900, salePrice: 179900, image: '/images/zenbook.png', category: 'laptops', stockLeft: 45 },
  { id: 6, brand: 'Lenovo', name: 'Yoga 920', originalPrice: 131900, salePrice: 109900, image: '/images/yoga.png', category: 'laptops', stockLeft: 40 },
  { id: 20, brand: 'HP', name: 'Spectre x360', originalPrice: 145000, salePrice: 125000, image: '/images/hp.png', category: 'laptops', stockLeft: 15 },
  
  // Audio
  { id: 7, brand: 'Apple', name: 'AirPods', originalPrice: 15500, salePrice: 12900, image: '/images/airpods.png', category: 'audio', stockLeft: 67 },
  { id: 8, brand: 'Apple', name: 'AirPods Max', originalPrice: 65900, salePrice: 54900, image: '/images/airpodsmax.png', category: 'audio', stockLeft: 59 },
  { id: 9, brand: 'Beats', name: 'Flex Wireless', originalPrice: 5900, salePrice: 4900, image: '/images/beats.png', category: 'audio', stockLeft: 50 },
  { id: 21, brand: 'JBL', name: 'Flip 6 Speaker', originalPrice: 12000, salePrice: 9900, image: '/images/jbl.png', category: 'audio', stockLeft: 40 },

  // TVs
  { id: 10, brand: 'Sony', name: 'Bravia 55 inch 4K', originalPrice: 95000, salePrice: 82000, image: '/images/sony-tv.png', category: 'tvs', stockLeft: 6 },
  { id: 11, brand: 'Samsung', name: 'Crystal UHD 4K', originalPrice: 65000, salePrice: 55000, image: '/images/samsung-tv.png', category: 'tvs', stockLeft: 12 },
  { id: 22, brand: 'LG', name: 'OLED 65 inch', originalPrice: 180000, salePrice: 155000, image: '/images/lg-tv.png', category: 'tvs', stockLeft: 5 },

  // Refrigerators
  { id: 12, brand: 'LG', name: 'InstaView Refrigerator', originalPrice: 120000, salePrice: 95000, image: '/images/lg-fridge.png', category: 'refrigerators', stockLeft: 4 },
  { id: 13, brand: 'Samsung', name: 'Family Hub Fridge', originalPrice: 250000, salePrice: 210000, image: '/images/samsung-fridge.png', category: 'refrigerators', stockLeft: 2 },
  
  // Kitchen
  { id: 14, brand: 'Philips', name: 'Air Fryer XL', originalPrice: 15000, salePrice: 12000, image: '/images/airfryer.png', category: 'kitchen', stockLeft: 20 },
  { id: 15, brand: 'Philips', name: 'Juicer Mixer', originalPrice: 8000, salePrice: 6500, image: '/images/mixer.png', category: 'kitchen', stockLeft: 30 },

  // Grooming
  { id: 16, brand: 'Philips', name: 'Beard Trimmer 3000', originalPrice: 3000, salePrice: 2200, image: '/images/trimmer.png', category: 'grooming', stockLeft: 50 },
  { id: 17, brand: 'Braun', name: 'Electric Shaver', originalPrice: 4500, salePrice: 3800, image: '/images/shaver.png', category: 'grooming', stockLeft: 25 },

  // AC
  { id: 18, brand: 'Daikin', name: 'Inverter AC 1.5 Ton', originalPrice: 55000, salePrice: 48000, image: '/images/ac.png', category: 'ac', stockLeft: 10 }
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