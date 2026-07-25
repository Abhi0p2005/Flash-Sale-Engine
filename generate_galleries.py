"""
Generate multi-image galleries (6-8 images) for single-image demo products.
Uses the single source image to create distinct realistic variants:
  0 - Hero / primary (full image)
  1 - Left-angled / perspective crop
  2 - Right-angled / perspective crop
  3 - Close-up detail (top portion)
  4 - Close-up detail (bottom portion)
  5 - Zoomed center feature
  6 - Packaging / box variant (if space available)
  7 - Spec highlight (wide crop)
"""
import json
import logging
import os
import random
from pathlib import Path

from PIL import Image, ImageFilter, ImageEnhance

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")
log = logging.getLogger("gallery-gen")

DB_PATH = Path("frontend/scraped_final.json")
PUBLIC_DIR = Path("frontend/public/product_images")

# Which demo IDs to process (single-image holdouts)
TARGET_IDS = {1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24}


def generate_variants(img_path: Path, out_dir: Path, base_name: str) -> list[str]:
    """Load source image, produce 6-8 distinct variants, save, return paths."""
    if not img_path.exists():
        log.warning("  Source image not found: %s", img_path)
        return []

    out_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    local_paths = []
    variants = []

    # Helper: crop safe region (clamp to image bounds)
    def safe_crop(left, top, right, bottom):
        l = max(0, left)
        t = max(0, top)
        r = min(w, right)
        b = min(h, bottom)
        if r - l < 50 or b - t < 50:
            return img.crop((0, 0, w, h))
        return img.crop((l, t, r, b))

    # Helper: save variant
    def save_variant(cropped, label, enhance=False):
        if enhance:
            cropped = cropped.resize((800, 600), Image.LANCZOS)
        else:
            cropped = cropped.resize((800, 800), Image.LANCZOS)
        fname = f"{base_name}_{label}.jpg"
        fpath = out_dir / fname
        cropped.save(fpath, "JPEG", quality=92)
        local_paths.append(f"/product_images/{out_dir.name}/{fname}")

    # 0 — Hero (full image, slightly wider crop)
    save_variant(img, "1")

    # 1 — Left perspective: right-biased crop (simulates angled view)
    left_crop = safe_crop(0, 0, int(w * 0.85), h)
    save_variant(left_crop, "2")

    # 2 — Right perspective: left-biased crop
    right_crop = safe_crop(int(w * 0.15), 0, w, h)
    save_variant(right_crop, "3")

    # 3 — Top detail close-up
    top_crop = safe_crop(0, 0, w, int(h * 0.6))
    save_variant(top_crop, "4")

    # 4 — Bottom detail
    bot_crop = safe_crop(0, int(h * 0.35), w, h)
    save_variant(bot_crop, "5")

    # 5 — Center zoomed feature
    cx, cy = w // 2, h // 2
    zoom = safe_crop(cx - w // 4, cy - h // 4, cx + w // 4, cy + h // 4)
    if (zoom.size[0] < 50 or zoom.size[1] < 50):
        zoom = img
    save_variant(zoom, "6")

    # 6 — Packaging variant: add simulated border/background
    box = Image.new("RGB", (int(w * 1.1), int(h * 1.1)), (240, 240, 240))
    offset_x = (box.width - w) // 2
    offset_y = (box.height - h) // 2
    box.paste(img, (offset_x, offset_y))
    # Soft shadow effect
    shadow = Image.new("RGB", (w + 20, h + 20), (200, 200, 200))
    shadow.paste(img, (10, 10))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=4))
    box2 = Image.new("RGB", (int(w * 1.15), int(h * 1.15)), (250, 250, 245))
    box2.paste(shadow, ((box2.width - shadow.width)//2, (box2.height - shadow.height)//2))
    box2.paste(img, ((box2.width - w)//2, (box2.height - h)//2))
    save_variant(box2, "7", enhance=True)

    # 7 — Spec highlight: subtle color/contrast boost on full image
    enhancer = ImageEnhance.Contrast(img)
    spec = enhancer.enhance(1.15)
    enhancer2 = ImageEnhance.Sharpness(spec)
    spec = enhancer2.enhance(1.1)
    save_variant(spec, "8", enhance=True)

    return local_paths


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
    patched = 0
    results = []

    for product in data:
        pid = product["id"]
        if pid not in TARGET_IDS:
            continue

        if len(product.get("images", [])) >= 6:
            log.info("ID %d %s — already %d images, skipped", pid, product["name"][:40], len(product["images"]))
            continue

        old_imgs = list(product.get("images", []))
        src_path = None
        cat = product.get("category", "uncategorized")

        # Find the single source image
        for img_path in old_imgs:
            rel = img_path.lstrip("/")
            # Strip leading product_images/ since PUBLIC_DIR already includes it
            if rel.startswith("product_images/"):
                rel = rel[len("product_images/"):]
            candidate = PUBLIC_DIR / rel
            if candidate.exists():
                src_path = candidate
                break

        if not src_path or not src_path.exists():
            log.warning("ID %d %s — source image not found: %s", pid, product["name"][:40], old_imgs[:1])
            results.append(f"ID {pid:2d} {product['name'][:40]:40s} SKIP source missing")
            continue

        out_dir = PUBLIC_DIR / cat
        base = f"{pid}_g"
        new_paths = generate_variants(src_path, out_dir, base)

        if len(new_paths) < 6:
            log.warning("ID %d — only %d variants generated", pid, len(new_paths))
            results.append(f"ID {pid:2d} {product['name'][:40]:40s} ONLY {len(new_paths)} variants")
            continue

        # Patch: replace images array with new multi-image gallery
        product["images"] = new_paths
        patched += 1
        old_n = len(old_imgs)
        new_n = len(new_paths)
        log.info("ID %d %s — %d -> %d images ✓", pid, product["name"][:40], old_n, new_n)
        results.append(f"ID {pid:2d} {product['name'][:40]:40s} {old_n} -> {new_n} images")

    # Write back
    DB_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print()
    print("=" * 70)
    print("VERIFICATION LOG — GALLERY GENERATION RESULTS")
    print("=" * 70)
    for line in results:
        print(" ", line)
    print("-" * 70)
    print(f"  Total patched: {patched} / 21 targets")
    print("=" * 70)


if __name__ == "__main__":
    main()
