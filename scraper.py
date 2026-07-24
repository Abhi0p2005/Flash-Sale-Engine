import requests
import json
import sys

def scrape_free_source(query):
    # Using dummyjson.com as a reliable, free, public API for product data
    # It provides accurate product images that won't be blocked.
    url = f"https://dummyjson.com/products/search?q={query}"
    
    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            return []
            
        data = response.json()
        products = []
        
        for item in data.get('products', [])[:4]:
            products.append({
                "brand": item.get('brand', 'generic'),
                "name": item.get('title'),
                "originalPrice": int(item.get('price', 0) * 1.2),
                "salePrice": int(item.get('price', 0)),
                "image": item.get('thumbnail'),
                "category": query,
                "stockLeft": item.get('stock', 5)
            })
        return products
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    query_input = sys.argv[1] if len(sys.argv) > 1 else "smartphone"
    scraped_inventory = scrape_free_source(query_input)
    print(json.dumps(scraped_inventory, indent=2))