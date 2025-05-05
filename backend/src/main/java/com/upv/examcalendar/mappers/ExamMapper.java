package com.upv.examcalendar.mappers;

import com.upv.examcalendar.dtos.ExamDTO;
import com.upv.examcalendar.models.EtsinfExam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * MapStruct mapper for converting between EtsinfExam entity and ExamDTO
 */
@Mapper(componentModel = "spring")
public interface ExamMapper {

    /**
     * Convert from entity to DTO
     */
    ExamDTO toDto(EtsinfExam entity);

    /**
     * Convert from DTO to entity
     */
    EtsinfExam toEntity(ExamDTO dto);

    /**
     * Convert a list of entities to a list of DTOs
     */
    List<ExamDTO> toDtoList(List<EtsinfExam> entities);

    /**
     * Update an existing entity with values from a DTO
     */
    void updateEntityFromDto(ExamDTO dto, @MappingTarget EtsinfExam entity);
}