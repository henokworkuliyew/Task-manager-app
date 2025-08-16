# Task Manager App

A full-stack MERN application for managing tasks with authentication, real-time updates, and a modern UI.

## Features

- 🔐 User authentication (login/register)
- 📧 Password reset functionality
- 📋 Task management (CRUD operations)
- 🎯 Task priorities and status tracking
- 📅 Due date management
- ⭐ Important task marking
- 🔍 Search and filter tasks
- 📊 Task statistics dashboard
- 🌙 Dark/Light theme
- 📱 Responsive design
- ⚡ Real-time updates

## Tech Stack

### Frontend
- React 18
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod validation
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- express-validator
- nodemailer
- helmet
- cors
- compression

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**

   Create `backend/.env`:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

   Create `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development servers**

   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task as complete
- `PATCH /api/tasks/:id/toggle-importance` - Toggle task importance

## Project Structure

```
task-manager-app/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build for production with production env
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@taskmanager.com or create an issue in the repository.

