import re
import json
from typing import Optional, Dict, Any, List
import httpx
from ..config import settings
from ..models.schemas import ItemFingerprint

class FingerprintService:
    KNOWN_COLORS = [
        "dark green", "forest green", "emerald green", "olive green",
        "midnight blue", "navy blue", "sky blue", "electric blue", "blue",
        "matte black", "jet black", "space gray", "silver", "gold", "rose gold",
        "ruby red", "burgundy", "crimson", "red", "white", "pearl white",
        "neon yellow", "yellow", "orange", "purple", "lavender", "teal", "cyan", "brown"
    ]
    
    KNOWN_BRANDS = [
        "Apple", "MacBook", "Dell", "Lenovo", "ThinkPad", "HP", "Asus", "Acer",
        "Sony", "Bose", "Sennheiser", "JBL", "Anker", "Soundcore", "Samsung",
        "Hydro Flask", "Stanley", "Yeti", "Contigo", "Klean Kanteen", "Thermos",
        "Nike", "Adidas", "Herschel", "North Face", "Fjallraven", "JanSport",
        "Casio", "Seiko", "Fossil", "Garmin", "Logitech", "Kindle", "iPad"
    ]
    
    KNOWN_MATERIALS = [
        "metal", "aluminum", "stainless steel", "anodized metal", "titanium",
        "plastic", "polycarbonate", "matte plastic", "hard shell",
        "leather", "faux leather", "canvas", "nylon", "fabric", "silicone", "glass"
    ]
    
    KNOWN_SHAPES = [
        "tall cylindrical", "cylindrical", "slim rectangular", "clamshell",
        "compact rectangular", "square", "round", "oval", "teardrop", "foldable", "heavy-duty"
    ]

    @classmethod
    async def generate_fingerprint(
        cls,
        title: str,
        category: str,
        description: str,
        location: str,
        event_time: str,
        image_url: Optional[str] = None
    ) -> ItemFingerprint:
        if settings.is_ai_live:
            try:
                return await cls._generate_with_gemini(title, category, description, location, event_time, image_url)
            except Exception as e:
                print(f"[FingerprintService] Gemini call failed, falling back to Demo Engine: {e}")
        
        return cls._generate_deterministic(title, category, description, location, event_time)

    @classmethod
    async def _generate_with_gemini(
        cls,
        title: str,
        category: str,
        description: str,
        location: str,
        event_time: str,
        image_url: Optional[str]
    ) -> ItemFingerprint:
        prompt = f"""You are the TraceBack AI Item Fingerprint Extractor.
Extract a structured fingerprint from this item report.
Do NOT hallucinate attributes. If an attribute cannot be determined, return null.

Title: {title}
Category: {category}
Description: {description}
Location: {location}
Time: {event_time}
Image URL: {image_url or 'None'}

Return ONLY valid JSON matching this schema:
{{
  "object_type": string or null,
  "brand": string or null,
  "primary_color": string or null,
  "secondary_colors": [string],
  "material": string or null,
  "shape_size": string or null,
  "visible_text": [string],
  "logos": [string],
  "distinctive_marks": [string],
  "accessories": [string],
  "location": string,
  "event_time": string,
  "confidence": number (e.g. 88.0)
}}"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.1, "response_mime_type": "application/json"}
                }
            )
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            return ItemFingerprint(**parsed)

    @classmethod
    def _generate_deterministic(
        cls,
        title: str,
        category: str,
        description: str,
        location: str,
        event_time: str
    ) -> ItemFingerprint:
        combined = f"{title} {description}".lower()
        
        # Object Type
        obj_type = title.strip()
        if "bottle" in combined or "flask" in combined:
            obj_type = "Insulated Water Bottle"
        elif "laptop" in combined or "macbook" in combined or "notebook" in combined:
            obj_type = "Laptop Computer"
        elif "earbuds" in combined or "airpods" in combined or "headphones" in combined:
            obj_type = "Wireless Audio Earbuds"
        elif "id" in combined or "card" in combined or "badge" in combined:
            obj_type = "Campus Identification Card"
        elif "bag" in combined or "backpack" in combined:
            obj_type = "Backpack / Daypack"
        elif "keys" in combined or "keychain" in combined:
            obj_type = "Keychain / Keys"
        elif "calculator" in combined:
            obj_type = "Scientific Calculator"
        
        # Brand detection
        brand = None
        for b in cls.KNOWN_BRANDS:
            if re.search(r'\b' + re.escape(b.lower()) + r'\b', combined):
                brand = b
                break
        
        # Colors
        primary_color = "Unknown"
        secondary_colors = []
        for color in cls.KNOWN_COLORS:
            if re.search(r'\b' + re.escape(color) + r'\b', combined):
                if primary_color == "Unknown":
                    primary_color = color.title()
                else:
                    secondary_colors.append(color.title())
        
        if primary_color == "Unknown":
            # fallback words
            if "dark" in combined: primary_color = "Dark Gray / Black"
            elif "light" in combined: primary_color = "Light / Silver"
            elif "silver" in combined or "grey" in combined: primary_color = "Silver / Gray"

        # Material
        material = None
        for mat in cls.KNOWN_MATERIALS:
            if re.search(r'\b' + re.escape(mat) + r'\b', combined):
                material = mat.title()
                break
        if not material:
            if "insulated" in combined or "flask" in combined or "metal" in combined:
                material = "Stainless Steel"
            elif "macbook" in combined or "laptop" in combined:
                material = "Aluminum Unibody"
            elif "plastic" in combined:
                material = "Polycarbonate"

        # Shape / Size
        shape_size = None
        for sh in cls.KNOWN_SHAPES:
            if sh in combined:
                shape_size = sh.title()
                break
        if not shape_size:
            if "bottle" in combined: shape_size = "Tall Cylindrical"
            elif "earbuds" in combined or "airpods" in combined: shape_size = "Compact Oval Charging Case"
            elif "laptop" in combined: shape_size = "Slim 14-inch Rectangular"
            elif "id" in combined or "card" in combined: shape_size = "Standard Card (CR80)"
            elif "backpack" in combined: shape_size = "Standard 25L Daypack"

        # Distinctive marks
        distinctive_marks = []
        mark_patterns = [
            r'(sticker[s]?\s*(?:of|on|near)?\s*[\w\s]{0,25})',
            r'(scratch[es]?\s*(?:on|near)?\s*[\w\s]{0,25})',
            r'(dent[s]?\s*(?:on|near)?\s*[\w\s]{0,25})',
            r'(engrav(?:ing|ed)\s*(?:of|on)?\s*[\w\s]{0,25})',
            r'(keychain\s*(?:with|attached)?\s*[\w\s]{0,25})',
            r'(case\s*(?:with|featuring)?\s*[\w\s]{0,25})',
            r'(strap\s*(?:with|color)?\s*[\w\s]{0,25})'
        ]
        for pat in mark_patterns:
            matches = re.findall(pat, combined)
            for m in matches:
                clean_m = m.strip().capitalize()
                if clean_m and clean_m not in distinctive_marks:
                    distinctive_marks.append(clean_m)
                    
        # Visible Text & Logos
        visible_text = []
        logos = []
        if brand:
            logos.append(f"{brand} emblem / logo")
        if "sticker" in combined and "white" in combined:
            if "Small white sticker near base" not in distinctive_marks:
                distinctive_marks.append("Small white sticker near base")
        if "apple" in combined or "macbook" in combined:
            logos.append("Apple Inc. logo")
        if "initials" in combined or "named" in combined or "written" in combined:
            visible_text.append("Handwritten label / initials")

        # Accessories
        accessories = []
        if "boot" in combined: accessories.append("Silicone protective boot")
        if "strap" in combined: accessories.append("Carrying strap")
        if "carabiner" in combined: accessories.append("Metal carabiner clip")
        if "sleeve" in combined: accessories.append("Padded protective sleeve")
        if "cable" in combined or "charger" in combined: accessories.append("Charging cable")

        return ItemFingerprint(
            object_type=obj_type,
            brand=brand,
            primary_color=primary_color,
            secondary_colors=secondary_colors,
            material=material,
            shape_size=shape_size,
            visible_text=visible_text,
            logos=logos,
            distinctive_marks=distinctive_marks,
            accessories=accessories,
            location=location,
            event_time=event_time,
            confidence=86.5
        )
