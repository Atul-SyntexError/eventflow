START TRANSACTION;

INSERT INTO users (
  user_id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  user_status,
  availability_status,
  performance_score,
  created_at,
  updated_at
) VALUES
  (1, 'admin@eventflow.local', 'pbkdf2_sha256$210000$4E0NuHGlEtNwLDMHkPiNKw==$7aBz0xzFXvxEyP12jITP1ej9skBlpZR/ZZy6mVnR0jY=', 'Avery', 'Admin', 'ADMIN', 'ACTIVE', NULL, NULL, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
  (2, 'organizer@eventflow.local', 'pbkdf2_sha256$210000$GDNyfqhT04sva+54e/Hunw==$ScaAOvFP0/Vud97z70ofn+tTCCxoFn/mt3h5xbZkqfM=', 'Olivia', 'Organizer', 'ORGANIZER', 'ACTIVE', NULL, NULL, '2026-01-10 08:10:00', '2026-01-10 08:10:00'),
  (3, 'volunteer@eventflow.local', 'pbkdf2_sha256$210000$10LWjMmROcMwUD2kDz8dZw==$v3DodYbjYxwXhccXMgPdDxHj9mIp3AbtUe9z7aYiKzY=', 'Victor', 'Volunteer', 'VOLUNTEER', 'ACTIVE', 'AVAILABLE', 91.50, '2026-01-10 08:20:00', '2026-01-10 08:20:00'),
  (4, 'student@eventflow.local', 'pbkdf2_sha256$210000$ZLMW0akNnzkHlG8liIAMlw==$9WjN1JBnOvUwr3jBZWaLj/11/qwvP5BiGQBniLLXpPc=', 'Stella', 'Student', 'STUDENT', 'ACTIVE', NULL, NULL, '2026-01-10 08:30:00', '2026-01-10 08:30:00');

INSERT INTO skills (skill_id, name, description) VALUES
  (1, 'Registration Desk', 'Handles attendee registration and check-in flow.'),
  (2, 'Stage Support', 'Coordinates room setup and stage readiness.'),
  (3, 'Crowd Guidance', 'Helps with venue wayfinding and attendee support.');

INSERT INTO user_skills (user_skill_id, user_id, skill_id, proficiency_level) VALUES
  (1, 3, 1, 'ADVANCED'),
  (2, 3, 3, 'INTERMEDIATE');

INSERT INTO events (
  event_id,
  code,
  name,
  description,
  category,
  venue,
  start_at,
  end_at,
  registration_open_at,
  registration_close_at,
  expected_attendance,
  event_status,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES (
  1,
  'EVT-2026-OPENHOUSE',
  'Innovation Open House 2026',
  'Campus-wide event for project demos, volunteer coordination, and attendee check-in.',
  'Campus Showcase',
  'Main Auditorium',
  '2026-06-15 09:00:00',
  '2026-06-15 15:00:00',
  '2026-05-01 09:00:00',
  '2026-06-14 18:00:00',
  250,
  'REGISTRATION_OPEN',
  1,
  1,
  '2026-02-01 10:00:00',
  '2026-03-01 10:00:00'
);

INSERT INTO event_resources (
  event_resource_id,
  event_id,
  resource_name,
  quantity_required,
  quantity_allocated,
  notes
) VALUES
  (1, 1, 'Check-in Tablets', 6, 4, 'Two more tablets requested from IT inventory.'),
  (2, 1, 'Directional Signage', 12, 12, 'Printing approved and delivered.');

INSERT INTO registrations (
  registration_id,
  event_id,
  student_id,
  registration_status,
  registered_at,
  checked_in_at
) VALUES (
  1,
  1,
  4,
  'REGISTERED',
  '2026-05-03 11:15:00',
  NULL
);

INSERT INTO tasks (
  task_id,
  event_id,
  title,
  description,
  task_priority,
  task_status,
  required_start_at,
  deadline_at,
  required_volunteers,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
  (1, 1, 'Prepare registration desks', 'Set up tables, signage, and attendee check-in tablets.', 'HIGH', 'ASSIGNED', '2026-06-15 07:30:00', '2026-06-15 08:30:00', 2, 2, 2, '2026-04-15 09:00:00', '2026-04-20 09:00:00'),
  (2, 1, 'Guide attendees to demo hall', 'Support incoming attendees and keep hallway traffic moving.', 'MEDIUM', 'TODO', '2026-06-15 08:45:00', '2026-06-15 10:00:00', 1, 2, 2, '2026-04-15 09:20:00', '2026-04-20 09:20:00');

INSERT INTO task_assignments (
  task_assignment_id,
  task_id,
  volunteer_id,
  assigned_by,
  assignment_score,
  assignment_reason,
  is_active,
  assigned_at
) VALUES (
  1,
  1,
  3,
  2,
  94.75,
  'Strong registration and crowd-support skill match.',
  TRUE,
  '2026-04-20 09:30:00'
);

INSERT INTO task_dependencies (task_dependency_id, task_id, depends_on_task_id) VALUES
  (1, 2, 1);

INSERT INTO feedback (
  feedback_id,
  event_id,
  student_id,
  mood,
  comment,
  submitted_at
) VALUES (
  1,
  1,
  4,
  'POSITIVE',
  'Looking forward to the demo lineup and mentor sessions.',
  '2026-06-15 16:00:00'
);

INSERT INTO event_metrics (
  event_metric_id,
  event_id,
  snapshot_at,
  registered_count,
  checked_in_count,
  attendance_ratio,
  engagement_score,
  volunteer_efficiency_score,
  health_score,
  risk_level
) VALUES (
  1,
  1,
  '2026-06-10 18:00:00',
  186,
  0,
  74.40,
  82.10,
  90.00,
  84.60,
  'MEDIUM'
);

INSERT INTO risk_predictions (
  risk_prediction_id,
  event_id,
  risk_type,
  risk_level,
  score,
  headline,
  description,
  recommended_action,
  generated_at
) VALUES (
  1,
  1,
  'VOLUNTEER_SHORTAGE',
  'MEDIUM',
  63.50,
  'Check-in team is still under target coverage',
  'Tablet station count exceeds confirmed volunteer headcount for the first hour.',
  'Confirm one additional volunteer or reduce station concurrency.',
  '2026-06-10 18:00:00'
);

INSERT INTO notifications (
  notification_id,
  recipient_user_id,
  event_id,
  task_id,
  notification_type,
  severity,
  title,
  body,
  link_path,
  is_read,
  created_at,
  read_at
) VALUES
  (1, 3, 1, 1, 'TASK_ASSIGNED', 'INFO', 'New assignment: Prepare registration desks', 'You have been assigned to prepare the registration desks before attendee arrival.', '/volunteer/tasks', FALSE, '2026-04-20 09:31:00', NULL),
  (2, 4, 1, NULL, 'GENERAL_ANNOUNCEMENT', 'INFO', 'Registration confirmed', 'Your registration for Innovation Open House 2026 is confirmed.', '/student/registrations', TRUE, '2026-05-03 11:16:00', '2026-05-03 11:30:00');

INSERT INTO notification_logs (
  notification_log_id,
  notification_id,
  channel,
  delivery_status,
  recipient_address,
  error_message,
  attempted_at
) VALUES
  (1, 1, 'IN_APP', 'SENT', NULL, NULL, '2026-04-20 09:31:00'),
  (2, 2, 'EMAIL', 'SENT', 'student@eventflow.local', NULL, '2026-05-03 11:17:00');

INSERT INTO event_schedule_adjustments (
  event_schedule_adjustment_id,
  event_id,
  proposed_by,
  reason_code,
  description,
  current_start_at,
  current_end_at,
  suggested_start_at,
  suggested_end_at,
  adjustment_status,
  applied_at
) VALUES (
  1,
  1,
  2,
  'VOLUNTEER_COVERAGE',
  'Delay public hall opening by fifteen minutes if check-in coverage is not confirmed by 08:15.',
  '2026-06-15 09:00:00',
  '2026-06-15 15:00:00',
  '2026-06-15 09:15:00',
  '2026-06-15 15:15:00',
  'SUGGESTED',
  NULL
);

INSERT INTO audit_logs (
  audit_log_id,
  actor_user_id,
  entity_type,
  entity_id,
  action_type,
  payload_before_json,
  payload_after_json,
  created_at
) VALUES
  (1, 1, 'EVENT', 1, 'CREATE', NULL, JSON_OBJECT('eventStatus', 'REGISTRATION_OPEN', 'expectedAttendance', 250), '2026-02-01 10:00:00'),
  (2, 2, 'TASK', 1, 'ASSIGN', JSON_OBJECT('assignedVolunteerId', NULL), JSON_OBJECT('assignedVolunteerId', 3, 'assignmentScore', 94.75), '2026-04-20 09:30:00');

COMMIT;