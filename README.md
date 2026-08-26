# Scard

Scard is a developer portfolio generator that seamlessly connects with your existing programming profiles to create a unified showcase of your skills, achievements, and contributions.

## Features

- **Automated Profile Aggregation**: Automatically fetch statistics and metrics from platforms like GitHub and LeetCode.
- **Dynamic Background Synchronization**: Keeps your profile data up-to-date with background workers that scrape data periodically.
- **Unified Analytics Dashboard**: View comprehensive analytics about your open-source contributions and problem-solving history.
- **Customizable Public Profiles**: Share a personalized, public-facing developer card that updates effortlessly.

## Architecture & Workflow

1. **Authentication**: Users authenticate securely via Google OAuth2.
2. **Onboarding**: Users link their GitHub, LeetCode, and provide a contact email.
3. **Data Synchronization**: A backend `ScheduledScraperService` acts as a cron job, pulling data from connected platforms using `PlatformFetcher` implementations.
4. **Data Persistence**: Metrics, contest data, and badges are stored in a PostgreSQL database using Spring Data JPA.
5. **Presentation**: The React frontend accesses the data via REST endpoints to construct interactive profile cards.

## Technology Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Java, Spring Boot (Spring Web, Spring Security, Spring Data JPA)
- **Database**: PostgreSQL (managed with Flyway migrations)
- **Infrastructure**: Docker, GitHub Actions CI/CD

## Core API Endpoints

### Public
- `GET /api/profiles`: Fetch a paginated list of all public developer profiles.
- `GET /api/profile/{username}`: Fetch the detailed public profile of a specific user.
- `GET /api/profile/{username}/contributions`: Fetch the user's contribution heatmap data.

### Protected (Requires Authentication)
- `GET /api/profile`: Retrieve the authenticated user's complete profile.
- `PATCH /api/profile`: Update the user's profile information.
- `POST /api/profile`: Complete the initial onboarding process and link platforms.
- `GET /api/profile/analytics`: Access detailed analytics regarding profile views and metrics.
- `GET /api/profile/check-*`: Endpoints to verify the uniqueness of usernames, emails, and platform accounts.

## Database Schema Highlights

The application relies on several core entities:
- **User**: Core authentication data linked to Google OAuth.
- **Profile**: Contains the display name, custom URL, designation, and display preferences.
- **ProblemStats**: Stores aggregated problem-solving statistics (e.g., LeetCode easy/medium/hard counts).
- **Contest**: Records historical contest participation and ratings.
- **Badge**: Represents achievements fetched from external platforms.
- **Project**: Pinned repositories or custom portfolio projects.

## Local Development

The project is fully containerized for local development and testing.

```bash
# Build and start all services
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Database: `postgres://localhost:5432`

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration, automatically validating:
- Secret scanning (Gitleaks)
- Backend unit and integration tests (Spring Boot Test with a PostgreSQL service container)
- Frontend unit tests (Vitest)
- Container build sanity checks
