"""
Croma Product Scraper — FlashEngine Marketplace
=================================================
Scrapes product listings from Croma.com across 8 categories.
Extracts images (from LD+JSON), specs, ratings, and downloads images.

Usage:
  pip install -r scraper_requirements.txt
  python -m playwright install chromium
  python scraper.py [--visible] [--max-products N] [--category CAT]

Output:
  - scraped_products.json
  - Images in frontend/public/product_images/<category>/
"""

import asyncio
import json
import logging
import os
import random
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, TimeoutError as PWTimeout

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("croma-scraper")

FRONTEND_ASSETS = Path("frontend/public/product_images")

VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".avi", ".mkv", ".flv", ".m4v", ".wmv", ".3gp"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp", ".tiff"}

CATEGORIES = {
    "mobiles": {
        "id": "mobiles",
        "listing_urls": [
            "https://www.croma.com/phones-wearables/mobile-phones/c/10",
        ],
    },
    "tvs": {
        "id": "tvs",
        "listing_urls": [
            "https://www.croma.com/televisions-accessories/c/997",
        ],
    },
    "laptops": {
        "id": "laptops",
        "listing_urls": [
            "https://www.croma.com/computers-tablets/c/3",
        ],
    },
    "ac": {
        "id": "ac",
        "listing_urls": [
            "https://www.croma.com/home-appliances/c/5",
        ],
        "url_filter": ["-ac-", "-air-conditioner-", "split-ac"],
    },
    "refrigerators": {
        "id": "refrigerators",
        "listing_urls": [
            "https://www.croma.com/home-appliances/refrigerators-freezers/c/47",
        ],
    },
    "audio": {
        "id": "audio",
        "listing_urls": [
            "https://www.croma.com/audio-video/c/292",
        ],
    },
    "kitchen": {
        "id": "kitchen",
        "listing_urls": [
            "https://www.croma.com/kitchen-appliances/c/864",
        ],
    },
    "grooming": {
        "id": "grooming",
        "listing_urls": [
            "https://www.croma.com/grooming-wellness/c/1021",
        ],
    },
}

CATEGORY_ID_MAP = {
    "mobiles": "mobiles",
    "tvs": "tvs",
    "laptops": "laptops",
    "ac": "ac",
    "refrigerators": "refrigerators",
    "audio": "audio",
    "kitchen": "kitchen",
    "grooming": "grooming",
}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:128.0) Gecko/20100101 Firefox/128.0",
]

KNOWN_BRANDS = [
    "Apple", "Samsung", "OnePlus", "Google", "Nothing", "Xiaomi", "Realme",
    "HP", "Dell", "ASUS", "Lenovo", "Acer", "MSI",
    "LG", "Sony", "Bose", "boAt", "JBL", "Marshall", "Sennheiser",
    "Philips", "Bajaj", "Prestige", "Kent", "Morphy Richards", "Butterfly",
    "Daikin", "O-General", "Hitachi", "Whirlpool", "Haier", "Lloyd", "Voltas",
    "Braun", "Vega", "Nova", "Dyson", "Panasonic", "TCL", "Mi", "Redmi",
    "Canon", "Nikon", "GoPro", "Logitech", "Epson",
]


@dataclass
class ScrapedProduct:
    id: str = ""
    name: str = ""
    category: str = ""
    brand: str = ""
    price: float = 0.0
    originalPrice: Optional[float] = None
    salePrice: Optional[float] = None
    images: list = field(default_factory=list)
    specifications: dict = field(default_factory=dict)
    rating: float = 0.0
    reviewCount: int = 0
    reviews: list = field(default_factory=list)
    stockLeft: int = 10
    croma_url: str = ""


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")[:50]


def extract_price(text: str) -> Optional[float]:
    if not text:
        return None
    cleaned = re.sub(r"[^\d.]", "", text)
    try:
        return float(cleaned)
    except ValueError:
        return None


async def random_delay():
    await asyncio.sleep(random.uniform(2.0, 4.0))


