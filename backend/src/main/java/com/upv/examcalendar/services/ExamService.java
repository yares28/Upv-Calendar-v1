package com.upv.examcalendar.services;

import com.upv.examcalendar.dtos.ExamDTO;
import com.upv.examcalendar.dtos.SubjectDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service interface defining operations for exams
 */
public interface ExamService {

    /**
     * Get all exams
     */
    List<ExamDTO> getAllExams();

    /**
     * Get exam by ID
     */
    ExamDTO getExamById(Long id);

    /**
     * Create a new exam
     */
    ExamDTO createExam(ExamDTO examDTO);

    /**
     * Update an existing exam
     */
    ExamDTO updateExam(Long id, ExamDTO examDTO);

    /**
     * Delete an exam
     */
    void deleteExam(Long id);

    /**
     * Find exams by subject code
     */
    List<ExamDTO> findExamsBySubjectCode(String subjectCode);

    /**
     * Find exams by school
     * When ETSINF is selected, only returns data from etsinf_exams table
     */
    List<ExamDTO> findExamsBySchool(String school);

    /**
     * Find exams by degree
     */
    List<ExamDTO> findExamsByDegree(String degree);

    /**
     * Find exams by course year and semester
     */
    List<ExamDTO> findExamsByCourseYearAndSemester(Integer courseYear, String semester);

    /**
     * Find exams by date range
     */
    List<ExamDTO> findExamsByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Find exams by subject name (partial match)
     */
    List<ExamDTO> findExamsBySubjectNameContaining(String subjectNamePart);

    /**
     * Find exams by exam place (partial match)
     */
    List<ExamDTO> findExamsByExamPlaceContaining(String place);

    /**
     * Get all unique schools
     */
    List<String> getAllSchools();

    /**
     * Get all unique degrees (distinct values from the degree column)
     */
    List<String> getAllDegreesDistinct();

    /**
     * Get all unique schools (kept for backwards compatibility)
     */
    List<String> getAllDegrees();

    /**
     * Get all unique semesters (distinct)
     */
    List<String> getAllSemestersDistinct();

    /**
     * Get all unique semesters
     */
    List<String> getAllSemesters();

    /**
     * Get all unique course years (distinct)
     */
    List<Integer> getAllCourseYearsDistinct();

    /**
     * Get all unique course years
     */
    List<Integer> getAllCourseYears();

    /**
     * Get all subjects with acronyms (distinct)
     */
    List<SubjectDTO> getAllSubjectsWithAcronymsDistinct();

    /**
     * Get all subjects with acronyms
     */
    List<SubjectDTO> getAllSubjectsWithAcronyms();

    /**
     * Get all unique degrees (formerly subdegrees)
     */
    List<String> getAllSubDegrees();

    /**
     * Get degrees for a specific school
     */
    List<String> getDegreesBySchool(String school);

    /**
     * Get sub-degrees for a specific degree (kept for backwards compatibility)
     */
    List<String> getSubDegreesByDegree(String degree);

    /**
     * Get subjects for a specific degree with optional filtering by courseYear and
     * semester
     */
    List<SubjectDTO> getSubjectsByDegree(String degree, Integer courseYear, String semester);
}