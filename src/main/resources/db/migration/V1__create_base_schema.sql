START TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  role VARCHAR(30) NOT NULL,
  user_status VARCHAR(30) NOT NULL,
  availability_status VARCHAR(30) NULL,
  performance_score DECIMAL(5,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_users PRIMARY KEY (user_id),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'ORGANIZER', 'VOLUNTEER', 'STUDENT')),
  CONSTRAINT chk_users_status CHECK (user_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  CONSTRAINT chk_users_availability CHECK (
    availability_status IS NULL OR availability_status IN ('AVAILABLE', 'LIMITED', 'UNAVAILABLE')
  )
);

CREATE TABLE IF NOT EXISTS skills (
  skill_id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(255) NULL,
  CONSTRAINT pk_skills PRIMARY KEY (skill_id),
  CONSTRAINT uq_skills_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS events (
  event_id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category VARCHAR(80) NOT NULL,
  venue VARCHAR(150) NOT NULL,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  registration_open_at TIMESTAMP NULL,
  registration_close_at TIMESTAMP NULL,
  expected_attendance INT NOT NULL,
  event_status VARCHAR(30) NOT NULL,
  created_by BIGINT NOT NULL,
  updated_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_events PRIMARY KEY (event_id),
  CONSTRAINT uq_events_code UNIQUE (code),
  CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_events_updated_by FOREIGN KEY (updated_by) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_events_status CHECK (
    event_status IN ('DRAFT', 'PLANNED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED')
  ),
  CONSTRAINT chk_events_attendance CHECK (expected_attendance >= 0),
  CONSTRAINT chk_events_window CHECK (end_at > start_at),
  CONSTRAINT chk_events_registration_window CHECK (
    registration_open_at IS NULL OR registration_close_at IS NULL OR registration_close_at >= registration_open_at
  )
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_skill_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  proficiency_level VARCHAR(30) NULL,
  CONSTRAINT pk_user_skills PRIMARY KEY (user_skill_id),
  CONSTRAINT uq_user_skills UNIQUE (user_id, skill_id),
  CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills (skill_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS event_resources (
  event_resource_id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  resource_name VARCHAR(100) NOT NULL,
  quantity_required INT NOT NULL,
  quantity_allocated INT NOT NULL DEFAULT 0,
  notes VARCHAR(255) NULL,
  CONSTRAINT pk_event_resources PRIMARY KEY (event_resource_id),
  CONSTRAINT fk_event_resources_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_event_resources_required CHECK (quantity_required >= 0),
  CONSTRAINT chk_event_resources_allocated CHECK (quantity_allocated >= 0)
);

CREATE TABLE IF NOT EXISTS registrations (
  registration_id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  registration_status VARCHAR(30) NOT NULL,
  registered_at TIMESTAMP NOT NULL,
  checked_in_at TIMESTAMP NULL,
  CONSTRAINT pk_registrations PRIMARY KEY (registration_id),
  CONSTRAINT uq_registrations_event_student UNIQUE (event_id, student_id),
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_registrations_student FOREIGN KEY (student_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_registrations_status CHECK (
    registration_status IN ('REGISTERED', 'WAITLISTED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW')
  )
);

CREATE TABLE IF NOT EXISTS tasks (
  task_id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  task_priority VARCHAR(30) NOT NULL,
  task_status VARCHAR(30) NOT NULL,
  required_start_at TIMESTAMP NULL,
  deadline_at TIMESTAMP NOT NULL,
  required_volunteers INT NOT NULL DEFAULT 1,
  created_by BIGINT NOT NULL,
  updated_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_tasks PRIMARY KEY (task_id),
  CONSTRAINT fk_tasks_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_tasks_updated_by FOREIGN KEY (updated_by) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_tasks_priority CHECK (task_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT chk_tasks_status CHECK (
    task_status IN ('TODO', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED')
  ),
  CONSTRAINT chk_tasks_required_volunteers CHECK (required_volunteers >= 1),
  CONSTRAINT chk_tasks_window CHECK (required_start_at IS NULL OR deadline_at >= required_start_at)
);

CREATE TABLE IF NOT EXISTS task_assignments (
  task_assignment_id BIGINT NOT NULL AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  volunteer_id BIGINT NOT NULL,
  assigned_by BIGINT NOT NULL,
  assignment_score DECIMAL(5,2) NULL,
  assignment_reason VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_task_assignments PRIMARY KEY (task_assignment_id),
  CONSTRAINT fk_task_assignments_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_task_assignments_volunteer FOREIGN KEY (volunteer_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_task_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS task_dependencies (
  task_dependency_id BIGINT NOT NULL AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  depends_on_task_id BIGINT NOT NULL,
  CONSTRAINT pk_task_dependencies PRIMARY KEY (task_dependency_id),
  CONSTRAINT uq_task_dependencies UNIQUE (task_id, depends_on_task_id),
  CONSTRAINT fk_task_dependencies_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_task_dependencies_depends_on FOREIGN KEY (depends_on_task_id) REFERENCES tasks (task_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  mood VARCHAR(30) NOT NULL,
  comment VARCHAR(500) NULL,
  submitted_at TIMESTAMP NOT NULL,
  CONSTRAINT pk_feedback PRIMARY KEY (feedback_id),
  CONSTRAINT uq_feedback_event_student UNIQUE (event_id, student_id),
  CONSTRAINT fk_feedback_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_feedback_mood CHECK (mood IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE'))
);

CREATE TABLE IF NOT EXISTS event_metrics (
  event_metric_id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  snapshot_at TIMESTAMP NOT NULL,
  registered_count INT NOT NULL,
  checked_in_count INT NOT NULL,
  attendance_ratio DECIMAL(5,2) NOT NULL,
  engagement_score DECIMAL(5,2) NOT NULL,
  volunteer_efficiency_score DECIMAL(5,2) NOT NULL,
  health_score DECIMAL(5,2) NOT NULL,
  risk_level VARCHAR(30) NOT NULL,
  CONSTRAINT pk_event_metrics PRIMARY KEY (event_metric_id),
  CONSTRAINT fk_event_metrics_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_event_metrics_registered CHECK (registered_count >= 0),
  CONSTRAINT chk_event_metrics_checked_in CHECK (checked_in_count >= 0),
  CONSTRAINT chk_event_metrics_risk_level CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE TABLE IF NOT EXISTS risk_predictions (
  risk_prediction_id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  risk_type VARCHAR(50) NOT NULL,
  risk_level VARCHAR(30) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  headline VARCHAR(150) NOT NULL,
  description VARCHAR(500) NOT NULL,
  recommended_action VARCHAR(255) NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  CONSTRAINT pk_risk_predictions PRIMARY KEY (risk_prediction_id),
  CONSTRAINT fk_risk_predictions_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_risk_predictions_level CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT NOT NULL AUTO_INCREMENT,
  recipient_user_id BIGINT NOT NULL,
  event_id BIGINT NULL,
  task_id BIGINT NULL,
  notification_type VARCHAR(50) NOT NULL,
  severity VARCHAR(30) NOT NULL,
  title VARCHAR(150) NOT NULL,
  body VARCHAR(500) NOT NULL,
  link_path VARCHAR(255) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  CONSTRAINT pk_notifications PRIMARY KEY (notification_id),
  CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_notifications_type CHECK (
    notification_type IN ('TASK_ASSIGNED', 'TASK_UPDATED', 'EVENT_UPDATED', 'SCHEDULE_CHANGED', 'RISK_ALERT', 'CHECKIN_REMINDER', 'GENERAL_ANNOUNCEMENT')
  ),
  CONSTRAINT chk_notifications_severity CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))
);

CREATE TABLE IF NOT EXISTS notification_logs (
  notification_log_id BIGINT NOT NULL AUTO_INCREMENT,
  notification_id BIGINT NOT NULL,
  channel VARCHAR(30) NOT NULL,
  delivery_status VARCHAR(30) NOT NULL,
  recipient_address VARCHAR(150) NULL,
  error_message VARCHAR(255) NULL,
  attempted_at TIMESTAMP NOT NULL,
  CONSTRAINT pk_notification_logs PRIMARY KEY (notification_log_id),
  CONSTRAINT fk_notification_logs_notification FOREIGN KEY (notification_id) REFERENCES notifications (notification_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_notification_logs_channel CHECK (channel IN ('IN_APP', 'EMAIL')),
  CONSTRAINT chk_notification_logs_status CHECK (delivery_status IN ('PENDING', 'SENT', 'FAILED', 'RETRYING', 'SKIPPED'))
);

CREATE TABLE IF NOT EXISTS event_schedule_adjustments (
  event_schedule_adjustment_id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  proposed_by BIGINT NOT NULL,
  reason_code VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,
  current_start_at TIMESTAMP NOT NULL,
  current_end_at TIMESTAMP NOT NULL,
  suggested_start_at TIMESTAMP NOT NULL,
  suggested_end_at TIMESTAMP NOT NULL,
  adjustment_status VARCHAR(30) NOT NULL,
  applied_at TIMESTAMP NULL,
  CONSTRAINT pk_event_schedule_adjustments PRIMARY KEY (event_schedule_adjustment_id),
  CONSTRAINT fk_event_schedule_adjustments_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_event_schedule_adjustments_proposed_by FOREIGN KEY (proposed_by) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_event_schedule_adjustments_status CHECK (
    adjustment_status IN ('SUGGESTED', 'APPROVED', 'APPLIED', 'REJECTED')
  ),
  CONSTRAINT chk_event_schedule_adjustments_current_window CHECK (current_end_at > current_start_at),
  CONSTRAINT chk_event_schedule_adjustments_suggested_window CHECK (suggested_end_at > suggested_start_at)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_log_id BIGINT NOT NULL AUTO_INCREMENT,
  actor_user_id BIGINT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  payload_before_json JSON NULL,
  payload_after_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_audit_logs PRIMARY KEY (audit_log_id),
  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_events_status_start ON events (event_status, start_at);
CREATE INDEX idx_tasks_event_status_deadline ON tasks (event_id, task_status, deadline_at);
CREATE INDEX idx_task_assignments_volunteer_active ON task_assignments (volunteer_id, is_active);
CREATE INDEX idx_notifications_recipient_read_created ON notifications (recipient_user_id, is_read, created_at);
CREATE INDEX idx_event_metrics_event_snapshot ON event_metrics (event_id, snapshot_at);

COMMIT;