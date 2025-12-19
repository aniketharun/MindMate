## MindMate – AI Mental Health Companion

MindMate is a calm, emotion-aware AI companion for gentle mental health check-ins.  
It is **not** a medical or crisis service.

### Stack

- **Frontend**: React (Vite + TypeScript), Tailwind CSS, React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth
- **AI**: OpenAI API (chat completions), lightweight rule-based emotion detection

### Features

- **AI Chat Buddy**: Emotion-aware, empathetic chat with safety prompt; stores history per user.
- **Emotion Detection**: Classifies messages into Happy / Sad / Angry / Anxious / Neutral and feeds into prompting.
- **Journaling**: Daily journal entries with mood emoji, emotion tags, and short AI reflections.
- **Tasks to Feel Better**: Small, achievable wellness tasks generated from current emotion.
- **Profile**: Name / nickname, age range, focus areas, preferred AI tone, daily check-in toggle.

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a connection string)
- OpenAI API key

### Backend Setup (`server`)

1. Create an `.env` file in `server` based on `env.example`:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindmate
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
```

2. Install dependencies and run the server:

```bash
cd server
npm install
npm run dev
```

The API will be available at `http://localhost:5000/api`.

### Frontend Setup (`client`)

1. Install dependencies and run the dev server:

```bash
cd client
npm install
npm run dev
```

2. Open the URL that Vite prints (usually `http://localhost:5173`).

### Main Screens

- **Chat**: Left-aligned AI messages, right-aligned user messages, gentle follow-up questions, visible detected emotion tag.
- **Journal**: Mood picker + text area; AI reflection is shown under each saved entry; list of recent entries.
- **Tasks**: Emotion selector, generated checklist (max ~4 tasks), and simple progress bar.
- **Profile**: Editable form for name, age range, focus areas, tone, and daily check-in toggle; logout button.

### AI Safety

- The system prompt clearly states:
  - No diagnosis.
  - No medication advice.
  - Not a replacement for professional therapy.
- Crisis language triggers extra gentle messaging and suggestions to reach out to trusted people, professionals, or local helplines.

### Notes

- This project is for educational use and should not be deployed as a standalone mental health service without proper clinical oversight and review.




