Felicity Event Management System

Project Overview:
This project is a full-stack MERN application designed for managing campus events. It allows students to view and register for events while providing club organizers and admins with tools to create and manage them.

Deployment Links:
Frontend URL: https://felicity-event-management-three.vercel.app

Backend URL: https://felicity-event-management-oqqg.onrender.com

Technical Implementation:
-> The frontend is built using React.js and is hosted on Vercel.

-> The backend is a Node.js and Express server hosted on Render.

-> The database is a MongoDB Atlas cloud cluster.

-> A centralized api.js file handles requests and switches between localhost and the production Render URL.

-> User authentication and role-based access control are handled via JWT (JSON Web Tokens).

Design Assumptions:
-> Users are assumed to have a stable internet connection to interact with the MongoDB cloud database.

-> The system assumes three user roles (Participant, Organizer, and Admin) with distinct permission levels.

-> It is assumed and accepted that the first request may take 30-50 seconds to wake up the server due to Render’s free tier.

-> Event images are assumed to be managed via external URLs to maintain deployment efficiency.

Implementation Details:
-> The backend server.js is configured with a CORS policy to explicitly allow requests from the Vercel domain.

-> Sensitive data like the MongoDB connection string and JWT secrets are managed via platform environment variables rather than hardcoded files.

-> Navigation between the login, registration, and dashboards is managed by React Router.