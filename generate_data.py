"""
Generate complete product dataset from existing demo images.
Creates frontend/public/product_images/ (organized by category)
and frontend/scraped_final.json with ratings, reviews, specs.

Run when Croma scraper is inaccessible:
    python generate_data.py
"""

import json
import random
import shutil
from pathlib import Path
from PIL import Image

PRODUCTS = [
    # Mobiles
    {"id": 1, "brand": "Apple", "name": "iPhone 17 Pro Max (256 GB, Desert Titanium)", "category": "mobiles", "img": "iphone17promax.png", "price": 159900, "orig": 169900, "rating": 4.6, "reviews": 2843, "specs": {"Display": "6.9\" LTPO Super Retina XDR OLED", "Processor": "A19 Bionic", "RAM": "8 GB", "Storage": "256 GB", "Battery": "5000 mAh", "Camera": "48+48+12 MP Triple"}, "stock": 15},
    {"id": 2, "brand": "Samsung", "name": "Galaxy S26 Ultra (512 GB, Titanium Black)", "category": "mobiles", "img": "s26ultra.png", "price": 134999, "orig": 144999, "rating": 4.5, "reviews": 1967, "specs": {"Display": "6.9\" Dynamic AMOLED 3X", "Processor": "Exynos 2600", "RAM": "16 GB", "Storage": "512 GB", "Battery": "6000 mAh", "Camera": "200+50+12+10 MP Quad"}, "stock": 22},
    {"id": 3, "brand": "Google", "name": "Pixel 10 Pro (256 GB, Obsidian)", "category": "mobiles", "img": "pixel10pro.png", "price": 89999, "orig": 95999, "rating": 4.7, "reviews": 812, "specs": {"Display": "6.7\" LTPO OLED 120Hz", "Processor": "Tensor G6", "RAM": "16 GB", "Storage": "256 GB", "Battery": "5200 mAh", "Camera": "50+48+48 MP Triple"}, "stock": 8},
    {"id": 4, "brand": "OnePlus", "name": "OnePlus 15 (256 GB, Ceramic White)", "category": "mobiles", "img": "oneplus15.png", "price": 69999, "orig": 74999, "rating": 4.4, "reviews": 1534, "specs": {"Display": "6.82\" LTPO AMOLED 120Hz", "Processor": "Snapdragon 8 Gen 5", "RAM": "12 GB", "Storage": "256 GB", "Battery": "5500 mAh", "Camera": "50+50+64 MP Triple"}, "stock": 30},
    {"id": 5, "brand": "Nothing", "name": "Phone (3) (256 GB, Black)", "category": "mobiles", "img": "nothingphone3.png", "price": 49999, "orig": 54999, "rating": 4.3, "reviews": 624, "specs": {"Display": "6.7\" LTPO AMOLED 120Hz", "Processor": "Snapdragon 8s Gen 4", "RAM": "12 GB", "Storage": "256 GB", "Battery": "5000 mAh", "Camera": "50+50 MP Dual"}, "stock": 5},
    # Laptops
    {"id": 6, "brand": "Apple", "name": "MacBook Air M5 (16 GB, 512 GB SSD, Midnight)", "category": "laptops", "img": "macbookair-m5.png", "price": 129900, "orig": 139900, "rating": 4.8, "reviews": 1102, "specs": {"Display": "15.3\" Liquid Retina", "Processor": "Apple M5", "RAM": "16 GB", "Storage": "512 GB SSD", "Battery": "Up to 18 hours", "Weight": "1.24 kg"}, "stock": 18},
    {"id": 7, "brand": "Apple", "name": "MacBook Pro Neo (18 GB, 1 TB SSD, Space Black)", "category": "laptops", "img": "macbook-neo.png", "price": 199900, "orig": 209900, "rating": 4.7, "reviews": 876, "specs": {"Display": "16.2\" Mini-LED 120Hz", "Processor": "Apple M5 Pro Max", "RAM": "18 GB", "Storage": "1 TB SSD", "Battery": "Up to 22 hours", "Weight": "2.14 kg"}, "stock": 3},
    {"id": 8, "brand": "ASUS", "name": "ROG Strix G16 (32 GB, 1 TB SSD, RTX 5090)", "category": "laptops", "img": "rog-strix-g16.png", "price": 189999, "orig": 199999, "rating": 4.5, "reviews": 456, "specs": {"Display": "16\" QHD+ 240Hz", "Processor": "Intel Core Ultra 9 285HX", "RAM": "32 GB", "Storage": "1 TB SSD", "GPU": "NVIDIA RTX 5090 16 GB", "Weight": "2.5 kg"}, "stock": 7},
    {"id": 9, "brand": "Dell", "name": "XPS 14 (16 GB, 1 TB SSD, Platinum)", "category": "laptops", "img": "xps14.png", "price": 139999, "orig": 149999, "rating": 4.4, "reviews": 345, "specs": {"Display": "14.5\" OLED 3.5K Touch", "Processor": "Intel Core Ultra 7 265H", "RAM": "16 GB", "Storage": "1 TB SSD", "Battery": "70 Wh", "Weight": "1.52 kg"}, "stock": 12},
    {"id": 10, "brand": "HP", "name": "OmniBook 5 (16 GB, 512 GB SSD)", "category": "laptops", "img": "omnibook5.png", "price": 109999, "orig": 114999, "rating": 4.2, "reviews": 289, "specs": {"Display": "14\" 2.8K OLED 120Hz", "Processor": "AMD Ryzen 9 8950HS", "RAM": "16 GB", "Storage": "512 GB SSD", "Battery": "60 Wh", "Weight": "1.38 kg"}, "stock": 25},
    # TVs
    {"id": 11, "brand": "Samsung", "name": "Neo QLED 65\" 8K Smart TV (2026)", "category": "tvs", "img": "neoqled65.png", "price": 189999, "orig": 219999, "rating": 4.6, "reviews": 723, "specs": {"Display": "65\" Neo QLED 8K", "Resolution": "7680 x 4320", "Refresh Rate": "240 Hz", "Audio": "90W 6.2.4ch Dolby Atmos", "Smart TV": "Tizen 8.0", "HDMI": "4x HDMI 2.2"}, "stock": 10},
    {"id": 12, "brand": "LG", "name": "OLED 55\" C5 4K Smart TV (2026)", "category": "tvs", "img": "lg-tv.png", "price": 113999, "orig": 139999, "rating": 4.5, "reviews": 891, "specs": {"Display": "55\" OLED evo 4K", "Resolution": "3840 x 2160", "Refresh Rate": "144 Hz", "Audio": "60W 4.2ch Dolby Atmos", "Smart TV": "webOS 25", "HDMI": "4x HDMI 2.1"}, "stock": 14},
    # Audio
    {"id": 13, "brand": "Sony", "name": "WH-1000XM5 Wireless ANC Headphones", "category": "audio", "img": "wh1000xm5.png", "price": 29990, "orig": 34990, "rating": 4.7, "reviews": 3456, "specs": {"Driver": "30 mm", "ANC": "Dual Noise Sensor", "Battery": "40 hours", "Codec": "LDAC, AAC, SBC", "Weight": "254 g", "Connectivity": "Bluetooth 5.3"}, "stock": 40},
    {"id": 14, "brand": "Bose", "name": "QuietComfort Ultra Wireless ANC Headphones", "category": "audio", "img": "bose-qc-ultra.png", "price": 34990, "orig": 39990, "rating": 4.6, "reviews": 2891, "specs": {"Driver": "35 mm", "ANC": "Adjustable Quiet/Aware", "Battery": "32 hours", "Codec": "SBC, AAC, aptX", "Weight": "264 g", "Connectivity": "Bluetooth 5.3"}, "stock": 23},
    {"id": 15, "brand": "boAt", "name": "Airdopes 141 Neo TWS Earbuds", "category": "audio", "img": "airdopes141neo.png", "price": 1999, "orig": 4990, "rating": 4.2, "reviews": 12456, "specs": {"Driver": "13 mm", "Battery": "60 hours (with case)", "Waterproof": "IPX5", "Codec": "SBC", "Weight": "4.2 g per bud", "Connectivity": "Bluetooth 5.3"}, "stock": 100},
    {"id": 16, "brand": "OnePlus", "name": "Buds Pro 3 Wireless ANC Earbuds", "category": "audio", "img": "buds-pro-3.png", "price": 11999, "orig": 14999, "rating": 4.4, "reviews": 8765, "specs": {"Driver": "11+6 mm Dual", "ANC": "Adaptive ANC 48dB", "Battery": "44 hours (with case)", "Waterproof": "IP55", "Weight": "4.8 g per bud", "Connectivity": "Bluetooth 5.3"}, "stock": 55},
    {"id": 17, "brand": "Apple", "name": "AirPods Pro 2 with USB-C (2026)", "category": "audio", "img": "airpods-pro2.png", "price": 24900, "orig": 29900, "rating": 4.8, "reviews": 9823, "specs": {"Driver": "Apple-designed H3 chip", "ANC": "Adaptive Transparency", "Battery": "36 hours (with case)", "Waterproof": "IPX4", "Weight": "5.3 g per bud", "Connectivity": "Bluetooth 5.3"}, "stock": 30},
    # Kitchen
    {"id": 18, "brand": "Philips", "name": "OneChef Smart All-in-One Cooking System", "category": "kitchen", "img": "airfryer.png", "price": 24995, "orig": 29995, "rating": 4.3, "reviews": 1456, "specs": {"Capacity": "4.5 L", "Power": "1800 W", "Presets": "15 Smart Programs", "Temperature": "80-200°C", "Wifi": "Yes", "Material": "Stainless Steel"}, "stock": 20},
    {"id": 19, "brand": "Bajaj", "name": "OTG 48 L Convection Microwave Oven", "category": "kitchen", "img": "bajaj-otg.png", "price": 8495, "orig": 9995, "rating": 4.1, "reviews": 2345, "specs": {"Capacity": "48 L", "Power": "1600 W", "Convection": "Yes", "Temperature": "50-250°C", "Timer": "Up to 120 min", "Material": "Stainless Steel"}, "stock": 35},
    {"id": 20, "brand": "Prestige", "name": "Iris Mixer Grinder 750W", "category": "kitchen", "img": "prestige-iris-mixer.png", "price": 4295, "orig": 5495, "rating": 4.2, "reviews": 5678, "specs": {"Power": "750 W", "Jars": "3 (SS + SS + PP)", "Speed": "3 Speed + Pulse", "Material": "Stainless Steel Blades", "Warranty": "2 Years", "Weight": "4.2 kg"}, "stock": 60},
    # Grooming
    {"id": 21, "brand": "Philips", "name": "OneBlade Face & Body Trimmer", "category": "grooming", "img": "oneblade.png", "price": 2995, "orig": 3995, "rating": 4.3, "reviews": 9891, "specs": {"Blade": "Dual Protection", "Battery": "60 min cordless", "Waterproof": "IPX7 (washable)", "Settings": "3 Length combs", "Charging": "USB-C, 8 hr full", "Weight": "120 g"}, "stock": 80},
    {"id": 22, "brand": "Dyson", "name": "Airwrap Multi-Styler Complete (Nickel/Copper)", "category": "grooming", "img": "dyson-airwrap.png", "price": 42990, "orig": 47990, "rating": 4.5, "reviews": 1234, "specs": {"Motor": "V9 Digital", "Attachments": "6 Styling heads", "Heat": "Intelligent heat control", "Speed": "3 speeds", "Cable": "2.7 m", "Weight": "660 g"}, "stock": 6},
    # Refrigerators
    {"id": 23, "brand": "Samsung", "name": "653 L 3-Door French Door Refrigerator", "category": "refrigerators", "img": "samsung-653l.png", "price": 89990, "orig": 99990, "rating": 4.4, "reviews": 678, "specs": {"Capacity": "653 L", "Type": "French Door 3-Door", "Energy Rating": "5 Star", "Cooling": "Digital Inverter Twin Cooling+", "Convertible": "Yes", "Warranty": "20 Years Compressor"}, "stock": 9},
    {"id": 24, "brand": "Whirlpool", "name": "192 L 2-Door Direct Cool Refrigerator", "category": "refrigerators", "img": "whirlpool192l.png", "price": 27990, "orig": 32990, "rating": 4.1, "reviews": 3456, "specs": {"Capacity": "192 L", "Type": "Direct Cool 2-Door", "Energy Rating": "3 Star", "Cooling": "IntelliCool", "Convertible": "No", "Warranty": "10 Years Compressor"}, "stock": 45},
    {"id": 25, "brand": "LG", "name": "242 L 2-Door Frost-Free Refrigerator", "category": "refrigerators", "img": "lg-242l.jpg", "price": 35990, "orig": 40990, "rating": 4.3, "reviews": 2341, "specs": {"Capacity": "242 L", "Type": "Frost-Free 2-Door", "Energy Rating": "4 Star", "Cooling": "Smart Inverter", "Convertible": "Yes", "Warranty": "10 Years Compressor"}, "stock": 28},
]

