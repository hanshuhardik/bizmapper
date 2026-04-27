# BizMapper 🗺️

**Describe your business → get your tech blueprint instantly with AI**

A full-stack web application that analyzes business descriptions using Groq API (Llama 3.3 70B) and provides actionable tech stack recommendations, business process mapping, and budget estimates.

---

---

## Tech Stack

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-404D59?logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-6E56CF?logo=groq&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFA500?logo=firebase&logoColor=white)
![Render](https://img.shields.io/badge/Render.com-Backend-46E3B7?logo=render&logoColor=white)

---

## Features

✨ **Smart Business Analysis** - Powered by Groq API (Llama 3.3 70B)
🏗️ **Process Mapping** - Identifies key business processes with priority levels
💻 **Tech Recommendations** - Curated tech stack suggestions with costs
💰 **Budget Estimation** - Estimated annual costs in INR
📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
🚀 **Production Ready** - Deployed on Render (backend) & Firebase (frontend)

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Groq API key (from [groq.com](https://groq.com))

### Step 1: Clone the Repository

```bash
git clone https://github.com/hanshuhardik/bizmapper.git
cd bizmapper
```

### Step 2: Configure API Keys

Add your Groq API key to the backend:

```bash
echo "GROQ_API_KEY=your_actual_key_here" >> bizmapper-server/.env
```

### Step 3: Run Backend Server

```bash
cd bizmapper-server
npm install
npm start
# Server runs on http://localhost:3001
```

### Step 4: Run Frontend (in a new terminal)

```bash
cd bizmapper-client
npm install
npm run dev
# App opens at http://localhost:5173
```

### Step 5: Start Analyzing!

Open http://localhost:5173 in your browser and describe your business

---

## Project Structure

```
bizmapper/
├── bizmapper-server/          # Express backend (Phase 1)
│   ├── server.js              # Main server with /api/analyze endpoint
│   ├── package.json           # Dependencies & scripts
│   └── .env                   # API keys (not committed)
│
├── bizmapper-client/          # React + Vite frontend (Phase 2)
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── App.css            # Styling (plain CSS)
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Dependencies & scripts
│
└── .github/workflows/         # CI/CD pipelines
    ├── deploy-backend.yml     # Auto-deploy to Render
    └── deploy-frontend.yml    # Auto-deploy to Firebase
```

---

## Deployment

### Backend Deployment (Render.com)

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `node server.js`

- Environment Variable: `GROQ_API_KEY=your_key`

4. Deploy button available in `.github/workflows/deploy-backend.yml`

### Frontend Deployment (Firebase Hosting)

1. Set up Firebase project:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```

2. Update `.firebaserc` with your project ID

3. Deploy:

   ```bash
   npm run build
   firebase deploy
   ```

4. Automated deployment via GitHub Actions on push to `main`

---

## API Endpoint

### POST `/api/analyze`

**Request:**

```json
{
  "businessDescription": "E-commerce store for sustainable products"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "processes": [
      {
        "name": "Order Management",
        "description": "Handle customer orders and fulfillment",
        "priority": "high"
      }
    ],
    "techStack": [
      {
        "tool": "Stripe",
        "category": "Payment Processing",
        "reason": "Industry-leading payment gateway with excellent support for INR",
        "cost": "$0 + 2.9% + ₹15 per transaction"
      }
    ],
    "summary": "Your e-commerce business needs...",
    "estimatedBudget": {
      "min": 50000,
      "max": 200000,
      "currency": "INR"
    }
  }
}
```

---

## GitHub Actions CI/CD

Two workflows automatically deploy on push to `main`:

- **`deploy-backend.yml`** - Redeploys backend when `bizmapper-server/` changes
- **`deploy-frontend.yml`** - Rebuilds and redeploys frontend when `bizmapper-client/` changes

Required secrets in GitHub repository settings:

- `RENDER_SERVICE_ID` - Your Render service ID
- `RENDER_API_KEY` - Your Render API key
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- `GROQ_API_KEY` - Groq API key

---

## Project Phases

- ✅ **Phase 1** - Backend server with Groq integration
- ✅ **Phase 2** - React Vite frontend with UI
- 🔄 **Phase 3** - Advanced features (saved analyses, user auth, etc.)

---

## License

MIT License - feel free to use this for your projects!

---

## Author

**Hardik Mehta**

- GitHub: [github.com/hanshuhardik](https://github.com/hanshuhardik)
- Built with ❤️ for the startup community

---

## Support

Have questions or found a bug? Feel free to open an issue or submit a pull request!
