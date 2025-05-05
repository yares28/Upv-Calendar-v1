package com.upv.examcalendar.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ElementCollection
    @CollectionTable(name = "user_degrees", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "degree")
    private Set<String> savedDegrees = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_semesters", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "semester")
    private Set<String> savedSemesters = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_subjects", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "subject")
    private Set<String> savedSubjects = new HashSet<>();
}