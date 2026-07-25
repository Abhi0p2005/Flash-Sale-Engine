import requests, re, os

def extract_amazon_images(asin, outdir, product_slug):
    url = f"https://www.amazon.in/gp/product/{asin}"
    r = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
    }, timeout=15)
    if r.status_code != 200:
        print(f"  Status {r.status_code}")
        return
    
    # Find all Amazon image URLs
    pattern = r'https://m\.media-amazon\.com/images/I/[^"\'\\ >]+'
    urls = re.findall(pattern, r.text)
    
    # Deduplicate to base image IDs
    image_ids = set()
    for u in urls:
        u = u.split('?')[0]
        u = u.split('._')[0]
        if u.endswith('.jpg') or u.endswith('.png') or u.endswith('.webp'):
            base = u.rsplit('.', 1)[0]
            image_ids.add(base)
    
    print(f"  Found {len(image_ids)} unique image bases")
    
    # Download at full resolution
    os.makedirs(outdir, exist_ok=True)
    count = 0
    for img_id in sorted(image_ids):
        img_url = img_id + '._AC_SL1500_.jpg'
        try:
            resp = requests.get(img_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }, timeout=15)
            if resp.status_code == 200 and len(resp.content) > 5000:
                ext = 'jpg'
                if 'png' in resp.headers.get('content-type', ''):
                    ext = 'png'
                fname = f"{product_slug}_amz_{count+1}.{ext}"
                fpath = os.path.join(outdir, fname)
                with open(fpath, 'wb') as f:
                    f.write(resp.content)
                print(f"  Downloaded {len(resp.content)}b -> {fname}")
                count += 1
        except Exception as e:
            print(f"  Error: {e}")
    print(f"  Total: {count} images")

# Products with their ASINs and categories
PRODUCTS = [
    # ASIN, product_slug, category
    ("B0DZDDV7GC", "macbook_air_m4", "laptops"),
    ("B0DZNP6L5B", "nothing_phone_3a", "mobiles"),
    # Add more ASINs as we find them
]

base = os.path.join(os.path.dirname(__file__), "frontend/public/product_images")
for asin, slug, cat in PRODUCTS:
    print(f"\n=== {asin} ({slug}) ===")
    outdir = os.path.join(base, cat)
    extract_amazon_images(asin, slug, outdir)
