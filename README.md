# RCTlab

A React-based coding platform for learning and practicing programming problems.

For a comprehensive guide covering features, setup, AI Chat, Judge0, troubleshooting and more, see: `RCTlab_Complete_Guide.md`.

## Features

- **Code Editor**: Built-in code editor with syntax highlighting
- **Problem Sets**: Curated collection of programming problems
- **Code Execution**: Run and test your code in real-time
- **Mobile Emulator**: Test your web applications on mobile devices
- **User Authentication**: Secure login and registration system
- **Progress Tracking**: Monitor your learning progress

## Tech Stack

### Frontend
- React 16.13.1
- React Router DOM
- Axios for API calls
- CodeMirror for code editing
- Prism.js for syntax highlighting

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt for password hashing

### Development Tools
- Webpack for bundling
- Hot reloading for development
- CORS enabled for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RCTlab
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   ```

3. **Configure environment**
   - Update MongoDB connection string in `server/index.js`
   - Set JWT secret in `server/routes/auth.js`

4. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm start
   
   # Start frontend (from root directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
RCTlab/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── index.js           # Main entry point
├── server/                 # Backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   └── index.js           # Server entry point
├── public/                 # Static assets
└── package.json           # Project configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Problems
- `GET /api/problems` - Get problem list
- `GET /api/problems/:id` - Get problem details
- `POST /api/problems/status` - Update problem status

## Development

### Code Style
- Use functional components with hooks
- Follow React best practices
- Maintain consistent error handling
- Use proper TypeScript-like prop validation

### Testing
- Test authentication flows
- Verify code execution
- Check mobile responsiveness
- Validate API endpoints

## Deployment

### Frontend
- Build with `npm run build`
- Deploy to static hosting (Netlify, Vercel, etc.)

### Backend
- Set production environment variables
- Use PM2 or similar process manager
- Configure MongoDB Atlas for production
- Set up proper CORS origins

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
