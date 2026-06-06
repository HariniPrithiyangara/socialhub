# SocialHub
A full-stack, responsive mini social media feed inspired by commercial networking applications.

## Live Demo
- **Frontend URL**: [https://socialhub-pied-mu.vercel.app](https://socialhub-pied-mu.vercel.app)
- **Backend API URL**: [https://socialhub-8x81.onrender.com](https://socialhub-8x81.onrender.com)
- **API Health Check**: [https://socialhub-8x81.onrender.com/api/health](https://socialhub-8x81.onrender.com/api/health)

## Project Overview
Overloading database connections with separate collections can degrade system scalability for mini applications. SocialHub solves this by building a lightweight full-stack feed application featuring user authentication, cursor pagination, search filtering, and live notifications. It strictly respects the two-collection database layout requirement (Users and Posts) by nesting notification subdocuments inside the User document, ensuring instantaneous updates for likes and comments without performance bottleneck.

## Features
- **Secure Authentication**: Password encryption using bcryptjs and persistent JWT validation checks on client mount.
- **Text & Image Posts**: Users can publish posts containing text, an image, or both. Either field is sufficient.
- **Dynamic Post Search**: Instantly filter feed posts using a header search bar tied directly to URL query parameters (`?search=query`).
- **Live User Notifications**: Automatically triggers notifications in the user's dashboard when other users like or comment on their posts.
- **Cursor Pagination**: Fetches feed posts in chunks of 10 for optimized database querying.
- **Interactive Actions**: Instant visual feedback for toggling post likes and publishing comments.

## Tech Stack
- **Frontend**: React 18, React-Bootstrap, React-Router-Dom, Axios, custom CSS
- **Backend**: Node.js, Express.js, Multer
- **Database**: MongoDB Atlas (Mongoose NoSQL)
- **DevOps**: Vercel (Frontend), Render (Backend)

## Project Structure
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

## Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/HariniPrithiyangara/socialhub.git
   cd socialhub
   ```
2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure necessary environment variables
   npm run dev
   ```
3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Configure necessary environment variables
   npm run dev
   ```

## Environment Variables
Create `.env` files in the respective directories with the following configurations:

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SocialHub
```

## API Endpoints
- **POST `/api/auth/register`** - Registers a new user account.
- **POST `/api/auth/login`** - Authenticates credentials and issues a JWT.
- **GET `/api/auth/me`** - Retrieves authenticated user details.
- **GET `/api/auth/users`** - Lists registered users for contacts.
- **GET `/api/auth/notifications`** - Retrieves likes/comments notifications.
- **PUT `/api/auth/notifications/read`** - Marks all notifications as read.
- **GET `/api/posts`** - Gets feed posts (paginated, supports `?search=query` and `?sort=recent\|mostLiked\|mostCommented`).
- **POST `/api/posts`** - Creates a post (accepts text and/or image upload).
- **PUT `/api/posts/:id/like`** - Toggles like status (triggers notification).
- **POST `/api/posts/:id/comment`** - Submits comment (triggers notification).
- **GET `/api/posts/:id/comments`** - Gets comments.
- **DELETE `/api/posts/:id`** - Deletes own post.

## Testing
To run the backend health connection test:
- Start the server and visit `http://localhost:5000/api/health`.

## Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## Security Considerations
- **JWT Verification**: Validates request authorization tokens on all protected routes.
- **Robust CORS Rules**: Implements strict preflight CORS headers, automatically filtering subdomains and stripping trailing slashes.
- **Helmet Protection**: Sets standard secure HTTP headers.
- **Image Upload Filters**: Restricts uploads strictly to WebP, JPEG, PNG, or GIF formats under 5MB.

## Future Improvements
- **WebSocket Alerts**: Push notifications for likes/comments instantly using Socket.io.
- **Watchlists/Faves**: Pin specific posts or follow individual creators.
- **Direct Messages**: Simple inbox for messaging other users in the contact sidebar.

## Author
Harini Prithiyangara
