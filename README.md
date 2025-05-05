# UPV Calendar Application

This is a web application for managing and viewing exam schedules at UPV.

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Java 11+ and Maven (for local backend development)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database configuration
DB_USERNAME=postgres
DB_PASSWORD=secure_password_here

# JWT configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000
```

### Running with Docker Compose

To start the application in development mode with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

### Accessing the Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Database: localhost:5432

## Production Deployment

For production deployment, you should:

1. Create proper environment variables in your production environment
2. Use a proper database backup strategy
3. Configure HTTPS with proper certificates
4. Use secure password policies

## Security Considerations

- Never commit the `.env` file or any secrets to version control
- For production, use a more secure JWT secret than the development default
- Consider using managed database services in production
- Configure proper backup strategies for the database

## Features

- 🔍 Browse all exam schedules
- 📝 Create, edit, and delete exams
- 🔎 Filter by degree, course year, semester, or search by subject name
- 📆 View exam details including date, time, duration, and location

## Technology Stack

- **Backend**: Spring Boot, Spring Data JPA, Spring Security
- **Database**: PostgreSQL
- **Frontend**: Angular
- **Deployment**: Docker & Docker Compose

## Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Java JDK 11+](https://adoptopenjdk.net/) (for local development)
- [Node.js 14+](https://nodejs.org/) and [Angular CLI](https://angular.io/cli) (for local development)

## Getting Started

### Environment Variables

For security and configuration, the application uses environment variables. Copy the example file to create your own:

```bash
cp env.example .env
```

Edit the `.env` file to set custom values for:
- Database credentials
- JWT secret key (important for production!)
- API URLs
- CORS settings

### Running with Docker (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd upv-calendar

# Create and configure your environment variables
cp env.example .env
nano .env  # Edit values as needed

# Start the application with hot reload for development
docker-compose -f docker-compose.dev.yml up

# Or simply (since docker-compose.dev.yml is the default)
docker-compose up
```

Once started, the application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api

### Local Development

#### Backend (Spring Boot)

```bash
cd backend

# Build the application
./mvnw clean package -DskipTests

# Run the application (requires PostgreSQL)
./mvnw spring-boot:run
```

#### Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The Angular development server will be available at http://localhost:4200

## API Endpoints

The backend provides the following REST API endpoints:

| Method | Endpoint                       | Description                      |
|--------|--------------------------------|----------------------------------|
| GET    | /api/exams                     | Get all exams                    |
| GET    | /api/exams/{id}                | Get exam by ID                   |
| POST   | /api/exams                     | Create a new exam                |
| PUT    | /api/exams/{id}                | Update an existing exam          |
| DELETE | /api/exams/{id}                | Delete an exam                   |
| GET    | /api/exams/subject/{code}      | Find exams by subject code       |
| GET    | /api/exams/degree/{degree}     | Find exams by degree             |
| GET    | /api/exams/course              | Find exams by year and semester  |
| GET    | /api/exams/daterange           | Find exams by date range         |
| GET    | /api/exams/search/subject      | Search exams by subject name     |
| GET    | /api/exams/search/place        | Search exams by exam place       |

## Sample API Requests

```bash
# Get all exams
curl http://localhost:8080/api/exams

# Create a new exam
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "examDay": "2023-12-15",
    "examHour": "09:00:00",
    "durationMin": 180,
    "subjectCode": "DMA",
    "subjectName": "Discrete Mathematics and Algebra",
    "acronym": "DMA",
    "degree": "Computer Engineering",
    "courseYear": 1,
    "semester": 1,
    "examPlace": "Classroom 1G01",
    "comment": "Bring calculators"
  }'

# Search exams by subject name
curl http://localhost:8080/api/exams/search/subject?query=Mathematics
```

## Security Configuration

For production deployments:

1. **JWT Secret**: Always change the default JWT secret in the `.env` file
2. **Database Credentials**: Use strong passwords and consider using Docker secrets
3. **CORS Settings**: Restrict allowed origins to your domain(s) only

## Project Structure

```
upv-calendar/
├── backend/                   # Spring Boot backend
│   ├── src/                   # Source code
│   │   ├── main/
│   │   │   ├── java/          # Java code
│   │   │   └── resources/     # Configuration files
│   │   └── test/              # Test code
│   ├── pom.xml                # Maven configuration
│   └── Dockerfile             # Backend Docker configuration
├── frontend/                  # Angular frontend
│   ├── src/                   # Source code
│   │   ├── app/               # Application code
│   │   ├── assets/            # Static assets
│   │   └── environments/      # Environment configurations
│   ├── angular.json           # Angular CLI configuration
│   ├── package.json           # NPM dependencies
│   └── Dockerfile             # Frontend Docker configuration
├── docker-compose.dev.yml     # Docker Compose configuration with hot reload
└── env.example                # Example environment variables file
``` 