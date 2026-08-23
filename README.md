<div align="center">
  <img src="./frontend/public/logos/scard.png" alt="Scard Logo" width="100" />
  
  # Scard
  **Your Concise Dev Profile & Portfolio**
  
  [![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react&style=for-the-badge)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&style=for-the-badge)](https://vitejs.dev/)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?logo=spring-boot&style=for-the-badge)](https://spring.io/projects/spring-boot)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.14-4169E1?logo=postgresql&style=for-the-badge)](https://www.postgresql.org/)
  [![OAuth2](https://img.shields.io/badge/Google_OAuth2-Secure-brightgreen?logo=google&style=for-the-badge)](https://developers.google.com/identity/protocols/oauth2)
</div>

---

## About Scard

**Scard** is a minimalist, card-focused digital portfolio generator for developers. Instead of building a portfolio from scratch, Scard automatically aggregates your data from platforms like **GitHub**, **LeetCode**, and **Codeforces**, generating a sleek, interactive, and shareable digital business card. 

Inspired by minimalist aesthetic platforms like `path.cv` and `portfoliofy.me`, Scard is designed to put your skills, stats, and identity front and center without any of the noise.

## Features

- **Minimalist Card UI**: A gorgeous, glass-morphism inspired digital card with dark mode support.
- **Auto-Syncing Integrations**: Link your GitHub, LeetCode, and Codeforces accounts and watch your contribution graphs, badges, and projects sync automatically.
- **Persistent Authentication**: Powered by Spring Boot JDBC Sessions and Google OAuth2, ensuring you stay logged in securely.
- **Interactive Onboarding**: A beautiful Discord-style slideshow to easily set up your profile and link your platforms.
- **Analytics Dashboard**: Track who visits your card and see your total anonymous views.
- **Export as Image**: Generate a high-resolution PNG snapshot of your dev card to share on Twitter/LinkedIn.
- **Robust Security**: Rate limited endpoints (Bucket4j), parameterized SQL, CSRF protection, and gracefully handled exceptions.

---

## Architecture & Database

Scard is built on a modern decoupled architecture:
- **Frontend**: A Single Page Application (SPA) built with React and Vite. Uses React Router for client-side routing.
- **Backend**: A Java Spring Boot RESTful API that handles data scraping, aggregation, and session management.
- **Database**: PostgreSQL handles persistent data. Schema migrations are strictly managed using **Flyway**.

The database architecture is fully normalized to 3NF. Notable tables include:
- `app_user`: Stores OAuth identity and session mapping.
- `profile`: Stores user presentation data (custom images, bios).
- `contribution`: An indexed table replacing raw JSON heatmaps, tracking daily platform commits/submissions.
- `badge`, `project`, `contest`: Linked as Many-To-One relationships for efficient relational querying.

---

## Technology Stack

### Frontend
- **React 19 & TypeScript**: The latest React features with strong type safety.
- **Vite**: Lightning fast HMR and build times.
- **TailwindCSS 4.0**: Utility-first styling for the modern web.
- **Framer Motion**: Butter-smooth micro-animations and slideshow transitions.
- **Recharts**: For beautiful contest rating charts.
- **Vitest**: Blazing fast unit testing framework.

### Backend
- **Java Spring Boot 3.3**: Robust enterprise-grade backend API.
- **Spring Data JPA & Hibernate**: ORM and database management.
- **Spring Security**: Handling OAuth2 login flows and CSRF protection.
- **PostgreSQL 16**: Relational database for structured profile and contribution data.
- **Flyway**: Database schema migration and version control.
- **Bucket4j**: Token-bucket algorithm for rate limiting API abuse.
- **Jsoup**: Web scraping utility for fetching platform stats.

---

## Getting Started (Local Deployment)

Want to run Scard locally or on your home lab? Follow these steps.

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Java 21+** (for Spring Boot)
3. **PostgreSQL** running locally on port 5432.
4. **Google OAuth2 Credentials**: You need a Client ID and Client Secret from Google Cloud Console.
5. **GitHub PAT**: A Personal Access Token (classic) with `public_repo` scope for syncing GitHub projects.

### 1. Database Setup
Ensure PostgreSQL is running. Create a database named `scard`.
```bash
# Example psql command to create the database
psql -U postgres -c "CREATE DATABASE scard;"
```

### 2. Backend Setup
Navigate to the `backend` directory, set up your variables, and run the server.

```bash
cd backend

# Copy the environment template
cp .env.example .env

# EDIT .env NOW and add your PostgreSQL password, Google OAuth IDs, and GH Token

# Run the Spring Boot application (Flyway will automatically generate the schema)
./mvnw spring-boot:run
```

### 3. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and start the Vite dev server.

```bash
cd frontend

# Copy the environment template
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`. 
*(Note: Ensure your Vite dev server proxy is configured to forward `/api` requests to your Spring Boot backend on port 8080).*

---

## Testing and CI/CD

This project uses **GitHub Actions** for Continuous Integration.
On every pull request to `main`, the CI pipeline automatically:
1. Runs backend **Maven Unit Tests** (Mockito/JUnit 5).
2. Runs frontend **Vitest** suites.
3. Builds the frontend React bundle to check for compilation errors.

---

## Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the issues page.

## License
This project is open-source and available under the [MIT License](LICENSE).