# ──────────────────────────────────────────────
# Core Scraper
# ──────────────────────────────────────────────

class CromaScraper:
    def __init__(self, headless: bool = True, max_products: int = 5):
        self.headless = headless
        self.max_products = max_products
        self.browser = None
        self.context = None
        self.all_products: list[ScrapedProduct] = []
        self.product_id_counter = 1

    async def __aenter__(self):
        playwright = await async_playwright().start()
        self.browser = await playwright.firefox.launch(
            headless=self.headless,
            args=["--no-sandbox"],
        )
        self.context = await self.browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1920, "height": 1080},
            locale="en-IN",
            timezone_id="Asia/Kolkata",
            extra_http_headers={
                "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
            },
        )
        return self

    async def __aexit__(self, *args):
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()

    async def new_page(self):
        page = await self.context.new_page()
        page.set_default_timeout(45000)
        return page

    async def scrape_category(self, cat_id: str, cat_config: dict):
        log.info("═══ Category: %s ═══", cat_id.upper())

        product_urls = []
        for url in cat_config.get("listing_urls", []):
            url_filter = cat_config.get("url_filter", None)
            try:
                urls = await self._discover_product_urls(url, url_filter)
                product_urls.extend(urls)
                log.info("  Found %d products from %s", len(urls), url.split("/")[-1])
            except Exception as e:
                log.warning("  Listing error %s: %s", url, e)

        if not product_urls:
            log.warning("  No product URLs discovered!")
            return

        product_urls = product_urls[:self.max_products]
        log.info("  Scraping %d product pages...", len(product_urls))

        for idx, p_url in enumerate(product_urls, 1):
            try:
                product = await self._scrape_product_page(p_url, cat_id)
                if product:
                    self.all_products.append(product)
                    log.info(
                        "  [%d/%d] ✓ %s (₹%.0f, %d imgs, %.1f★, %d specs)",
                        idx, len(product_urls),
                        product.name[:50], product.price or 0,
                        len(product.images), product.rating,
                        len(product.specifications),
                    )
                await random_delay()
            except Exception as e:
                log.error("  [%d/%d] ✗ Failed: %s", idx, len(product_urls), e)

    async def _discover_product_urls(self, url: str, url_filter: list = None) -> list:
        page = await self.new_page()
        try:
            log.debug("  Listing: %s", url)
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)

            for _ in range(3):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(1.5)

            urls = await page.evaluate("""
                () => {
                    const links = new Set();
                    document.querySelectorAll('a[href*="/p/"]').forEach(a => {
                        if (a.href) links.add(a.href);
                    });
                    return Array.from(links);
                }
            """)
            if url_filter:
                urls = [u for u in urls if any(f in u.lower() for f in url_filter)]
            return list(dict.fromkeys(urls))
        finally:
            await page.close()

    async def _scrape_product_page(self, url: str, cat_id: str) -> Optional[ScrapedProduct]:
        page = await self.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(2)

            product = ScrapedProduct(category=cat_id, croma_url=url)

            # 1. Name from h1 or page title
            product.name = await page.evaluate("""
                () => {
                    const h1 = document.querySelector('h1');
                    if (h1 && h1.textContent.trim()) return h1.textContent.trim();
                    const title = document.title;
                    return title.replace(/^Buy\\s+/i, '').replace(/\\s*Online\\s*-\\s*Croma\\s*$/i, '').trim();
                }
            """)

            # 2. Images from DOM gallery in Croma's exact order (filter out non-product images)
            images = await page.evaluate("""
                () => {
                    const seen = new Set();
                    const result = [];
                    const isVideo = (u) => {
                        const p = u.split('?')[0].toLowerCase();
                        return p.endsWith('.mp4') || p.endsWith('.webm') || p.endsWith('.mov') ||
                               p.endsWith('.avi') || p.endsWith('.mkv') || p.endsWith('.flv');
                    };
                    const isProductImage = (u) => {
                        const low = u.toLowerCase();
                        if (low.includes('/cms/') || low.includes('lazyloading') || low.includes('bank') || low.includes('hdfc') || low.includes('idfc')) return false;
                        return low.includes('/images/') || low.includes('media.tatacroma');
                    };

                    // Collect image URL from DOM — prefer data-src (lazy) over src
                    const collectSrc = (el) => {
                        let src = el.getAttribute('data-src') || el.getAttribute('src') || '';
                        if (!src || src.includes('data:') || src.endsWith('.svg')) return '';
                        if (src.startsWith('//')) src = 'https:' + src;
                        const cleaned = src.replace(/\\?.*/, '');
                        return isVideo(cleaned) || !isProductImage(cleaned) ? '' : cleaned;
                    };

                    // Gather in DOM order
                    const all = document.querySelectorAll(
                        'img[src*="media-ik.croma"], img[data-src*="media-ik.croma"], ' +
                        'img[src*="media.tatacroma"], img[data-src*="media.tatacroma"], ' +
                        '[class*="gallery"] img, [class*="carousel"] img'
                    );
                    all.forEach(img => {
                        const cleaned = collectSrc(img);
                        if (cleaned && !seen.has(cleaned)) {
                            seen.add(cleaned);
                            result.push(cleaned);
                        }
                    });

                    return result;
                }
            """)
            # Rotate left by 1 — moves _0 (main image) toward the front
            if len(images) > 1:
                images = images[1:] + images[:1]
            product.images = images[:10]

            # 3. Price
            price_info = await page.evaluate("""
                () => {
                    const el = document.querySelector('#pdp-product-price');
                    if (el) return { value: el.getAttribute('value'), text: el.textContent.trim() };
                    const alt = document.querySelector('.new-price .amount, [class*="finalPrice"]');
                    if (alt) return { value: alt.getAttribute('value'), text: alt.textContent.trim() };
                    return null;
                }
            """)
            if price_info and price_info.get("value"):
                product.price = float(price_info["value"])
                product.salePrice = product.price

            # 4. Brand from DOM or extract from product name
            if not product.brand and product.name:
                first_word = product.name.split()[0]
                for b in KNOWN_BRANDS:
                    if first_word.lower() == b.lower():
                        product.brand = b
                        break
                if not product.brand:
                    product.brand = first_word.capitalize()

            # 5. Original price from DOM
            orig_price = await page.evaluate("""
                () => {
                    const el = document.querySelector('[class*="mrp"], [class*="original"], del, s, .old-price');
                    if (el) {
                        const m = el.textContent.match(/[\\d,]+(?:\\.\\d+)?/);
                        if (m) return parseFloat(m[0].replace(/,/g, ''));
                    }
                    const body = document.body.innerText;
                    const mrpMatch = body.match(/MRP[\\s:]*₹?([\\d,]+(?:\\.\\d+)?)/i);
                    if (mrpMatch) return parseFloat(mrpMatch[1].replace(/,/g, ''));
                    return null;
                }
            """)
            product.originalPrice = orig_price

            # 6. Specifications
            product.specifications = await self._extract_specs(page)

            # 7. Rating — improved DOM selectors
            rating_info = await page.evaluate("""
                () => {
                    const result = { stars: 0, count: 0, reviewCount: 0 };

                    // Try multiple rating selectors
                    const selectors = [
                        '.cp-rating',
                        '[class*="rating"]',
                        '[class*="stars"]',
                        '[class*="Rating"]',
                        '[data-testid*="rating"]',
                    ];
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el) {
                            const text = el.textContent.trim();
                            const m = text.match(/(\\d+(\\.\\d+)?)/);
                            if (m) {
                                const v = parseFloat(m[1]);
                                if (v > 0 && v <= 5) result.stars = v;
                            }
                            const rc = text.match(/(\\d+[,]?\\d+)\\s*Ratings?/i);
                            if (rc) result.count = parseInt(rc[1].replace(/,/g, ''));
                            const rv = text.match(/(\\d+[,]?\\d+)\\s*Reviews?/i);
                            if (rv) result.reviewCount = parseInt(rv[1].replace(/,/g, ''));
                            if (result.stars > 0) break;
                        }
                    }

                    // Fallback: text search
                    if (result.stars === 0) {
                        const body = document.body.innerText;
                        const starM = body.match(/(\\d+(\\.\\d+)?)\\s*out\\s*of\\s*5/i);
                        if (starM) result.stars = parseFloat(starM[1]);
                        const countM = body.match(/(\\d+[,]?\\d+)\\s*Ratings?/i);
                        if (countM) result.count = parseInt(countM[1].replace(/,/g, ''));
                        const revM = body.match(/(\\d+[,]?\\d+)\\s*Reviews?/i);
                        if (revM) result.reviewCount = parseInt(revM[1].replace(/,/g, ''));
                    }

                    return result;
                }
            """)
            product.rating = rating_info.get("stars", 0)
            product.reviewCount = rating_info.get("count", 0) or rating_info.get("reviewCount", 0)

            # 8. Reviews from API + DOM fallback
            reviews = []
            try:
                api_reviews = await self._fetch_reviews(page, url)
                if isinstance(api_reviews, list):
                    reviews = api_reviews
            except Exception as e:
                log.debug("    Review API failed: %s", e)
            if not reviews:
                try:
                    reviews = await self._extract_reviews_from_dom(page)
                except Exception as e:
                    log.debug("    DOM review extraction failed: %s", e)
            product.reviews = reviews

            if not product.name:
                return None

            # Assign unique ID before downloading (for unique filenames)
            product.id = f"{cat_id[:3]}_{self.product_id_counter:03d}"
            self.product_id_counter += 1

            # 9. Download images (now with unique product ID)
            try:
                await self._download_images(product, cat_id)
            except Exception as e:
                log.debug("    Image download failed: %s", e)

            return product

        finally:
            await page.close()

    async def _extract_specs(self, page) -> dict:
        specs = await page.evaluate("""
            () => {
                const result = {};

                // Click specification tab if available
                const tabs = document.querySelectorAll('button, [role="tab"], li, a');
                tabs.forEach(t => {
                    const txt = t.textContent.trim().toLowerCase();
                    if (txt === 'specifications' || txt === 'specs' || txt === 'key features') {
                        t.click();
                    }
                });

                // Extract from spec tables
                document.querySelectorAll('table tr').forEach(row => {
                    const cells = row.querySelectorAll('td, th');
                    if (cells.length >= 2) {
                        const key = cells[0].textContent.trim().replace(/:$/, '').trim();
                        const val = cells[1].textContent.trim();
                        if (key && val && key.length < 60 && !result[key]) result[key] = val;
                    }
                });

                // Extract from spec list items
                document.querySelectorAll('li, [class*="spec-item"]').forEach(li => {
                    const text = li.textContent.trim();
                    if (text.includes(':') && !text.includes('::') && text.length < 120) {
                        const idx = text.indexOf(':');
                        const key = text.substring(0, idx).trim();
                        const val = text.substring(idx + 1).trim();
                        if (key && val && key.length < 50 && !result[key]) result[key] = val;
                    }
                });

                // Extract from dl/dt/dd
                document.querySelectorAll('dt').forEach(dt => {
                    const dd = dt.nextElementSibling;
                    if (dd && dd.tagName === 'DD') {
                        const key = dt.textContent.trim().replace(/:$/, '').trim();
                        const val = dd.textContent.trim();
                        if (key && val && key.length < 50 && !result[key]) result[key] = val;
                    }
                });

                return result;
            }
        """)
        return specs

    async def _fetch_reviews(self, page, product_url: str) -> list:
        """Fetch reviews from Croma API within browser context."""
        pid_match = re.search(r'/p/(\d+)', product_url)
        if not pid_match:
            return []
        pid = pid_match.group(1)

        result = await page.evaluate("""
            async (productId) => {
                const reviews = [];
                try {
                    // Try fetching from known Croma review APIs
                    const endpoints = [
                        `https://api.croma.com/productdetails/allchannels/v1/reviewcount/${productId}`,
                    ];
                    const resp = await fetch(endpoints[0]);
                    if (resp.ok) {
                        const data = await resp.json();
                        // data format: { "1": N, "2": N, "3": N, "4": N, "5": N }
                        return { type: 'counts', data };
                    }
                } catch(e) {}
                return reviews;
            }
        """, pid)

        if isinstance(result, dict) and result.get("type") == "counts":
            return result["data"]

        return []

    async def _extract_reviews_from_dom(self, page) -> list:
        """Extract reviews from the product page DOM as fallback."""
        reviews = await page.evaluate("""
            () => {
                const results = [];

                // Try clicking review tab if present
                document.querySelectorAll('button, [role="tab"], li, a').forEach(t => {
                    const txt = t.textContent.trim().toLowerCase();
                    if (txt === 'reviews' || txt === 'ratings & reviews') {
                        t.click();
                    }
                });

                return new Promise((resolve) => {
                    setTimeout(() => {
                        const reviewSelectors = [
                            '[class*="review"]',
                            '[class*="Review"]',
                            '[class*="feedback"]',
                            '[class*="comment"]',
                            '.customer-review',
                        ];

                        let items = [];
                        for (const sel of reviewSelectors) {
                            items = document.querySelectorAll(sel);
                            if (items.length > 0) break;
                        }

                        items.forEach(item => {
                            const textEl = item.querySelector('[class*="text"], [class*="comment"], p, [class*="description"]');
                            const titleEl = item.querySelector('[class*="title"], [class*="heading"], h3, h4, strong');
                            const ratingEl = item.querySelector('[class*="star"], [class*="rating"], [class*="score"]');
                            const authorEl = item.querySelector('[class*="author"], [class*="name"], [class*="user"]');

                            let rating = 0;
                            if (ratingEl) {
                                const m = ratingEl.textContent.match(/(\\d+(\\.\\d+)?)/);
                                if (m) rating = parseFloat(m[1]);
                            }

                            let text = textEl ? textEl.textContent.trim() : '';
                            const title = titleEl ? titleEl.textContent.trim() : '';
                            const author = authorEl ? authorEl.textContent.trim() : '';

                            // Skip placeholder / empty reviews
                            if (!text || text.length < 10 || text.includes('Be the First') || text.includes('No reviews')) return;

                            results.push({
                                title: title || '',
                                author: author || 'Verified Buyer',
                                text: text,
                                rating: rating,
                            });
                        });

                        resolve(results);
                    }, 1500);
                });
            }
        """)
        return reviews[:20]

    async def _download_images(self, product: ScrapedProduct, cat_id: str):
        if not product.images:
            return

        cat_dir = FRONTEND_ASSETS / cat_id
        cat_dir.mkdir(parents=True, exist_ok=True)

        downloaded = []
        for idx, img_url in enumerate(product.images):
            if idx >= 5:
                break
            # Skip video URLs as safety net
            ext = self._guess_extension(img_url)
            if ext in VIDEO_EXTENSIONS:
                log.debug("    Skipping video URL: %s", img_url[:80])
                continue
            try:
                filename = f"{product.id}_{idx+1}{ext}"
                filepath = cat_dir / filename

                if filepath.exists():
                    downloaded.append(f"/product_images/{cat_id}/{filename}")
                    continue

                page = await self.new_page()
                try:
                    resp = await page.goto(img_url, timeout=30000, wait_until="commit")
                    if resp and resp.ok:
                        data = await resp.body()
                        if len(data) > 2048:
                            filepath.write_bytes(data)
                            downloaded.append(f"/product_images/{cat_id}/{filename}")
                            log.debug("    Downloaded: %s (%d bytes)", filename, len(data))
                        else:
                            log.debug("    Image too small: %s (%d bytes)", filename, len(data))
                finally:
                    await page.close()

            except Exception as e:
                log.debug("    Image error: %s", e)

        product.images = downloaded if downloaded else product.images[:3]

    def _guess_extension(self, url: str) -> str:
        path = url.split("?")[0].rstrip("/")
        ext = Path(path).suffix.lower()
        if ext in IMAGE_EXTENSIONS:
            return ext
        if ext in VIDEO_EXTENSIONS:
            return ext
        return ".jpg"

    async def run(self):
        log.info("╔══════════════════════════════════════════╗")
        log.info("║   Croma Product Scraper — FlashEngine    ║")
        log.info("╚══════════════════════════════════════════╝")
        log.info("Max products per category: %d", self.max_products)

        for cat_id, cat_config in CATEGORIES.items():
            await self.scrape_category(cat_id, cat_config)

        log.info("Done! Total scraped: %d", len(self.all_products))
        return self.all_products


