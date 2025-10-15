import cloudscraper
from bs4 import BeautifulSoup
import csv
import json
import time
import re
import concurrent.futures
BASE_URL = "https://asuracomic.net"
START_URL = f"{BASE_URL}/series?page=1"

scraper = cloudscraper.create_scraper()  # bypass Cloudflare


def get_soup(url):
    print(f"[Requesting] {url}")
    resp = scraper.get(url)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def clean_title(raw_title):
    """Remove status, genre, chapter info, and rating from title"""
    title = re.sub(r'^(Ongoing|Completed|Hiatus)(MANHWA|MANGA|MANHUA)', '', raw_title, flags=re.IGNORECASE)
    title = re.sub(r'Chapter\d+(\.\d+)?', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\d+\.\d+$', '', title)
    return title.strip()


def clean_chapter_name(raw_chapter):
    """Remove dates from chapter names"""
    chapter = re.sub(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?\s*,?\s*\d{4}', '', raw_chapter, flags=re.IGNORECASE)
    chapter = re.sub(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{4}', '', chapter, flags=re.IGNORECASE)
    chapter = re.sub(r'\d{4}[-/]\d{1,2}[-/]\d{1,2}', '', chapter)
    chapter = re.sub(r'\d{1,2}[-/]\d{1,2}[-/]\d{4}', '', chapter)
    return chapter.strip()


def crawl_manga_list():
    """Extract manga titles, cover URLs, and detail links"""
    print("[+] Crawling manga list...")
    soup = get_soup(START_URL)
    mangas = []

    items = soup.select("div[class*='grid'] a")
    print(f"[✓] Found {len(items)} items")
    
    for idx, item in enumerate(items):
        href = item.get("href")
        
        if not href or 'series/' not in href:
            continue
        
        full_text = item.get_text(strip=True)
        title = clean_title(full_text)
        
        if not title:
            continue
        
        if href.startswith("http"):
            link = href
        elif href.startswith("/"):
            link = BASE_URL + href
        elif href.startswith("series/"):
            link = BASE_URL + "/" + href
        else:
            link = BASE_URL + "/series/" + href
        
        cover_tag = item.select_one("img")
        cover = None
        if cover_tag:
            cover = cover_tag.get("src") or cover_tag.get("data-src") or cover_tag.get("data-lazy-src")
        
        mangas.append({
            "title": title,
            "link": link,
            "cover": cover
        })
    
    print(f"[✓] Extracted {len(mangas)} manga")
    return mangas


def crawl_chapters(manga_url, limit=20):
    """Extract first N chapters for a manga with their URLs"""
    print(f"[+] Crawling chapters for {manga_url}")
    soup = get_soup(manga_url)

    chapter_links = soup.select("a[href*='/chapter/'], a[href*='chapter/']")
    
    if not chapter_links:
        print("[!] No chapter links found.")
        return []
    
    print(f"[✓] Found {len(chapter_links)} chapter links")
    
    seen_chapters = set()
    chapter_data = []
    
    for link in chapter_links:
        href = link.get("href")
        if not href or 'chapter/' not in href:
            continue
        
        # Build full URL
        if href.startswith("http"):
            chapter_url = href
        elif href.startswith("/series/"):
            chapter_url = BASE_URL + href
        elif href.startswith("/"):
            match = re.search(r'/series/([^/]+)', manga_url)
            if match:
                series_slug = match.group(1)
                if series_slug in href:
                    chapter_url = BASE_URL + href
                else:
                    chapter_url = f"{BASE_URL}/series/{series_slug}{href}"
            else:
                chapter_url = BASE_URL + href
        else:
            match = re.search(r'/series/([^/]+)', manga_url)
            if match:
                series_slug = match.group(1)
                if href.startswith(series_slug):
                    chapter_url = f"{BASE_URL}/series/{href}"
                else:
                    chapter_url = f"{BASE_URL}/series/{series_slug}/{href}"
            else:
                chapter_url = f"{BASE_URL}/series/{href}"
        
        if chapter_url in seen_chapters:
            continue
        seen_chapters.add(chapter_url)
        
        raw_chapter_name = link.get_text(strip=True)
        chapter_name = clean_chapter_name(raw_chapter_name)
        
        if chapter_name:
            chapter_data.append({
                "name": chapter_name,
                "url": chapter_url
            })
    
    def get_chapter_number(chapter):
        match = re.search(r'/chapter/(\d+)', chapter['url'])
        if match:
            return int(match.group(1))
        return 0
    
    chapter_data.sort(key=get_chapter_number)
    chapters = chapter_data[:limit]
    
    print(f"[✓] Extracted {len(chapters)} chapters")
    return chapters


def crawl_chapter_images(chapter_url):
    """Extract all images (01–50-optimized.webp) from all /storage/media/<id>/conversions/ folders in a chapter."""
    print(f"  [+] Crawling images for: {chapter_url}")

    try:
        # get HTML
        resp = scraper.get(chapter_url, timeout=15)
        resp.raise_for_status()
        html = resp.text

        # find all folder IDs mentioned anywhere in the HTML
        folder_ids = set(re.findall(r"/storage/media/(\d+)/conversions/", html))

        soup = BeautifulSoup(html, "html.parser")
        img_tags = soup.select("img")
        print(f"    [*] Found {len(img_tags)} <img> tags, {len(folder_ids)} conversion folders.")

        # fallback if regex missed folders
        if not folder_ids:
            for img in img_tags:
                src = img.get("src") or img.get("data-src") or ""
                match = re.search(r"/storage/media/(\d+)/conversions/", src)
                if match:
                    folder_ids.add(match.group(1))

        # fallback if still no conversion folders
        if not folder_ids:
            print("    [!] No /storage/media/<id>/conversions/ folders found — using direct image URLs as fallback.")
            raw_images = []
            for img in img_tags:
                src = (img.get("src") or img.get("data-src") or img.get("data-lazy-src") or img.get("data-original"))
                if src and ("storage/media" in src or "gg.asuracomic.net" in src):
                    if src.startswith("//"):
                        src = "https:" + src
                    elif src.startswith("/"):
                        src = "https://gg.asuracomic.net" + src
                    elif not src.startswith("http"):
                        src = "https://gg.asuracomic.net/" + src
                    raw_images.append(src)
            return list(dict.fromkeys(raw_images))

        print(f"    [*] Detected {len(folder_ids)} folders: {', '.join(sorted(folder_ids, key=int))}")

        all_images = []

        def check_url(url):
            try:
                r = scraper.head(url, timeout=8)
                if r.status_code == 200:
                    return url
            except:
                pass
            return None

        for folder_id in sorted(folder_ids, key=int):
            base_url = f"https://gg.asuracomic.net/storage/media/{folder_id}/conversions/"
            print(f"      [*] Enumerating: {base_url}")

            # generate candidate URLs for 1–50, both padded and unpadded
            urls = [
                base_url + f"{i:02d}-optimized.webp" for i in range(1, 51)
            ] + [
                base_url + f"{i}-optimized.webp" for i in range(1, 51)
            ]

            # threaded HEAD requests (fast)
            with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
                results = list(executor.map(check_url, urls))

            found = [u for u in results if u]
            all_images.extend(found)

        # remove duplicates while preserving order
        unique_images = list(dict.fromkeys(all_images))
        print(f"    [✓] Found {len(unique_images)} numbered images total across folders")

        if unique_images:
            print(f"      [First] {unique_images[0]}")
            print(f"      [Last]  {unique_images[-1]}")

        return unique_images

    except Exception as e:
        print(f"    [!] Error crawling chapter images: {e}")
        return []


def main():
    mangas = crawl_manga_list()
    
    if not mangas:
        print("[!] No manga found. Exiting...")
        return
    
    print(f"\n[✓] Found {len(mangas)} manga")
    
    manga_csv = "manga.csv"
    pictures_csv = "MangaPicture.csv"

    with open(manga_csv, "w", newline="", encoding="utf-8") as manga_file, \
         open(pictures_csv, "w", newline="", encoding="utf-8") as pictures_file:
        
        # Write headers
        manga_file.write("manga_id|title|cover|chapters\n")
        pictures_file.write("manga_id|chapter_name|chapter_url|image_url|image_order\n")

        manga_id = 1
        
        for manga in mangas[:10]:
            print(f"\n{'='*60}")
            print(f"[*] Processing Manga ID {manga_id}: {manga['title']}")
            print(f"[*] URL: {manga['link']}")
            
            try:
                chapters = crawl_chapters(manga["link"], limit=20)
                
                if not chapters:
                    print(f"[!] No chapters found, skipping...")
                    continue
                
                # Prepare chapter names for manga.csv
                chapter_names = [ch['name'] for ch in chapters]
                chapters_json = json.dumps(chapter_names, ensure_ascii=False)
                
                # Escape special characters for manga.csv
                title_escaped = manga["title"].replace("|", "\\|").replace("\n", " ")
                cover_escaped = (manga["cover"] or "").replace("|", "\\|").replace("\n", " ")
                chapters_escaped = chapters_json.replace("|", "\\|").replace("\n", " ")
                
                # Write to manga.csv
                manga_file.write(f"{manga_id}|{title_escaped}|{cover_escaped}|{chapters_escaped}\n")
                print(f"[✓] Saved manga: {manga['title']} with {len(chapters)} chapters")
                
                # Now crawl images for each chapter
                total_images = 0
                for chapter in chapters:
                    chapter_name = chapter['name']
                    chapter_url = chapter['url']
                    
                    print(f"\n  [*] Processing chapter: {chapter_name}")
                    images = crawl_chapter_images(chapter_url)
                    
                    if images:
                        for order, img_url in enumerate(images, start=1):
                            # Escape special characters
                            chapter_name_escaped = chapter_name.replace("|", "\\|").replace("\n", " ")
                            chapter_url_escaped = chapter_url.replace("|", "\\|").replace("\n", " ")
                            img_url_escaped = img_url.replace("|", "\\|").replace("\n", " ")
                            
                            # Write to MangaPicture.csv
                            pictures_file.write(f"{manga_id}|{chapter_name_escaped}|{chapter_url_escaped}|{img_url_escaped}|{order}\n")
                        
                        total_images += len(images)
                        print(f"    [✓] Saved {len(images)} images for {chapter_name}")
                    else:
                        print(f"    [!] No images found for {chapter_name}")
                    
                    time.sleep(1)  # Small delay between chapters
                
                print(f"\n[✓] Total images collected for {manga['title']}: {total_images}")
                manga_id += 1
                time.sleep(2)  # Delay between manga
                
            except Exception as e:
                print(f"[!] Error processing manga: {e}")
                import traceback
                traceback.print_exc()
                continue

    print(f"\n{'='*60}")
    print(f"[✅] Done!")
    print(f"[✅] Manga data saved to {manga_csv}")
    print(f"[✅] Picture data saved to {pictures_csv}")


if __name__ == "__main__":
    main()