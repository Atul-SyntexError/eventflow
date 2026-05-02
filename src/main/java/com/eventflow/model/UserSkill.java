package com.eventflow.model;

public record UserSkill(Long userSkillId, Long userId, Long skillId, String proficiencyLevel) {
}