def to_frontend_schema(products: list[ScrapedProduct]) -> list[dict]:
    output = []
    id_counter = 1

    for p in products:
        sp = p.salePrice or p.price or 0
        op = p.originalPrice or sp * 1.15
        entry = {
            "id": id_counter,
            "brand": p.brand or "Generic",
            "name": p.name or "Unknown Product",
            "originalPrice": round(op),
            "salePrice": round(sp),
            "price": round(sp),
            "images": p.images or [],
            "specifications": p.specifications or {},
            "rating": p.rating or 0,
            "reviewCount": p.reviewCount or 0,
            "reviews": list(p.reviews) if isinstance(p.reviews, list) else [],
            "image": p.images[0] if p.images else f"/product_images/{p.category}/placeholder.png",
            "category": CATEGORY_ID_MAP.get(p.category, p.category),
            "stockLeft": p.stockLeft or random.randint(5, 25),
        }
        output.append(entry)
        id_counter += 1
    return output


def save_json(products: list[dict], filepath: str = "scraped_products.json"):
    filepath = filepath or "scraped_products.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    log.info("Saved %d products to %s", len(products), filepath)


def generate_croma_data_js(products: list[dict], filepath: str = "frontend/src/cromaData_enriched.js"):
    json_str = json.dumps(products, indent=2, ensure_ascii=False)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"""// Auto-generated enriched product data from Croma scraper
// Generated on: {time.strftime("%Y-%m-%d %H:%M:%S")}

export const scrapedProducts = {json_str};
""")
    log.info("Generated JS module: %s", filepath)


