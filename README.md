# 🚀 SocialHub — Mini Social Post Application

SocialHub is a full-stack, responsive mini social networking application built with **React.js (Vite)**, **Node.js (Express)**, and **MongoDB Atlas**. It is inspired by modern social feeds like TaskPlanet, providing a polished and premium UI built purely with custom CSS rules and React-Bootstrap (without TailwindCSS).

This application was developed as a full-stack project featuring pagination, user authentication, media uploads, query search filtering, and live user notifications.

---

## 🎨 Core Features

- **🔐 Robust Authentication**: Secure user registration and login utilizing JSON Web Tokens (JWT) stored in LocalStorage, with token validation on application mount.
- **📝 Create Posts**: Users can publish text updates, images, or both. Either text or image is sufficient to submit a post.
- **💬 Interactivity (Likes & Comments)**: Instant visual feedback when liking a post or writing inline comments. 
- **🔍 Full-Text Feed Search**: A search engine built directly into the navigation header. Users can filter posts by text content. The search state is bound to URL query parameters (`?search=query`) for shareable, bookmarkable search results.
- **🔔 Live Notifications**: Notifications generated instantly when other users like or comment on your posts. Notifications are stored efficiently as embedded subdocuments inside the User document to respect database structure guidelines.
- **⚡ Performance & Pagination**: The main feed implements efficient cursor pagination, fetching posts in chunks to minimize bandwidth and DB pressure.
- **📱 Responsive Layout**: A premium 3-column desktop layout that collapses gracefully to a single-column layout on tablet and mobile screens.

---

## 📁 Project Structure

```
social/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers (authController, postController)
│   │   ├── middleware/    # authMiddleware, uploadMiddleware (multer image filter)
│   │   ├── models/        # Database Schemas (User.js with Notifications, Post.js)
│   │   └── routes/        # Router declarations (authRoutes, postRoutes)
│   ├── uploads/           # Local storage for uploaded images
│   ├── server.js          # App initialization & DB connection
│   └── package.json
└── frontend/         # React + Vite Client
    ├── src/
    │   ├── api/           # Axios instance & endpoints mapping (index.js)
    │   ├── components/
    │   │   ├── layout/    # Structural templates (Navbar, Sidebar, RightSidebar)
    │   │   ├── post/      # Feature components (CreatePostBox, PostCard, CommentSection)
    │   │   └── ui/        # Shared elements (Avatar generator, Skeletons)
    │   ├── context/       # Authentication Provider (AuthContext)
    │   ├── pages/         # Full layouts (AuthPage, FeedPage)
    │   └── index.css      # Core design system stylesheet
    └── package.json
```

---

## 🛠️ Local Installation & Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas cluster (or a local MongoDB instance)

### 1. Run the Backend Server
Navigate to the `backend` directory, install dependencies, configure the environmental variables, and run the nodemon development server.
```bash
cd backend
npm install
```
Create a `.env` file in the root of the `backend/` directory (matching the variables in `.env.example`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
Start the server:
```bash
npm run dev
```
The server will boot up on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

### 2. Run the Frontend App
Navigate to the `frontend` directory, install dependencies, and start the Vite server.
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 API Reference

### Auth & User Routes
| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| `POST` | `/api/auth/register` | No | Creates a new account |
| `POST` | `/api/auth/login` | No | Validates password and issues JWT |
| `GET` | `/api/auth/me` | Yes | Retrieves user info from JWT |
| `GET` | `/api/auth/users` | Yes | Lists other registered users for contacts |
| `GET` | `/api/auth/notifications` | Yes | Retrieves user's likes/comments notifications |
| `PUT` | `/api/auth/notifications/read` | Yes | Marks all user notifications as read |

### Post & Interaction Routes
| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| `GET` | `/api/posts` | Optional | Gets feed posts (paginated, supports `?search=query` and `?sort=recent\|mostLiked\|mostCommented`) |
| `POST` | `/api/posts` | Yes | Creates post (accepts `image` multipart upload & `text`) |
| `PUT` | `/api/posts/:id/like` | Yes | Toggles like status (adds notification for author) |
| `POST` | `/api/posts/:id/comment` | Yes | Submits comment (adds notification for author) |
| `GET` | `/api/posts/:id/comments` | No | Retrieves comment list |
| `DELETE`| `/api/posts/:id` | Yes | Deletes own post and unlink local image |

---

## 🚀 Deployment Instructions

- **Frontend**: Deploy `frontend/` directory to **Vercel** or **Netlify**. Ensure the build directory is `dist`, compile command is `vite build`, and configure `VITE_API_URL` to target your production backend URL.
- **Backend**: Deploy `backend/` directory to **Render**, **Railway**, or **Heroku**. Set the Node environment variables appropriately.
- **Database**: Host on **MongoDB Atlas** and configure network whitelist settings to allow incoming requests from all IP addresses (`0.0.0.0/0`) or your specific deployment IPs.
