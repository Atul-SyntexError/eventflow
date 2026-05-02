CREATE TABLE IF NOT EXISTS student_recommendation_snapshots (
  student_recommendation_snapshot_id BIGINT NOT NULL AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  reason_tags TEXT NOT NULL,
  headline VARCHAR(255) NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  CONSTRAINT pk_student_recommendation_snapshots PRIMARY KEY (student_recommendation_snapshot_id),
  CONSTRAINT fk_student_recommendation_snapshots_student FOREIGN KEY (student_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_student_recommendation_snapshots_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE
);