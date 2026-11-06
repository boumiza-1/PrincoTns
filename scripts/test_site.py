#!/usr/bin/env python3
"""Offline checks for PRINCO's static GitHub Pages deployment."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
ROOT=Path(__file__).resolve().parents[1]
PAGES={"index.html":"https://www.princo.site/","ar/index.html":"https://www.princo.site/ar/"}
PROJECTS=("sportifano.com","gogymmsaken.com","princo.site","m2k-structures.com")
class Reader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links=[]
        self.meta={}
        self.title=0
    def handle_starttag(self,tag,attr):
        a=dict(attr)
        if tag=="title":self.title+=1
        if tag=="meta" and (a.get("name") or a.get("property")):
            self.meta[a.get("name") or a.get("property")]=a.get("content","")
        for name in ("href","src"):
            if a.get(name):self.links.append(a[name])
def local_target(page,raw):
    p=urlsplit(raw)
    if p.scheme or p.netloc or raw.startswith(("mailto:","tel:","#","data:","//")):return None
    if p.path.startswith("/"):
        path=p.path.lstrip("/")
    else:
        path=str((ROOT/page).parent.relative_to(ROOT)/unquote(p.path))
    if not path or path.endswith("/"):path+="index.html"
    # Simple normalization handles links from /ar/ to the site root.
    norm=(ROOT/path).resolve()
    if ROOT not in norm.parents and norm!=ROOT:raise AssertionError("Unsafe link "+raw)
    return norm
for page,canonical in PAGES.items():
    s=(ROOT/page).read_text(encoding="utf-8")
    doc=Reader();doc.feed(s)
    assert doc.title==1,(page,"missing/duplicate title")
    assert doc.meta.get("description"),(page,"missing description")
    assert doc.meta.get("og:image","").startswith("https://www.princo.site/assets/"),(page,"not first-party OG image")
    assert 'rel="canonical" href="'+canonical+'"' in s,(page,"canonical mismatch")
    assert 'hreflang="ar-TN"' in s and 'hreflang="fr-TN"' in s,(page,"hreflang missing")
    assert "assets/princo-original-logo.webp" in s,(page,"logo missing")
    assert "assets/princo-favicon.png" in s,(page,"favicon missing")
    assert "data-open-princo-chat" in s and "chatbot.js" in s and "chatbot.css" in s,(page,"chat missing")
    assert all(domain in s for domain in PROJECTS),(page,"missing portfolio project")
    for url in doc.links:
        target=local_target(page,url)
        if target is not None:
            assert target.exists(),(page,"missing relative asset",url,str(target))
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):
        json.loads(block)
assert "Sitemap: https://www.princo.site/sitemap.xml" in (ROOT/"robots.txt").read_text()
assert "https://www.princo.site/ar/" in (ROOT/"sitemap.xml").read_text()
assert (ROOT/"assets/princo-original-logo.webp").stat().st_size>800
assert (ROOT/"assets/princo-cover-portrait.webp").stat().st_size>1000
assert (ROOT/"assets/princo-favicon.png").stat().st_size>500
print("PRINCO validation passed: 2 locales, portfolio, icon/logo, chatbot, metadata, internal files and JSON-LD.")