def parse_args():
    import argparse
    parser = argparse.ArgumentParser(description="Croma Product Scraper — FlashEngine")
    parser.add_argument("--visible", action="store_true", help="Show browser window")
    parser.add_argument("--max-products", type=int, default=5, help="Max products per category")
    parser.add_argument("--category", type=str, default=None, help="Single category to scrape")
    parser.add_argument("--output", type=str, default="scraped_products.json", help="Output JSON path")
    parser.add_argument("--generate-js", action="store_true", help="Generate cromaData JS module")
    return parser.parse_args()


async def main():
    args = parse_args()
    headless = not args.visible

    scraper = CromaScraper(headless=headless, max_products=args.max_products)

    async with scraper:
        if args.category:
            if args.category not in CATEGORIES:
                log.error("Unknown category: %s", args.category)
                sys.exit(1)
            await scraper.scrape_category(args.category, CATEGORIES[args.category])
        else:
            await scraper.run()

    if not scraper.all_products:
        log.warning("No products scraped!")
        save_json([], args.output)
        return

    frontend_data = to_frontend_schema(scraper.all_products)
    save_json(frontend_data, args.output)

    if args.generate_js:
        generate_croma_data_js(frontend_data)

    log.info("Done! %d products enriched.", len(frontend_data))
    if scraper.all_products:
        log.info("Sample: %s", json.dumps(frontend_data[0], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())