CATEGORY_DIRS = set(p["category"] for p in PRODUCTS)
SOURCE_DIR = Path("frontend/public/images")
DEST_DIR = Path("frontend/public/product_images")


def generate_reviews(brand, product_name, count_range=(3, 8)):
    names = ["Arjun M.", "Priya S.", "Rahul K.", "Ananya D.", "Vikram P.",
             "Neha G.", "Siddharth R.", "Kavita J.", "Rohit B.", "Meera I.",
             "Amit V.", "Sana Q.", "Deepak T.", "Isha L.", "Karan N."]
    titles = ["Great product!", "Worth the money", "Excellent quality",
              "Good value for price", "Better than expected", "Solid performance",
              "Happy with purchase", "Amazing features", "Decent build",
              "Premium experience", "Highly recommended", "Does the job",
              "Outstanding!", "Good but overpriced", "Perfect for daily use"]
    texts = ["Been using this for a week. Build quality is solid. Would recommend.",
             "Upgraded from my old device and the difference is night and day.",
             "Good product overall. Battery life could be better but everything else works.",
             "Excellent quality and fast delivery. Packaging was secure.",
             "I did a lot of research before buying this and I'm glad I chose this.",
             "The features are impressive for the price. Definitely good value.",
             "After a month of use, I can confidently say this is a great buy.",
             "Works as advertised. No complaints. Would buy again if needed."]
    count = random.randint(*count_range)
    reviews = []
    for name in random.sample(names, min(count, len(names))):
        reviews.append({
            "title": random.choice(titles),
            "author": name,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "text": random.choice(texts),
        })
    return reviews


