# recroot-backend

A Node.js/Express REST API backend for **Recroot** — a recruitment platform that uses AI (via Groq) to parse and analyze resumes, with JWT-based authentication and MongoDB for data persistence.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (JWT) + bcrypt |
| AI Integration | Groq SDK |
| File Handling | Multer + pdf-parse |
| Environment Config | dotenv |
| Dev Server | Nodemon |

---

## Project Structure

```
recroot-backend/
├── Controller/       # Business logic for each resource
├── Middleware/       # Auth guards and other middleware
├── Model/            # Mongoose schemas/models
├── Routes/           # Express route definitions
├── index.js          # App entry point — server setup, DB connection
├── package.json
└── .gitignore
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- A [Groq](https://console.groq.com/) API key

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Damsacool/recroot-backend.git
cd recroot-backend
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

**4. Start the server**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will be running at `http://localhost:5000`.

---

## Features

- **User Authentication** — Register and login with hashed passwords (bcrypt) and JWT-protected routes
- **Resume Parsing** — Upload PDF resumes via Multer; extract text with pdf-parse
- **AI Analysis** — Analyze parsed resume content using the Groq LLM API
- **RESTful API** — Clean MVC structure separating routes, controllers, and models
- **CORS enabled** — Ready for cross-origin frontend integration

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the server with Node |
| `npm run dev` | Start with Nodemon (auto-restarts on file changes) |

---

## Dependencies

```json
"bcrypt": "^6.0.0"         // Password hashing
"cors": "^2.8.6"           // Cross-origin resource sharing
"dotenv": "^17.4.2"        // Environment variable management
"express": "^5.2.1"        // Web framework
"groq-sdk": "^1.2.1"       // Groq AI API client
"jsonwebtoken": "^9.0.3"   // JWT creation and verification
"mongodb": "^7.2.0"        // MongoDB driver
"mongoose": "^9.6.3"       // MongoDB ODM
"multer": "^2.1.1"         // Multipart/file upload handling
"pdf-parse": "^1.1.1"      // PDF text extraction
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

ISC
