package com.upv.examcalendar.controllers;

import com.upv.examcalendar.dtos.ExamDTO;
import com.upv.examcalendar.dtos.SubjectDTO;
import com.upv.examcalendar.services.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * REST controller for exam operations
 */
@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "${cors.allowed-origins}")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    /**
     * Get all exams
     */
    @GetMapping
    public ResponseEntity<List<ExamDTO>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    /**
     * Get exam by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExamDTO> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    /**
     * Create a new exam
     */
    @PostMapping
    public ResponseEntity<ExamDTO> createExam(@Valid @RequestBody ExamDTO examDTO) {
        return new ResponseEntity<>(examService.createExam(examDTO), HttpStatus.CREATED);
    }

    /**
     * Update an existing exam
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExamDTO> updateExam(@PathVariable Long id, @Valid @RequestBody ExamDTO examDTO) {
        return ResponseEntity.ok(examService.updateExam(id, examDTO));
    }

    /**
     * Delete an exam
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Find exams by subject code
     */
    @GetMapping("/subject/{subjectCode}")
    public ResponseEntity<List<ExamDTO>> findExamsBySubjectCode(@PathVariable String subjectCode) {
        return ResponseEntity.ok(examService.findExamsBySubjectCode(subjectCode));
    }

    /**
     * Find exams by school
     * When ETSINF is selected, only returns data from etsinf_exams table
     */
    @GetMapping("/school/{school}")
    public ResponseEntity<List<ExamDTO>> findExamsBySchool(@PathVariable String school) {
        return ResponseEntity.ok(examService.findExamsBySchool(school));
    }

    /**
     * Find exams by degree (kept for backwards compatibility)
     */
    @GetMapping("/degree/{degree}")
    public ResponseEntity<List<ExamDTO>> findExamsByDegree(@PathVariable String degree) {
        return ResponseEntity.ok(examService.findExamsByDegree(degree));
    }

    /**
     * Find exams by course year and semester
     */
    @GetMapping("/course")
    public ResponseEntity<List<ExamDTO>> findExamsByCourseYearAndSemester(
            @RequestParam Integer courseYear, @RequestParam String semester) {
        return ResponseEntity.ok(examService.findExamsByCourseYearAndSemester(courseYear, semester));
    }

    /**
     * Find exams by date range
     */
    @GetMapping("/daterange")
    public ResponseEntity<List<ExamDTO>> findExamsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(examService.findExamsByDateRange(startDate, endDate));
    }

    /**
     * Find exams by subject name containing text (case insensitive)
     */
    @GetMapping("/search/subject")
    public ResponseEntity<List<ExamDTO>> findExamsBySubjectNameContaining(@RequestParam String query) {
        return ResponseEntity.ok(examService.findExamsBySubjectNameContaining(query));
    }

    /**
     * Find exams by exam place containing text (case insensitive)
     */
    @GetMapping("/search/place")
    public ResponseEntity<List<ExamDTO>> findExamsByExamPlaceContaining(@RequestParam String query) {
        return ResponseEntity.ok(examService.findExamsByExamPlaceContaining(query));
    }

    /**
     * Get all unique schools
     */
    @GetMapping("/schools/distinct")
    public ResponseEntity<List<String>> getAllSchools() {
        return ResponseEntity.ok(examService.getAllSchools());
    }

    /**
     * Get all unique degrees (distinct values from the degree column)
     */
    @GetMapping("/degrees/distinct")
    public ResponseEntity<List<String>> getAllDegreesDistinct() {
        return ResponseEntity.ok(examService.getAllDegreesDistinct());
    }

    /**
     * Get all unique schools (kept for backwards compatibility)
     */
    @GetMapping("/degrees")
    public ResponseEntity<List<String>> getAllDegrees() {
        return ResponseEntity.ok(examService.getAllDegrees());
    }

    /**
     * Get all unique semesters
     */
    @GetMapping("/semesters/distinct")
    public ResponseEntity<List<String>> getAllSemestersDistinct() {
        return ResponseEntity.ok(examService.getAllSemestersDistinct());
    }

    /**
     * Get all unique semesters (kept for backwards compatibility)
     */
    @GetMapping("/semesters")
    public ResponseEntity<List<String>> getAllSemesters() {
        return ResponseEntity.ok(examService.getAllSemesters());
    }

    /**
     * Get all unique course years
     */
    @GetMapping("/courseyears/distinct")
    public ResponseEntity<List<Integer>> getAllCourseYearsDistinct() {
        return ResponseEntity.ok(examService.getAllCourseYearsDistinct());
    }

    /**
     * Get all unique course years (kept for backwards compatibility)
     */
    @GetMapping("/courseyears")
    public ResponseEntity<List<Integer>> getAllCourseYears() {
        return ResponseEntity.ok(examService.getAllCourseYears());
    }

    /**
     * Get all subjects with acronyms (distinct from the subject_name column)
     */
    @GetMapping("/subjects/distinct")
    public ResponseEntity<List<SubjectDTO>> getAllSubjectsWithAcronymsDistinct() {
        System.out.println("REST request to get all subjects with acronyms (distinct)");
        List<SubjectDTO> subjects = examService.getAllSubjectsWithAcronymsDistinct();
        System.out.println("Returning " + subjects.size() + " distinct subjects from controller");
        return ResponseEntity.ok(subjects);
    }

    /**
     * Get all subjects with acronyms (kept for backwards compatibility)
     */
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDTO>> getAllSubjectsWithAcronyms() {
        System.out.println("REST request to get all subjects with acronyms");
        List<SubjectDTO> subjects = examService.getAllSubjectsWithAcronyms();
        System.out.println("Returning " + subjects.size() + " subjects from controller");

        // Using a more verbose debug output to see exactly what's going to be
        // serialized
        for (SubjectDTO subject : subjects) {
            System.out.println("Controller sending: " + subject.getName() + " (" + subject.getAcronym() + ")");
            System.out
                    .println("  - Object properties: name=" + subject.getName() + ", acronym=" + subject.getAcronym());
            System.out.println("  - Object class: " + subject.getClass().getName());
            System.out.println("  - Object toString: " + subject.toString());
        }

        return ResponseEntity.ok(subjects);
    }

    /**
     * Get all unique degrees (formerly subdegrees)
     */
    @GetMapping("/subdegrees")
    public ResponseEntity<List<String>> getAllSubDegrees() {
        System.out.println("REST request to get all degrees (formerly subdegrees)");
        try {
            List<String> degrees = examService.getAllSubDegrees();
            System.out.println("Returning " + degrees.size() + " degrees from controller");
            return ResponseEntity.ok(degrees);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error getting degrees: " + e.getMessage());
            e.printStackTrace();

            // Return empty list instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Get degrees for a specific school
     */
    @GetMapping("/degrees/bySchool/{school}")
    public ResponseEntity<List<String>> getDegreesBySchool(@PathVariable String school) {
        System.out.println("REST request to get degrees for school: " + school);
        try {
            List<String> degrees = examService.getDegreesBySchool(school);
            System.out.println("Returning " + degrees.size() + " degrees for school " + school);
            return ResponseEntity.ok(degrees);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error getting degrees for school " + school + ": " + e.getMessage());
            e.printStackTrace();

            // Return empty list instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Get sub-degrees for a specific degree (kept for backwards compatibility)
     */
    @GetMapping("/subdegrees/{degree}")
    public ResponseEntity<List<String>> getSubDegreesByDegree(@PathVariable String degree) {
        System.out.println("REST request to get degrees for school: " + degree);
        try {
            List<String> subDegrees = examService.getSubDegreesByDegree(degree);
            System.out.println("Returning " + subDegrees.size() + " degrees for school " + degree);
            return ResponseEntity.ok(subDegrees);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error getting degrees for school " + degree + ": " + e.getMessage());
            e.printStackTrace();

            // Return empty list instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Find exams by course year and semester
     */
    @GetMapping("/course-semester")
    public ResponseEntity<List<ExamDTO>> getExamsByCourseYearAndSemester(
            @RequestParam Integer courseYear, @RequestParam String semester) {
        return ResponseEntity.ok(examService.findExamsByCourseYearAndSemester(courseYear, semester));
    }

    /**
     * Get subjects for a specific degree with optional courseYear and semester
     * filtering
     * This supports the hierarchical filtering in the frontend
     */
    @GetMapping("/subjects/byDegree/{degree}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByDegree(
            @PathVariable String degree,
            @RequestParam(required = false) Integer courseYear,
            @RequestParam(required = false) String semester) {

        System.out.println("REST request to get subjects for degree: " + degree +
                ", courseYear: " + courseYear + ", semester: " + semester);

        try {
            List<SubjectDTO> subjects = examService.getSubjectsByDegree(degree, courseYear, semester);
            System.out.println("Returning " + subjects.size() + " subjects for degree " + degree);
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error getting subjects for degree " + degree + ": " + e.getMessage());
            e.printStackTrace();

            // Return empty list instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}