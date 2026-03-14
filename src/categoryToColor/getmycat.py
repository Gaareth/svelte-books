import json
import time
import matplotlib.pyplot as plt
import colorsys


import sqlite3

import requests

# path to your sqlite database file
DB_PATH = "/home/gareth/dev/webdev/svelte/book-store/prisma/prod.db"

BOOKS_API_KEY = "AIzaSyBgfcmp3oPSZ2pndzVvV2FgOOfGI4feZA0"

def get_categories(volume_id):
    fields = "id,volumeInfo(categories)"
    url = f"https://www.googleapis.com/books/v1/volumes/{volume_id}?fields={fields}&key={BOOKS_API_KEY}"

    r = requests.get(url)
    data = r.json()

    if "error" in data:
        raise Exception(data["error"]["message"])

    return data.get("volumeInfo", {}).get("categories", [])


def get_all_volume_ids():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        SELECT bookApiDataId
        FROM Book
        WHERE bookApiDataId IS NOT NULL
    """)

    ids = [row[0] for row in cur.fetchall()]
    conn.close()
    return ids


def main():
    volume_ids = get_all_volume_ids()

    all_categories = set()

    for vid in volume_ids:
        try:
            cats = get_categories(vid)
            for c in cats:
                all_categories.add(c.strip().lower())

            print(f"{vid}: {cats}")

            # avoid hitting rate limits
            time.sleep(0.1)

        except Exception as e:
            print(f"Error with {vid}: {e}")

    print("\nAll unique categories:")
    for c in sorted(all_categories):
        print(c)

    with open("categories.json", "w") as f:
        json.dump(list(all_categories), f)

main()