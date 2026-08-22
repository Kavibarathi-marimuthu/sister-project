# Uzhavan AI — உழவன் AI 🌾

> **விதை முதல் விற்பனை வரை — விவசாயிக்கு AI துணை**  
> *From seed to sale — AI by the farmer's side*

A full-stack, Tamil-first AI-powered Smart Agriculture Web App. Covers the complete farmer lifecycle: soil → crop recommendation → cultivation → disease detection → yield estimation → market pricing.

---

## 🚀 Quick Start (Demo Mode — no API keys needed)

```bash
cd uzhavan-ai/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → click **"டெமோ கணக்கில் பார்க்கவும்"** to instantly explore with full mock data.

---

## 🏗️ Project Structure

```
uzhavan-ai/
├── frontend/               # React + Vite + Tailwind PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── screens/    # 12 workflow screens + cross-cutting
│   │   │   ├── features/   # VoiceAssistant
│   │   │   ├── layout/     # AppLayout (bottom nav, sidebar)
│   │   │   └── ui/         # Shared UI components
│   │   ├── contexts/       # AuthContext, AppContext
│   │   ├── data/           # Mock data (crops, weather, market, disease, schemes)
│   │   ├── lib/            # Firebase, API client, utils
│   │   └── App.jsx         # Router + lazy-loaded screens
│   ├── .env.example        # All required env vars documented
│   └── vite.config.js      # Vite + PWA plugin
└── backend/                # FastAPI Python server
    ├── app/
    │   └── main.py         # All API routes (crops, soil, weather, disease, market, AI chat)
    └── requirements.txt
```

---

## 🔑 Environment Variables

Copy `frontend/.env.example` to `frontend/.env.local` and fill in your keys:

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase Auth (OTP + Email login) | For real auth (demo works without) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | For real auth |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project | For real auth |
| `VITE_AI_API_KEY` | OpenAI/Gemini/Anthropic for Tamil AI | For real AI responses |
| `VITE_WEATHER_API_KEY` | OpenWeatherMap API | For real weather |
| `VITE_MAPS_API_KEY` | Google Maps for farm boundary | For real maps |
| `VITE_API_URL` | FastAPI backend URL | For real backend |

> **The app runs fully with beautiful mock data when no keys are set.**

---

## 📱 All 12 Screens

| # | Screen | Path | Description |
|---|--------|------|-------------|
| 1 | Login + Onboarding | `/login`, `/onboarding` | Firebase OTP + Email auth |
| 2 | Home Dashboard | `/` | Weather alerts, crop stage, mandi prices |
| 3 | Farm Map | `/farm` | GPS farm boundary, multi-farm support |
| 4 | Soil Analysis | `/soil` | OCR scan + manual N-P-K entry, gauge chart |
| 5 | AI Crop Recommendation | `/crops` | Ranked crops with confidence + AI reason |
| 6 | Variety Selection | `/crops/varieties` | Side-by-side comparison table |
| 7 | Seed & Fertilizer Plan | `/crops/seed-plan` | Auto-calculated quantities, shareable PDF |
| 8 | Cultivation Guide | `/cultivation` | Stage-wise checklist with reminders |
| 9 | Weather Intelligence | `/weather` | Actionable farm alerts, 5-day forecast |
| 10 | Disease/Pest Detection | `/disease` | Camera → AI → Tamil diagnosis + treatment |
| 11 | Crop Monitoring | `/monitor` | Growth timeline, photo diary, Digital Twin |
| 12 | Yield/Profit Estimate | `/yield` | Bar/line charts, ROI calculation |
| 13 | Market Prices | `/market` | Live mandi ticker, trend charts, listings |
| 14 | Schemes + Experts | `/schemes` | Govt scheme finder + expert booking |
| 15 | Community | `/community` | Farmer forum, posts, likes |
| 16 | Notifications | `/notifications` | Urgency-coded alerts |
| 17 | Profile | `/profile` | Settings, dark mode, large text, badges |

---

## 🎙️ Tamil AI Voice Assistant

- Floating mic button in bottom nav (center)
- Speech-to-Text → Mock/LLM → Text-to-Speech in Tamil
- Uses browser `SpeechRecognition` + `SpeechSynthesis` APIs
- Falls back to mock responses when `VITE_AI_API_KEY` is not set
- Pre-built quick questions for one-tap access

---

## 🔥 Firebase Auth Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → **Phone** (for OTP) and **Email/Password**
3. Add your domain to **Authorized Domains**
4. Copy config values to `frontend/.env.local`

The complete auth flow is built: OTP send/verify, email login/register, protected routes, demo login bypass.

---

## 🐍 Backend Setup (optional)

```bash
cd uzhavan-ai/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌐 PWA / Mobile

- Full PWA with `vite-plugin-pwa` — installable on iOS and Android
- Offline-first: last fetched data cached via Workbox service worker
- Mobile-first responsive: bottom tab bar on mobile, sidebar on desktop
- Tamil-supporting fonts: Noto Sans Tamil + Baloo 2 + Mukta
- Large text mode + dark mode + high contrast accessibility options

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary green | `#1a7d2e` (forest-600) |
| Warm wheat | `#e6b824` (wheat-400) |
| Soil brown | `#b07843` (soil-500) |
| Background | `#f7f4ef` |
| Font display | Baloo 2 (Tamil-friendly) |
| Font body | Mukta + Noto Sans Tamil |

---

## 📦 Key Dependencies

- **React 18** + **Vite 5** — fast dev experience
- **Tailwind CSS 3** — custom earthy design system
- **Framer Motion** — micro-animations throughout
- **Recharts** — yield/price/cost charts
- **Firebase 10** — Auth SDK (fully configured)
- **React Router 6** — lazy-loaded routes
- **Lucide React** — icons
- **vite-plugin-pwa** — offline PWA support

---

*Built with ❤️ for Tamil Nadu farmers. Uzhavan AI — உழவன் AI*
