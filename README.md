# 🧠 MindMate – AI Mental Health Companion

**MindMate** is a calm, emotion-aware AI companion designed for gentle mental health check-ins, emotional tracking, and supportive conversations. It provides a safe space to express feelings, journal daily thoughts, and receive small, actionable wellness tasks.

> [!IMPORTANT]
> **MindMate is not a medical or crisis service.** It is an educational project and should not be used as a replacement for professional therapy or medical advice.

---

## ✨ Features

### 🔐 Secure Authentication (New!)
- **Login & Registration:** Secure user accounts with JWT-based authentication.
- **Forgot Password:** Simple workflow for password recovery.
- **Protected Routes:** Only registered users can access the chat, journal, and calendar features.

### 📅 Mood Calendar (New!)
- **Emotional Tracking:** A visual calendar that tracks your daily check-ins.
- **Streak Tracking:** Monitor your current and best streaks to stay consistent with your mental health journey.
- **Insights:** Automatically calculates your "Most Felt Emotion" of the month.
- **Activity Logs:** View the activities associated with your moods for better self-awareness.

### 💬 AI Chat Buddy
- **Emotion-Aware:** Classifies messages into *Happy, Sad, Angry, Anxious, or Neutral* to tailor its responses.
- **Empathetic Presence:** Gentle, non-judgmental chat with memory of the current session.
- **Safety Safeguards:** Crisis language triggers gentle suggestions to reach out to professional help.

### 📓 Journaling
- **Daily Entries:** Record your thoughts with mood emojis and emotion tags.
- **AI Reflections:** Receive a short, supportive AI-generated reflection for each saved entry.
- **History:** Keep a list of your recent entries to look back on your progress.

### 📋 Wellness Tasks
- **Actionable Steps:** Small, achievable tasks generated based on your current emotional state.
- **Progress Bar:** Track your completion of daily wellness goals.

### 👤 Profile & Customization
- **Personalization:** Set your nickname, age range, and focus areas (e.g., anxiety, sleep, focus).
- **Tone Selection:** Choose your preferred AI tone (e.g., gentle, professional, or friendly).

---

## 🛠️ Technology Stack

### Frontend
- **React (Vite + TypeScript):** Fast, modern UI development.
- **Tailwind CSS:** Sleek, responsive, and minimalist design.
- **React Router:** Seamless navigation between pages.

### Backend
- **Node.js & Express:** Robust server-side logic.
- **MongoDB (Mongoose):** Flexible NoSQL database for storing user data, chat history, and logs.
- **JWT (JSON Web Tokens):** Secure authentication and session management.

### AI
- **OpenAI API (GPT models):** Powers conversational empathy and reflections.
- **Rule-based Emotion Detection:** Lightweight classification for instant feedback.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- OpenAI API Key

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (usually `http://localhost:5173`).

---

## 🛡️ AI Safety & Ethics
This system prompt is strictly configured to ensure safety:
- **No Diagnosis:** The AI will never provide a medical diagnosis.
- **No Medication Advice:** The AI will never suggest or review medication.
- **Crisis Response:** If crisis language is detected, the AI provides immediate suggestions for helplines and professional services.

---

## 📝 License
This project is for educational use only. [Insert License Type, e.g., MIT]
