import requests, re, json, os, sys
from urllib.parse import quote, urlparse

def search_flipkart(query):
    url = f"https://www.flipkart.com/search?q={quote(query)}"
    r = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }, timeout=15)
    if r.status_code != 200:
        print(f"  Status {r.status_code}")
        return []
    cdns = re.findall(r'https://rukminim2\.flixcart\.com/image/\d+/\d+[^"\' >]+', r.text)
    unique = list(set(cdns))
    print(f"  Found {len(unique)} CDN URLs")
    return unique

def download_image(url, outpath, size=832):
    # Upgrade from 128/128 to size/size
    hi_res = url.replace('/image/128/128', f'/image/{size}/{size}')
    r = requests.get(hi_res, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }, timeout=15)
    if r.status_code == 200:
        ext = r.headers.get('content-type', '').split('/')[-1]
        if ext == 'jpeg': ext = 'jpg'
        outpath = outpath.rsplit('.', 1)[0] + '.' + ext
        with open(outpath, 'wb') as f:
            f.write(r.content)
        print(f"  Downloaded {len(r.content)} bytes -> {outpath}")
        return True
    else:
        print(f"  Failed to download {hi_res}: {r.status_code}")
        return False

# Products to search for (name, search_query, output_dir)
PRODUCTS = [
    ("iPhone 17 Pro Max", "apple iphone 16 pro max desert titanium 256", "mobiles"),
    ("SAMSUNG Galaxy S26 Ultra", "samsung galaxy s25 ultra 256gb", "mobiles"),
    ("Google Pixel 10", "google pixel 9 pro 256gb", "mobiles"),
    ("OnePlus 15", "oneplus 13 arctic dawn 256", "mobiles"),
    ("Phone (3)", "nothing phone 3a black 256", "mobiles"),
    ("MacBook Air M5", "apple macbook air m4 starlight", "laptops"),
    ("MacBook Pro Neo", "apple macbook pro m4 space black", "laptops"),
    ("ROG Strix G16", "asus rog strix g16 rtx 5070", "laptops"),
    ("XPS 14", "dell xps 14 intel core ultra", "laptops"),
    ("OmniBook 5", "hp omnibook intel core ultra", "laptops"),
    ("Neo QLED 65\" 8K", "samsung neo qled 8k 65 inch 2025", "tvs"),
    ("OLED 55\" C5", "lg oled c4 55 inch 4k", "tvs"),
    ("WH-1000XM5", "sony wh-1000xm5 wireless headphones", "audio"),
    ("QuietComfort Ultra", "bose quietcomfort ultra headphones", "audio"),
    ("Airdopes 141 Neo", "boAt airdopes 141 tws earbuds", "audio"),
    ("Buds Pro 3", "realme buds air 6 pro tws earbuds", "audio"),
    ("AirPods Pro 2", "apple airpods pro 2 usb c", "audio"),
    ("OTG 48 L Microwave", "morphy richards 48 litre convection microwave", "kitchen"),
    ("Iris Mixer Grinder 750W", "preethi mixer grinder 750w", "kitchen"),
    ("OneBlade Trimmer", "philips oneblade face body trimmer", "grooming"),
    ("Airwrap Multi-Styler", "dyson airwrap multi styler complete", "grooming"),
    ("653 L French Door Fridge", "samsung 653 litre french door refrigerator 2025", "refrigerators"),
    ("192 L Direct Cool Fridge", "samsung 192 litre direct cool refrigerator", "refrigerators"),
]

img_dir = "frontend/public/product_images"
base = os.path.join(os.path.dirname(__file__), img_dir)

for pname, q, cat in PRODUCTS:
    print(f"\n=== {pname} ===")
    urls = search_flipkart(q)
    if not urls:
        print("  No CDN URLs found, skipping")
        continue
    cat_dir = os.path.join(base, cat)
    os.makedirs(cat_dir, exist_ok=True)
    for i, url in enumerate(urls[:8]):
        slug = pname.lower().replace(" ", "_").replace('"', '').replace("'", '')[:20]
        outpath = os.path.join(cat_dir, f"{slug}_fk_{i+1}.jpg")
        download_image(url, outpath)
