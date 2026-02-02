# Project Management Backend - Quick Start Guide

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=4000
SERVER_URL=http://localhost:4000

# Database
MONGO_URI=mongodb://your-mongodb-connection-string

# JWT Secrets
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d

# Email Configuration (for nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM_EMAIL=your-email@gmail.com
MAIL_FROM_NAME=Project Camp

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:4000` (or your configured PORT)

## Project Structure

```
src/
├── controllers/       # Business logic
│   ├── auth.controllers.js
│   ├── project.controllers.js
│   ├── task.controllers.js
│   ├── note.controllers.js
│   └── healthCheck.controllers.js
├── models/           # MongoDB schemas
│   ├── user.models.js
│   ├── project.js
│   ├── task.js
│   ├── subTask.js
│   ├── note.js
│   └── projectMember.js
├── routes/           # API endpoints
│   ├── auth.route.js
│   ├── project.route.js
│   ├── task.route.js
│   ├── note.route.js
│   └── healthCheck.routes.js
├── middlewares/      # Express middlewares
│   ├── auth.middleware.js
│   ├── multer.middleware.js
│   └── validator.middleware.js
├── utils/            # Helper functions
│   ├── api-error.js
│   ├── api-response.js
│   ├── async-handler.js
│   ├── constants.js
│   └── mail.js
├── validators/       # Input validation schemas
│   └── index.js
├── db/              # Database connection
│   └── index.js
├── app.js           # Express app configuration
└── index.js         # Server entry point
```

## API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "password": "SecurePassword123"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

#### Get Current User

```http
GET /api/v1/auth/current-user
Authorization: Bearer <accessToken>
```

### Project Endpoints

#### Create Project

```http
POST /api/v1/projects/
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

#### Get All Projects

```http
GET /api/v1/projects/
Authorization: Bearer <accessToken>
```

#### Get Project Details

```http
GET /api/v1/projects/:projectId
Authorization: Bearer <accessToken>
```

### Task Endpoints

#### Create Task

```http
POST /api/v1/tasks/:projectId
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "title": "Task Title",
  "description": "Task Description",
  "assignedTo": "userId",
  "status": "todo",
  "attachments": [file1, file2]  // Optional
}
```

#### Get All Tasks

```http
GET /api/v1/tasks/:projectId
Authorization: Bearer <accessToken>
```

#### Get Task Details

```http
GET /api/v1/tasks/:projectId/t/:taskId
Authorization: Bearer <accessToken>
```

#### Update Task

```http
PUT /api/v1/tasks/:projectId/t/:taskId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "in_progress"
}
```

#### Delete Task

```http
DELETE /api/v1/tasks/:projectId/t/:taskId
Authorization: Bearer <accessToken>
```

### Subtask Endpoints

#### Create Subtask

```http
POST /api/v1/tasks/:projectId/t/:taskId/subtasks
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Subtask Title"
}
```

#### Update Subtask

```http
PUT /api/v1/tasks/:projectId/st/:subTaskId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated Subtask",
  "isCompleted": true
}
```

#### Delete Subtask

```http
DELETE /api/v1/tasks/:projectId/st/:subTaskId
Authorization: Bearer <accessToken>
```

### Note Endpoints

#### Create Note

```http
POST /api/v1/notes/:projectId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Note content here"
}
```

#### Get All Notes

```http
GET /api/v1/notes/:projectId
Authorization: Bearer <accessToken>
```

#### Get Note Details

```http
GET /api/v1/notes/:projectId/n/:noteId
Authorization: Bearer <accessToken>
```

#### Update Note

```http
PUT /api/v1/notes/:projectId/n/:noteId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Updated note content"
}
```

#### Delete Note

```http
DELETE /api/v1/notes/:projectId/n/:noteId
Authorization: Bearer <accessToken>
```

## User Roles & Permissions

### Admin

- Full access to all features
- Can create/delete projects
- Can manage all members
- Can create/update/delete tasks, subtasks, and notes

### Project Admin

- Can create/update/delete tasks within projects
- Can create subtasks
- Can view all project content
- Cannot manage project members or project settings

### Member

- Can view projects and tasks
- Can update subtask completion status
- Can view notes
- Cannot create or modify tasks/notes

## Task Status Values

- `todo` - Not started
- `in_progress` - Currently being worked on
- `done` - Completed

## Error Handling

All API responses follow a standard format:

### Success Response

```json
{
  "statusCode": 200,
  "data": {
    "id": "...",
    "name": "..."
  },
  "message": "Operation successful",
  "success": true
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "errors": [],
  "success": false
}
```

## Common Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Troubleshooting

### Server Won't Start

1. Check if MongoDB is running
2. Verify `.env` file is properly configured
3. Check if port 4000 is already in use
4. Run `npm install` to ensure all dependencies are installed

### Database Connection Failed

1. Verify `MONGO_URI` is correct
2. Check MongoDB connection permissions
3. Ensure MongoDB server is running

### Email Verification Not Working

1. Verify email configuration in `.env`
2. Check if Gmail 2FA is enabled (use app-specific passwords)
3. Verify `MAIL_USER` and `MAIL_PASS` are correct

## Additional Resources

- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)

## Support

For issues or questions, check the IMPLEMENTATION_SUMMARY.md file for detailed information about the implementation.
