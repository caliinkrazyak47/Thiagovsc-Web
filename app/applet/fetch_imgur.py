import urllib.request
import re
import json

url = "https://imgur.com/a/piDeiId"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print("HTML length:", len(html))
        
        # Look for direct image urls
        images = set(re.findall(r'https?://[^\s"\'<>]+\.(?:png|jpg|jpeg|webp)', html))
        print("Images found:")
        for img in images:
            print("  ", img)
            
        # Look for image_id or hash
        hashes = set(re.findall(r'"hash":"([a-zA-Z0-9]+)"', html))
        print("Hashes found:", hashes)
except Exception as e:
    print("Error:", e)
