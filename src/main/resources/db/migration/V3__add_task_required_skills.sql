START TRANSACTION;

CREATE TABLE IF NOT EXISTS task_required_skills (
  task_required_skill_id BIGINT NOT NULL AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  CONSTRAINT pk_task_required_skills PRIMARY KEY (task_required_skill_id),
  CONSTRAINT uq_task_required_skills UNIQUE (task_id, skill_id),
  CONSTRAINT fk_task_required_skills_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_task_required_skills_skill FOREIGN KEY (skill_id) REFERENCES skills (skill_id) ON DELETE CASCADE ON UPDATE CASCADE
);

COMMIT;