def generate_review_count(rating):
    base = random.randint(50, 300)
    if rating >= 4.5:
        return base * 3
    elif rating >= 4.0:
        return base * 2
    return base


def main():
    for cat_dir in CATEGORY_DIRS:
        (DEST_DIR / cat_dir).mkdir(parents=True, exist_ok=True)

    dataset = []
    for p in PRODUCTS:
        src = SOURCE_DIR / p["img"]
        if not src.exists():
            print(f"WARNING: Source image not found: {src}")
            continue

        ext = Path(p["img"]).suffix

        try:
            img = Image.open(src).convert("RGBA")
        except Exception as e:
            print(f"  ! Pillow failed ({e}), falling back to copy-only")
            ext = Path(p["img"]).suffix
            simple_dest = DEST_DIR / p["category"] / f"{p['id']:03d}_1{ext}"
            shutil.copy2(src, simple_dest)
            paths = [f"/product_images/{p['category']}/{p['id']:03d}_1{ext}"]
            print(f"  [1/1] {p['img']} -> {p['id']:03d}_1{ext} (copy fallback)")
            img = None

        if img is not None:
            def save_image(pil_img, idx, fmt_ext):
                fname = f"{p['id']:03d}_{idx}{fmt_ext}"
                out = DEST_DIR / p["category"] / fname
                out_pil = pil_img.convert("RGB")
                out_pil.save(out, quality=92)
                return f"/product_images/{p['category']}/{fname}"

            paths = [save_image(img, 1, ext)]
            print(f"  [1/1] {p['img']} -> {p['id']:03d}_1{ext} (original)")

            img.close()

        reviews = generate_reviews(p["brand"], p["name"])
        review_count = p.get("reviews", len(reviews))

        dataset.append({
            "id": p["id"],
            "brand": p["brand"],
            "name": p["name"],
            "originalPrice": p["orig"],
            "salePrice": p["price"],
            "price": p["price"],
            "images": paths,
            "image": paths[0],
            "specifications": p["specs"],
            "rating": p["rating"],
            "reviewCount": review_count,
            "reviews": reviews,
            "category": p["category"],
            "stockLeft": p["stock"],
        })

    with open("frontend/scraped_final.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(dataset)} products to frontend/scraped_final.json")
    print("Done!")


if __name__ == "__main__":
    main()