# UPV Exam Calendar - Implementation Notes

## Overview

This project is a comprehensive UPV Exam Calendar application built with:
- **Frontend**: Angular (instead of the original ReactJS)
- **Backend**: Spring Boot
- **Database**: PostgreSQL (pre-populated with data)

## Project Structure

### Frontend (Angular)

The frontend is an Angular application with the following structure:

- **Components**:
  - `landing.component.ts`: Main component for the landing page with calendar functionality
  
- **Services**:
  - `exam.service.ts`: Handles API requests related to exams
  - `auth.service.ts`: Manages authentication and user state

- **Models**:
  - `exam.model.ts`: Interfaces for Exam, ExamDay, and MonthlyCalendar
  - `user.model.ts`: Interface for User data

### Backend (Spring Boot)

The backend is a Spring Boot application with:

- **Models**:
  - `Exam.java`: Represents the exam entity in the database
  - `User.java`: Represents the user entity with saved preferences

- **Repositories**:
  - `ExamRepository.java`: Data access for exams with custom queries
  - `UserRepository.java`: Data access for users

- **Services**:
  - `ExamService.java`: Business logic for exam operations

- **Controllers**:
  - `ExamController.java`: REST endpoints for exam data
  - `AuthController.java`: Authentication endpoints

- **Security**:
  - `JwtTokenProvider.java`: JWT token generation and validation

## Key Features Implemented

1. **Interactive Calendar View**: Displays exams by month with interactive date selection
2. **Filter System**: Filter exams by degree, semester, and subject
3. **Exam Details**: View detailed exam information when clicking on dates
4. **User Authentication**: Login/register functionality with JWT
5. **User Preferences**: Save filter preferences for logged-in users
6. **Export Capability**: Export exam schedule to different formats
7. **Dark/Light Mode**: Toggle between dark and light themes

## Implementation Details

### Frontend

1. The main landing page includes a filterable calendar view
2. Angular services manage API communication with the backend
3. Responsive design works on different screen sizes
4. State management through Angular services

### Backend

1. RESTful API with Spring Boot
2. JPA/Hibernate for database access
3. Spring Security with JWT for authentication
4. Filtering capability with custom JPA queries

## Database Structure

This implementation assumes a PostgreSQL database with the following tables:
- `exams`: Stores exam information
- `users`: Stores user information
- `user_degrees`, `user_semesters`, `user_subjects`: Join tables for user preferences

The database is assumed to be pre-populated with exam data. 