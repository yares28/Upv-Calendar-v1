CREATE TABLE IF NOT EXISTS etsinf_exams (
    id SERIAL PRIMARY KEY,
    exam_day DATE NOT NULL,
    exam_hour TIME NOT NULL,
    duration_min INTEGER NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    acronym VARCHAR(20),
    degree VARCHAR(100) NOT NULL,
    course_year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    exam_place VARCHAR(255),
    comment TEXT
); 