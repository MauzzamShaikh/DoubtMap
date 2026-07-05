# DoubtMap 🎓
### Real-Time Classroom Doubt Management Platform

A full-stack web application that transforms how students ask questions and how teachers identify confusion during live lectures — powered by real-time sockets, AI assistance, and live heatmap analytics.

---

## 🌟 Features

### For Teachers
- **Create live sessions** with a unique 6-character code + QR
- **Real-time doubt feed** — see student doubts appear live without refreshing
- **Topic Heatmap** — color-coded bar chart showing which topics have the most confusion
- **Confidence Poll** — launch emoji-based polls (😕 / 😐 / 😊) to gauge class understanding instantly
- **Resolve doubts** — mark doubts as resolved; students see it live
- **End Session + Summary** — session summary with top doubts, topic breakdown, resolved vs unresolved count
- **My Sessions** — view all past and active sessions
- **PDF Export** — download session summary as a PDF report

### For Students
- **Join via QR scan or session code** — no friction
- **Ask AI first** — get instant AI-powered explanations before posting to the teacher
- **Post doubts to teacher** — AI moderates submissions to filter spam/off-topic content
- **Upvote doubts** — surface the most common confusions
- **Confidence Poll voting** — tap an emoji to respond to teacher polls
- **My History** — view all past doubts and AI conversations for revision (requires login)
- **Anonymous by design** — teacher never sees student identity

### Authentication
- Separate auth for teachers and students (JWT-based)
- Email verification on signup
- Forgot password / reset via email
- Students can use the app anonymously without logging in

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Recharts, Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Real-time | Socket.io |
| AI | Groq API (Llama 3.3 70B) |
| Auth | JWT, bcryptjs |
| Email | Nodemailer + Gmail SMTP |
| QR | qrcode.react, html5-qrcode |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (DB) |

---

## 📁 Project Structure

```
DoubtMap/
├── backend/
│   ├── middleware/        # auth.js, studentAuth.js
│   ├── models/            # Teacher, Student, Session, Doubt, Poll, AiQuery
│   ├── routes/            # All API routes
│   ├── utils/             # generateCode.js, sendEmail.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # All page components
│   │   ├── utils/         # auth.js, studentAuth.js, fingerprint.js
│   │   ├── api.js         # Axios instance
│   │   └── socket.js      # Socket.io client
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)
- Gmail account with App Password enabled

### 1. Clone the repository
```bash
git clone https://github.com/MauzzamShaikh/DoubtMap.git
cd DoubtMap
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_api_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_16_char_app_password
```

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:5000`

---

## 🌐 Environment Variables

### Backend
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Backend server port (default: 5000) |
| `CLIENT_URL` | Frontend URL (for CORS) |
| `JWT_SECRET` | Secret key for JWT signing |
| `GROQ_API_KEY` | Groq API key for AI features |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_PASS` | Gmail App Password (16 chars) |

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Teacher registration |
| POST | `/api/auth/login` | Teacher login |
| POST | `/api/student-auth/register` | Student registration |
| POST | `/api/student-auth/login` | Student login |
| POST | `/api/sessions` | Create session (teacher) |
| GET | `/api/sessions` | Get teacher's sessions |
| GET | `/api/sessions/:code` | Get session by code |
| POST | `/api/sessions/:code/doubts` | Submit a doubt |
| GET | `/api/sessions/:code/doubts` | Get all doubts |
| PATCH | `/api/sessions/doubts/:id/upvote` | Upvote a doubt |
| PATCH | `/api/sessions/doubts/:id/resolve` | Resolve a doubt |
| GET | `/api/sessions/:code/analytics` | Topic-wise analytics |
| PATCH | `/api/sessions/:code/end` | End a session |
| GET | `/api/sessions/:code/summary` | Session summary |
| POST | `/api/ai/ask` | Ask AI a question |
| POST | `/api/polls/:code/launch` | Launch a poll |
| GET | `/api/polls/:code/active` | Get active poll |
| PATCH | `/api/polls/:id/vote` | Vote on a poll |
| GET | `/api/history` | Student's doubt history |
| POST | `/api/forgot-password/teacher` | Teacher forgot password |
| POST | `/api/forgot-password/student` | Student forgot password |

---

## 🔌 Real-Time Events (Socket.io)

| Event | Direction | Description |
|---|---|---|
| `join_session` | Client → Server | Join a session room |
| `new_doubt` | Server → Client | New doubt submitted |
| `doubt_updated` | Server → Client | Doubt upvoted or resolved |
| `poll_launched` | Server → Client | New poll started |
| `poll_updated` | Server → Client | Poll vote received |
| `session_ended` | Server → Client | Session ended by teacher |

---

## 👥 Team

| Name | Role |
|---|---|
| Mauzzam Shaikh | Full Stack Developer |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🔗 Links

- **Live App**: Coming soon
- **GitHub**: https://github.com/MauzzamShaikh/DoubtMap
