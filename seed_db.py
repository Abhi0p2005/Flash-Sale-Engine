import json
import psycopg2
import os

DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://flashengine_user:RyFiLk53oJJ6fdRMS2EH9sVajztxF1RT@dpg-d9idjcmrnols73f49u40-a/flashengine"

conn = psycopg2.connect(DATABASE_URL, sslmode="require")
cur = conn.cursor()

cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id BIGSERIAL PRIMARY KEY,
        brand VARCHAR(255),
        name VARCHAR(255),
        original_price INTEGER,
        sale_price INTEGER,
        image VARCHAR(512),
        category VARCHAR(255),
        stock_left INTEGER
    )
""")

with open("frontend/scraped_final.json") as f:
    products = json.load(f)

inserted = 0
for p in products:
    cur.execute("SELECT id FROM products WHERE name = %s", (p["name"],))
    if cur.fetchone():
        continue
    cur.execute("""
        INSERT INTO products (brand, name, original_price, sale_price, image, category, stock_left)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        p["brand"],
        p["name"],
        p.get("originalPrice"),
        p.get("salePrice") or p.get("price"),
        p.get("image"),
        p.get("category"),
        p.get("stockLeft")
    ))
    inserted += 1

conn.commit()
cur.close()
conn.close()
print(f"Inserted {inserted} products into the database.")
