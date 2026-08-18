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

## 🌟 About Scard

**Scard** is a minimalist, card-focused digital portfolio generator for developers. Instead of building a portfolio from scratch, Scard automatically aggregates your data from platforms like **GitHub** and **LeetCode**, generating a sleek, interactive, and shareable digital business card. 

Inspired by minimalist aesthetic platforms like `path.cv` and `portfoliofy.me`, Scard is designed to put your skills, stats, and identity front and center without any of the noise.

## ✨ Features

- 🎨 **Minimalist Card UI**: A gorgeous, glass-morphism inspired digital card with dark mode support.
- 🔄 **Auto-Syncing Integrations**: Link your GitHub and LeetCode accounts and watch your contribution graphs, badges, and projects sync automatically.
- 🔐 **Persistent Authentication**: Powered by Spring Boot JDBC Sessions and Google OAuth2, ensuring you stay logged in securely.
- 🚀 **Interactive Onboarding**: A beautiful Discord-style slideshow to easily set up your profile and link your platforms.
- 📊 **Analytics Dashboard**: Track who visits your card and see your total anonymous views.
- 📸 **Export as Image**: Generate a high-resolution PNG snapshot of your dev card to share on Twitter/LinkedIn.

---

## 🛠️ Technology Stack

### Frontend
- **React 19 & TypeScript**: The latest React features with strong type safety.
- **Vite**: Lightning fast HMR and build times.
- **TailwindCSS 4.0**: Utility-first styling for the modern web.
- **Framer Motion**: Butter-smooth micro-animations and slideshow transitions.
- **Recharts & UIW Heatmap**: For beautiful contest rating charts and contribution heatmaps.

### Backend
- **Java Spring Boot 3.3**: Robust enterprise-grade backend API.
- **Spring Data JPA & Hibernate**: ORM and database management.
- **Spring Security**: Handling OAuth2 login flows.
- **PostgreSQL 16**: Relational database for structured, normalized profile and contribution data.
- **Jsoup**: Web scraping utility for fetching platform stats.

---

## 🚀 Getting Started (Local Deployment)

Want to run Scard locally or on your home lab? Follow these steps!

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Java 21+** (for Spring Boot)
3. **PostgreSQL** running locally on port 5432.
4. **Google OAuth2 Credentials**: You need a Client ID and Client Secret from Google Cloud Console.

### 1. Database Setup
Ensure PostgreSQL is running. The application expects a database named `test` (or whatever you configure).
```bash
# Example psql command to create the database
psql -U postgres -c "CREATE DATABASE test;"
```

### 2. Backend Setup
Navigate to the `backend` directory and set up your `.env` variables.

```bash
cd backend

# Create your .env file
echo "DB_URL=jdbc:postgresql://localhost:5432/test" > .env
echo "DB_USER=postgres" >> .env
echo "DB_PASSWORD=your_password" >> .env
echo "GOOGLE_CLIENT_ID=your_client_id" >> .env
echo "GOOGLE_CLIENT_SECRET=your_client_secret" >> .env

# Run the Spring Boot application
./mvnw spring-boot:run
```

### 3. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and start the Vite dev server.

```bash
cd frontend

# Install dependencies (npm or pnpm)
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`. 
*(Note: Ensure your Vite dev server proxy is configured to forward `/api` requests to your Spring Boot backend on port 8080).*

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
