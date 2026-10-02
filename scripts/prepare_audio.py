import urllib.request
import subprocess
import os
import sys

TRACKS = [
    {
        "num": 2,
        "id": "1-q0qrCMWcEEAsE4-NrKfr68ev-w5CEZD",
        "name": "Roa, Anuel AA - VAMO A VEL",
        "flac": "/tmp/music_cache/track_2.flac",
        "mp3": "public/audio/track_02.mp3"
    },
    {
        "num": 3,
        "id": "1YfrgTKsl-gurAFMgwmNd0Oxp0CA65VYj",
        "name": "Romeo Santos, Prince Royce - Dardos",
        "flac": "/tmp/music_cache/track_3.flac",
        "mp3": "public/audio/track_03.mp3"
    },
    {
        "num": 4,
        "id": "1VhVSO_L4Ck024pJc_lTeOiMok_HW9gHr",
        "name": "Quevedo, Elvis Crespo - LA GRACIOSA",
        "flac": "/tmp/music_cache/track_4.flac",
        "mp3": "public/audio/track_04.mp3"
    },
    {
        "num": 5,
        "id": "1NUuxsTqJvyARB7ya4Y6ZXJAsWz3l4FsO",
        "name": "HUGEL - Jamaican (Bam Bam)",
        "flac": "/tmp/music_cache/track_5.flac",
        "mp3": "public/audio/track_05.mp3"
    }
]

os.makedirs("/tmp/music_cache", exist_ok=True)
os.makedirs("public/audio", exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for t in TRACKS:
    mp3_path = t["mp3"]
    flac_path = t["flac"]
    
    if os.path.exists(mp3_path) and os.path.getsize(mp3_path) > 1000000:
        print(f"Track {t['num']} already ready: {mp3_path}")
        continue

    url = f"https://drive.usercontent.google.com/download?id={t['id']}&export=download"
    print(f"Downloading {t['name']} from Google Drive...")
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=180) as resp, open(flac_path, "wb") as out:
            while True:
                chunk = resp.read(256 * 1024)
                if not chunk:
                    break
                out.write(chunk)
        print(f"Downloaded {flac_path} ({os.path.getsize(flac_path)} bytes)")
        
        print(f"Converting to {mp3_path}...")
        cmd = ["ffmpeg", "-y", "-i", flac_path, "-vn", "-b:a", "320k", "-ar", "44100", mp3_path]
        subprocess.run(cmd, check=True)
        print(f"Ready: {mp3_path} ({os.path.getsize(mp3_path)} bytes)")
    except Exception as e:
        print(f"Error processing {t['name']}: {e}")

print("All tracks processing completed!")
