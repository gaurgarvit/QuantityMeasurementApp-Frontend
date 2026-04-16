# Quantity Measurement Frontend

This is a modern React.js frontend for the Quantity Measurement Application.

## Technologies Used

- **React.js** (Vite)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **React Router** for navigation
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Backend Spring Boot application running on `http://localhost:8080`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the provided URL (usually `http://localhost:5173`).

## Project Structure

- `src/api`: API service layer for backend communication.
- `src/components`: Reusable UI components.
- `src/pages`: Main application pages (Login, Register, Dashboard, History).
- `src/utils`: Constants and utility functions.
- `src/App.jsx`: Main application routing and entry point.
- `src/index.css`: Tailwind CSS and global styles.

## Features

- **Authentication**: Secure login and registration.
- **Dynamic Measurement**: Convert, compare, and perform operations on Length, Volume, Weight, and Temperature.
- **History Tracking**: View past operations and their results.
- **Modern UI**: Clean, responsive design with animations.
