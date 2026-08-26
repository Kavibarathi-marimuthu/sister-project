from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os, random
from datetime import datetime
try:
    import httpx
    _HTTPX_AVAILABLE = True
except ImportError:
    _HTTPX_AVAILABLE = False

app = FastAPI(
    title="Uzhavan AI API",
    description="விதை முதல் விற்பனை வரை — AI விவசாய ஆலோசகர்",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
WEATHER_KEY = os.getenv("WEATHER_API_KEY", "")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"

SYSTEM_PROMPT = """You are Uzhavan AI (உழவன் AI), an expert Tamil agricultural advisor.
Reply in Tamil by default. Keep answers concise and farmer-friendly.
Give specific varieties, quantities, and timelines. End with one actionable next step."""

# ── Mock data ─────────────────────────────────────────────────────────────────
CROP_RECOMMENDATIONS = [
    {"id": "rice", "name": "நெல்", "nameEn": "Paddy Rice", "emoji": "🌾", "confidence": 92,
     "expectedYield": "5,200 கிலோ/ஏக்கர்", "waterRequirement": "அதிக தண்ணீர்", "duration": "120 நாட்கள்",
     "profitEstimate": 42000, "aiReason": "மண் pH 6.5 மற்றும் நைட்ரஜன் அளவு நெல் சாகுபடிக்கு ஏற்றது.",
     "season": "குரோவை", "tags": ["அதிக மகசூல்", "பருவ பயிர்"]},
    {"id": "banana", "name": "வாழை", "nameEn": "Banana", "emoji": "🍌", "confidence": 87,
     "expectedYield": "18,000 கிலோ/ஏக்கர்", "waterRequirement": "மிதமான தண்ணீர்", "duration": "300 நாட்கள்",
     "profitEstimate": 65000, "aiReason": "கரிமப் பொருள் அளவு வாழைக்கு சாதகம்.",
     "season": "ஆண்டு முழுவதும்", "tags": ["நீண்ட காலம்", "அதிக லாபம்"]},
]

MANDI_PRICES = [
    {"id": "rice", "crop": "நெல்", "cropEn": "Paddy", "emoji": "🌾", "price": 2200, "unit": "குவிண்டால்",
     "change": 150, "changePct": 7.3, "mandi": "திருவாரூர் மண்டி"},
    {"id": "banana", "crop": "வாழை", "cropEn": "Banana", "emoji": "🍌", "price": 1800, "unit": "குவிண்டால்",
     "change": -100, "changePct": -5.3, "mandi": "கோயம்புத்தூர் மண்டி"},
    {"id": "tomato", "crop": "தக்காளி", "cropEn": "Tomato", "emoji": "🍅", "price": 3200, "unit": "குவிண்டால்",
     "change": 600, "changePct": 23.1, "mandi": "தாம்பரம் மண்டி"},
]

WEATHER_DATA = {
    "current": {"temp": 32, "humidity": 78, "condition": "மேகமூட்டம்", "wind": "14 km/h NE"},
    "alerts": [
        {"id": "w1", "urgency": "high", "icon": "🌧️", "title": "மழை எச்சரிக்கை",
         "message": "நாளை 60-80 மிமீ மழை. உரம் தெளிப்பை தள்ளிப்போடுங்கள்.",
         "action": "உரம் தள்ளிப்போடு"},
    ]
}

# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "app": "Uzhavan AI API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ── Crops ──────────────────────────────────────────────────────────────────────
@app.post("/api/crops/recommend")
async def recommend_crops(payload: dict = {}):
    """AI-based crop recommendation using soil + weather context"""
    # In production: call ML model / LLM with payload
    return CROP_RECOMMENDATIONS

@app.get("/api/crops/{crop_id}/varieties")
async def get_varieties(crop_id: str):
    return [
        {"id": "co47", "name": "CO 47", "duration": "110 நாட்கள்", "yield": "5,200 கிலோ",
         "water": "மிதம்", "resistance": ["BLB", "Brown Planthopper"], "rating": 4.5},
        {"id": "adk45", "name": "ADT 45", "duration": "105 நாட்கள்", "yield": "4,800 கிலோ",
         "water": "அதிகம்", "resistance": ["Blast"], "rating": 4.2},
    ]

@app.get("/api/crops/{crop_id}/guide")
async def get_cultivation_guide(crop_id: str):
    return {"crop": crop_id, "totalDays": 120, "stages": [
        {"name": "நிலம் தயாரிப்பு", "days": "1-7", "tasks": ["உழவு", "அடியுரம்"]},
        {"name": "விதைப்பு", "days": "8-14", "tasks": ["விதை நேர்த்தி", "நடவு"]},
    ]}

# ── Soil ───────────────────────────────────────────────────────────────────────
@app.post("/api/soil/analyze")
async def analyze_soil(payload: dict = {}):
    """Analyze soil data and return health score + recommendations"""
    ph = payload.get("pH", 6.5)
    n = payload.get("nitrogen", 180)
    score = min(100, int((n / 280) * 40 + (1 - abs(ph - 7) / 7) * 40 + 20))
    return {
        "score": score,
        "grade": "நல்லது" if score >= 70 else "சராசரி" if score >= 40 else "மோசம்",
        "recommendations": [
            "யூரியா 50 கிலோ/ஏக்கர் சேர்க்கவும்" if n < 140 else "நைட்ரஜன் சரியான அளவில் உள்ளது",
        ]
    }

@app.post("/api/soil/ocr")
async def ocr_soil_report(file: UploadFile = File(...)):
    """OCR-based soil report parsing (mock)"""
    return {"nitrogen": 165, "phosphorus": 22, "potassium": 195, "pH": 6.8, "organicCarbon": 0.65}

# ── Weather ────────────────────────────────────────────────────────────────────
@app.get("/api/weather/alerts")
async def get_weather_alerts(lat: float = 10.0, lon: float = 78.0):
    return WEATHER_DATA

@app.get("/api/weather/forecast")
async def get_forecast(lat: float = 10.0, lon: float = 78.0):
    return WEATHER_DATA

# ── Disease detection ──────────────────────────────────────────────────────────
@app.post("/api/disease/detect")
async def detect_disease(file: UploadFile = File(...)):
    """CV-based disease detection (mock — plug in real model)"""
    return {
        "detected": True,
        "disease": {
            "name": "பாக்டீரியா இலை கருகல்",
            "nameEn": "Bacterial Leaf Blight (BLB)",
            "pathogen": "Xanthomonas oryzae",
            "severity": "medium",
            "confidence": 89,
            "affectedArea": "35%",
        },
        "treatment": {
            "immediate": [
                "தாக்கப்பட்ட இலைகளை அகற்றுங்கள்",
                "Copper oxychloride 3g/L தெளிக்கவும்",
            ]
        }
    }

@app.get("/api/disease/history/{farmer_id}")
async def get_disease_history(farmer_id: str):
    return [
        {"id": "d1", "date": "2024-01-15", "crop": "நெல்", "disease": "BLB", "severity": "medium", "treated": True},
    ]

# ── Market ─────────────────────────────────────────────────────────────────────
@app.get("/api/market/prices")
async def get_mandi_prices(district: str = "Thiruvarur"):
    return MANDI_PRICES

@app.get("/api/market/trends")
async def get_price_trends(crop: str = "rice", days: int = 30):
    base = 2000
    trend = [base + random.randint(-100, 200) for _ in range(days)]
    return {"crop": crop, "days": days, "prices": trend}

@app.post("/api/market/listings")
async def create_listing(payload: dict):
    return {"id": f"L{random.randint(1000, 9999)}", "status": "created", **payload}

# ── AI Chat ────────────────────────────────────────────────────────────────────
@app.post("/api/ai/chat")
async def ai_chat(payload: dict):
    """Tamil AI advisor — calls Gemini 1.5 Flash"""
    message = payload.get("message", "")
    context = payload.get("context", {})

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY இல்லை — .env ல் சேர்க்கவும்.")

    if not _HTTPX_AVAILABLE:
        raise HTTPException(status_code=503, detail="httpx தேவை: pip install httpx")

    # Build farmer context preamble
    farmer = context.get("farmerProfile", {})
    ctx_lines = []
    if farmer.get("name"):
        ctx_lines.append(f"விவசாயி: {farmer['name']}")
    if farmer.get("landSize"):
        ctx_lines.append(f"நிலம்: {farmer['landSize']} ஏக்கர்")
    if farmer.get("district"):
        ctx_lines.append(f"மாவட்டம்: {farmer['district']}")

    contents = []
    if ctx_lines:
        contents.append({"role": "user", "parts": [{"text": "\n".join(ctx_lines)}]})
        contents.append({"role": "model", "parts": [{"text": "புரிந்தது. ஆலோசனை தருகிறேன்."}]})

    contents.append({"role": "user", "parts": [{"text": message}]})

    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 512},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}",
            json=body,
            headers={"Content-Type": "application/json"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Gemini பிழை {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    reply = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    if not reply:
        raise HTTPException(status_code=502, detail="Gemini காலியான பதில் அனுப்பியது.")

    return {"reply": reply.strip()}

# ── Schemes ────────────────────────────────────────────────────────────────────
@app.get("/api/schemes")
async def list_schemes(category: str = None, state: str = "Tamil Nadu"):
    return [
        {"id": "pmkisan", "name": "PM-Kisan Samman Nidhi", "nameTa": "பிரதமர் கிசான் சம்மான் நிதி",
         "amount": "₹6,000/ஆண்டு", "status": "open", "category": "income"},
        {"id": "pmfby", "name": "PM Fasal Bima Yojana", "nameTa": "பிரதமர் பயிர் காப்பீட்டு திட்டம்",
         "amount": "90% இழப்பீடு", "status": "open", "category": "insurance"},
    ]
