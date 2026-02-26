# DSA Roadmap Tracker

A comprehensive tool to track your Data Structures and Algorithms progress, featuring an AI Mentor powered by Google Gemini and secure authentication via NextAuth.

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20 or higher (v25 recommended)
- **Docker**: For running the PostgreSQL database
- **NPM**: Package manager

### 2. Database Setup
The project uses PostgreSQL. You can start it using Docker Compose:

```bash
docker-compose up -d
```

> [!NOTE]
> Ensure your database credentials in `.env` match the `docker-compose.yml` file. Default password in `docker-compose` is `password`, but `.env` might be set to `admin`.

### 3. Backend Configuration
Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3001
DATABASE_URL="postgresql://postgres:admin@localhost:5432/dsatracker?schema=public"
NEXTAUTH_SECRET="your-super-secret-jwt-key"
GEMINI_API_KEY="your-google-gemini-api-key"
```

Sync the database schema and seed initial data:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Frontend Configuration
Navigate to the `frontend` directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/dsatracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 5. Running the Application
You can run both frontend and backend concurrently from the **root directory**:

```bash
cd ..
npm install
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 🛠️ Deployment as a System Service (Linux)

To run the application as a background service using `systemd`, follows these steps:

### 1. Prepare the Service File
A template file `dsa-tracker.service` is provided in the root directory. Ensure the `User`, `WorkingDirectory`, and `ExecStart` paths match your system setup.

### 2. Install the Service
Copy the service file to the systemd directory:
```bash
sudo cp dsa-tracker.service /etc/systemd/system/dsa-tracker.service
```

### 3. Initialize the Service
Reload the systemd daemon to recognize the new service:
```bash
sudo systemctl daemon-reload
```

### 4. Command Reference
This service is configured **not** to start automatically on boot. You must control it manually:

| Action | Command |
| :--- | :--- |
| **Start** | `sudo systemctl start dsa-tracker` |
| **Stop** | `sudo systemctl stop dsa-tracker` |
| **Status** | `sudo systemctl status dsa-tracker` |
| **Check Logs** | `journalctl -u dsa-tracker -f` |

---

## 🔑 Key Features
- **Roadmap Visualization**: Track topics from Basic to Advanced.
- **AI Mentor**: Get hints and strategy guides for complex problems using Gemini AI.
- **LeetCode Integration**: Direct links to practice problems.
- **Authentication**: Secure Google OAuth login.

## 📁 Project Structure
- `/frontend`: Next.js 16 application with ReactFlow.
- `/backend`: Express.js server with Prisma ORM.
- `/prisma`: Shared database schema and migrations.
