package com.upv.examcalendar.services;

import com.upv.examcalendar.dtos.ExamDTO;
import com.upv.examcalendar.dtos.SubjectDTO;
import com.upv.examcalendar.exceptions.ResourceNotFoundException;
import com.upv.examcalendar.mappers.ExamMapper;
import com.upv.examcalendar.models.EtsinfExam;
import com.upv.examcalendar.repositories.EtsinfExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of the ExamService interface
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ExamServiceImpl implements ExamService {

    private final EtsinfExamRepository examRepository;
    private final ExamMapper examMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> getAllExams() {
        return examMapper.toDtoList(examRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDTO getExamById(Long id) {
        return examRepository.findById(id)
                .map(examMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
    }

    @Override
    public ExamDTO createExam(ExamDTO examDTO) {
        EtsinfExam exam = examMapper.toEntity(examDTO);
        EtsinfExam savedExam = examRepository.save(exam);
        return examMapper.toDto(savedExam);
    }

    @Override
    public ExamDTO updateExam(Long id, ExamDTO examDTO) {
        return examRepository.findById(id)
                .map(existingExam -> {
                    examMapper.updateEntityFromDto(examDTO, existingExam);
                    return examMapper.toDto(examRepository.save(existingExam));
                })
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
    }

    @Override
    public void deleteExam(Long id) {
        if (examRepository.existsById(id)) {
            examRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Exam not found with id: " + id);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> findExamsBySubjectCode(String subjectCode) {
        return examMapper.toDtoList(examRepository.findBySubjectCodeIgnoreCase(subjectCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> findExamsBySchool(String school) {
        // If ETSINF is selected, ensure only data from etsinf_exams table is returned
        if ("ETSINF".equalsIgnoreCase(school)) {
            return examMapper.toDtoList(examRepository.findByDegreeStartingWithIgnoreCase(school));
        } else {
            return examMapper.toDtoList(examRepository.findByDegreeStartingWithIgnoreCase(school));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> findExamsByDegree(String degree) {
        return examMapper.toDtoList(examRepository.findByDegreeIgnoreCase(degree));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> findExamsByCourseYearAndSemester(Integer courseYear, String semester) {
        return examMapper.toDtoList(examRepository.findByCourseYearAndSemester(courseYear, semester));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> findExamsByDateRange(LocalDate startDate, LocalDate endDate) {
        return examMapper.toDtoList(examRepository.findByExamDayBetween(startDate, endDate));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> findExamsBySubjectNameContaining(String subjectNamePart) {
        return examMapper.toDtoList(examRepository.findBySubjectNameContainingIgnoreCase(subjectNamePart));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDTO> findExamsByExamPlaceContaining(String place) {
        return examMapper.toDtoList(examRepository.findByExamPlaceContaining(place));
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllSchools() {
        try {
            // Use the repository method to get all schools
            return examRepository.findAllSchools();
        } catch (Exception e) {
            System.err.println("Error fetching all schools: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllDegreesDistinct() {
        try {
            return examRepository.findDistinctDegrees();
        } catch (Exception e) {
            System.err.println("Error fetching distinct degrees: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllDegrees() {
        return examRepository.findAllDegrees();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllSemestersDistinct() {
        try {
            return examRepository.findDistinctSemesters();
        } catch (Exception e) {
            System.err.println("Error fetching distinct semesters: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllSemesters() {
        return examRepository.findAllSemesters();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Integer> getAllCourseYearsDistinct() {
        try {
            return examRepository.findDistinctCourseYears();
        } catch (Exception e) {
            System.err.println("Error fetching distinct course years: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Integer> getAllCourseYears() {
        return examRepository.findAllCourseYears();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDTO> getAllSubjectsWithAcronymsDistinct() {
        try {
            List<Object[]> results = examRepository.findDistinctSubjectsWithAcronyms();
            List<SubjectDTO> subjects = new ArrayList<>();

            System.out.println("Found " + results.size() + " distinct subjects with acronyms");

            for (Object[] result : results) {
                try {
                    String name = (String) result[0];
                    String acronym = (String) result[1];

                    // Handle null values
                    if (name == null) {
                        name = "Unknown";
                    }
                    if (acronym == null) {
                        acronym = "";
                    }

                    System.out.println("Subject: name=" + name + ", acronym=" + acronym);

                    subjects.add(new SubjectDTO(name, acronym));
                } catch (Exception e) {
                    System.err.println("Error processing subject: " + e.getMessage());
                    e.printStackTrace();
                    // Continue with next subject
                }
            }

            System.out.println("Returning " + subjects.size() + " distinct SubjectDTO objects");
            return subjects;
        } catch (Exception e) {
            System.err.println("Error in getAllSubjectsWithAcronymsDistinct: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>(); // Return empty list on error
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDTO> getAllSubjectsWithAcronyms() {
        try {
            List<Object[]> results = examRepository.findAllSubjectsWithAcronyms();
            List<SubjectDTO> subjects = new ArrayList<>();

            System.out.println("Found " + results.size() + " subjects with acronyms");

            for (Object[] result : results) {
                try {
                    String name = (String) result[0];
                    String acronym = (String) result[1];

                    // Handle null values
                    if (name == null) {
                        name = "Unknown";
                    }
                    if (acronym == null) {
                        acronym = "";
                    }

                    System.out.println("Subject: name=" + name + ", acronym=" + acronym);

                    subjects.add(new SubjectDTO(name, acronym));
                } catch (Exception e) {
                    System.err.println("Error processing subject: " + e.getMessage());
                    e.printStackTrace();
                    // Continue with next subject
                }
            }

            System.out.println("Returning " + subjects.size() + " SubjectDTO objects");
            for (SubjectDTO subject : subjects) {
                System.out.println("  - " + subject.getName() + " (" + subject.getAcronym() + ")");
            }

            return subjects;
        } catch (Exception e) {
            System.err.println("Error in getAllSubjectsWithAcronyms: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>(); // Return empty list on error
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllSubDegrees() {
        try {
            return examRepository.findAllSubDegrees();
        } catch (Exception e) {
            // Log the error
            System.err.println("Error fetching all degrees (formerly sub-degrees): " + e.getMessage());
            e.printStackTrace();

            // Return empty list as fallback
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDegreesBySchool(String school) {
        try {
            // Format the pattern correctly for SQL LIKE
            String pattern = school + "%";
            return examRepository.findDegreesBySchool(pattern);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error fetching degrees for school " + school + ": " + e.getMessage());
            e.printStackTrace();

            // Return empty list as fallback
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getSubDegreesByDegree(String degree) {
        try {
            // This uses the degree as a parent degree
            String pattern = degree + "%";
            return examRepository.findSubDegreesByParentDegree(pattern);
        } catch (Exception e) {
            System.err.println("Error fetching sub-degrees for degree " + degree + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDTO> getSubjectsByDegree(String degree, Integer courseYear, String semester) {
        try {
            // Get all exams for the specified degree
            List<EtsinfExam> exams = examRepository.findByDegreeIgnoreCase(degree);

            // Apply additional filters if provided
            if (courseYear != null) {
                exams = exams.stream()
                        .filter(exam -> exam.getCourseYear() != null && exam.getCourseYear().equals(courseYear))
                        .collect(Collectors.toList());
            }

            if (semester != null) {
                exams = exams.stream()
                        .filter(exam -> exam.getSemester() != null && exam.getSemester().equals(semester))
                        .collect(Collectors.toList());
            }

            // Extract distinct subjects from the filtered exams
            Set<SubjectDTO> distinctSubjects = new HashSet<>();

            for (EtsinfExam exam : exams) {
                SubjectDTO subject = new SubjectDTO();
                subject.setName(exam.getSubjectName());
                subject.setAcronym(exam.getAcronym() != null ? exam.getAcronym() : exam.getSubjectCode());
                distinctSubjects.add(subject);
            }

            System.out.println("Found " + distinctSubjects.size() + " distinct subjects for degree " + degree +
                    (courseYear != null ? ", year " + courseYear : "") +
                    (semester != null ? ", semester " + semester : ""));

            return new ArrayList<>(distinctSubjects);
        } catch (Exception e) {
            System.err.println("Error fetching subjects for degree " + degree + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}