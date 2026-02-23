# Felicity Event Management System

A full-stack MERN application designed to manage campus-wide events, club memberships, and merchandise sales.

## System Overview
The platform facilitates a three-tier user hierarchy:
* **Admin**: Oversees platform integrity, manages club accounts, and handles manual password resets for organizers.
* **Organizer**: Manages event lifecycles (Draft/Published/Closed), defines custom registration forms, and exports participant data.
* **Participant**: Browses events, follows specific clubs, and manages personal event registrations.

## Key Features
* **Role-Based Access Control (RBAC)**: Secure routing and API protection ensuring users only access permitted modules.
* **Dynamic Form Builder**: Organizers can define custom fields (text, dropdown, checkbox) for event-specific registration requirements.
* **Dual Event Architecture**: Support for both standard events and merchandise-based sales with stock management.
* **Follow System**: Persistent club-following logic for participants to track specific campus organizers.

## Design Choices & Implementation
* **State Management**: Utilizes React Hooks (`useState`, `useEffect`) and `localStorage` for session persistence.
* **Navigation Architecture**: Implemented a dynamic Navbar that triggers re-renders on URL changes via `useLocation` to ensure immediate UI updates upon login/logout.
* **Strict Editing Policy**: Published events enforce data integrity by locking core fields while allowing extensions to deadlines and capacity.
* **Optimistic UI Updates**: Used for the follow/unfollow toggle to provide an instantaneous user experience while background API calls sync with the database.

## Tech Stack
* **Frontend**: React.js, React Router
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Auth**: JSON Web Tokens (JWT)