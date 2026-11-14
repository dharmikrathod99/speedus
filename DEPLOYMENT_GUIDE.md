# 🚀 SPEED US - Production Deployment Guide

This project is organized as a clean, production-ready full-stack architecture with the frontend in `client/` and backend in `server/`.

---

## 📁 Project Structure

```
speedus/
├── client/                      # 🎮 Full Frontend (React, Vite, Three.js, Tailwind)
│   ├── public/                  # Static public assets
│   ├── src/                     # Game components, audio, data, physics, stores
│   ├── index.html               # Main HTML entry
│   ├── package.json             # Frontend dependencies & build scripts
│   ├── vite.config.ts           # Vite config with API proxy & vendor chunk splitting
│   ├── tailwind.config.js       # Tailwind CSS styling configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── .env.example             # Frontend environment variables template
│
├── server/                      # ⚙️ Full Backend (Express, Auth, Cloud Save, APIs)
│   ├── index.js                 # API server + production static frontend server
│   ├── package.json             # Backend dependencies & start scripts
│   ├── speedus_db.json          # File/JSON database store (users, saves, leaderboards)
│   └── .env.example             # Backend environment variables template
│
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Production Docker Compose service config
├── render.yaml                  # 1-Click Render.com deployment blueprint
├── Procfile                     # Heroku / Railway web process configuration
├── .gitignore                   # Production git ignores
├── package.json                 # Root orchestrator scripts (workspaces & monorepo)
└── DEPLOYMENT_GUIDE.md          # This complete deployment manual
```

---

## 🛠️ Quick Commands (Root Directory)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs **both** Client (Vite: `http://localhost:5173`) and Server (Express: `http://localhost:3001`) concurrently |
| `npm run build` | Builds the optimized production frontend into `client/dist` |
| `npm start` | Starts the production server which serves **both** the API (`/api/*`) and the game frontend on port `3001` |
| `npm run client:dev` | Runs only the client dev server |
| `npm run server:dev` | Runs only the backend dev server with hot reload |
| `npm run install:all` | Installs dependencies for root, `client`, and `server` |

---

## 🌐 Deployment Options

### Option 1: Deploy on Render.com (Recommended - Single Free Fullstack Service)

Render can build the client and serve both the API and game from a single service:

1. Push your project to a GitHub or GitLab repository.
2. Sign in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Select your repository.
4. Render will automatically detect `render.yaml`. If setting manually:
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `generate_a_random_long_secret_key_here`
   - `CORS_ORIGIN` = `*`
6. Click **Deploy Web Service**. Once built, your entire 3D game + backend will be live on `https://your-app.onrender.com`!

---

### Option 2: Deploy on Railway (Ultra Fast)

1. Sign in to [Railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub repo** and choose this repository.
3. Railway automatically detects `Procfile` / `Dockerfile`:
   - Build Command: `npm run install:all && npm run build`
   - Start Command: `npm start`
4. Set Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (or let Railway assign `$PORT`)
   - `JWT_SECRET` = `your_strong_secret_key`
5. In **Settings** -> **Networking**, click **Generate Domain**.
6. Done! Your game is live.

---

### Option 3: Split Deployment (Frontend on Vercel + Backend on Render/Railway)

If you prefer hosting the client on Vercel's global Edge CDN:

#### Step A: Deploy Backend (Render / Railway)
1. Deploy only the `server` folder or full repo to Render/Railway.
2. Note your backend URL (e.g. `https://speedus-backend.onrender.com`).

#### Step B: Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. In **Project Settings**:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**:
   - `VITE_API_URL` = `https://speedus-backend.onrender.com`
5. Click **Deploy**.

---

### Option 4: Docker & Docker Compose (Self-Hosted / VPS / DigitalOcean / AWS)

Deploy with a single command on any VPS (Ubuntu, Debian, CentOS, AWS EC2):

1. Install Docker & Docker Compose on your server.
2. Clone your repository:
   ```bash
   git clone <your-repo-url>
   cd speedus
   ```
3. Start the container in detached mode:
   ```bash
   docker compose up -d --build
   ```
4. Verify the container is running:
   ```bash
   docker ps
   ```
5. Access your game at `http://your-server-ip:3001`.
6. (Optional) Put Nginx with SSL (Let's Encrypt / Certbot) in front for a custom domain (`https://yourdomain.com`).

---

## 🔒 Environment Variables Summary

### Server (`server/.env`):
| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `3001` | Port Express listens on |
| `NODE_ENV` | `production` | Production mode enables static serving of `client/dist` |
| `JWT_SECRET` | `speedus_super_secret_jwt_key_2026` | Secret key for signing user authentication tokens |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (set to your frontend domain in production) |

### Client (`client/.env`):
| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:3001` | Backend API base URL for client fetch requests |

---

## ✅ Local Production Verification

To test the exact production build on your local machine:

```bash
# 1. Build the production client
npm run build

# 2. Start the production server
npm start
```

Now open **http://localhost:3001** in your browser. You will see the complete game running through the Express production server with all API routes active!

