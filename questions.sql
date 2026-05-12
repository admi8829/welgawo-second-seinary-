-- sample_questions.sql
-- Run this in your Cloudflare D1 Console

INSERT INTO questions (question, options, answer, subject) VALUES 
('Which of the following is the capital city of Ethiopia?', '["Nairobi", "Mogadishu", "Addis Ababa", "Asmara"]', 'Addis Ababa', 'Geography'),
('Who was the Emperor of Ethiopia during the Battle of Adwa?', '["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"]', 'Menelik II', 'History'),
('What is the main component of the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Nitrogen', 'Chemistry'),
('If a car travels at 60 km/h, how far will it travel in 2.5 hours?', '["120 km", "150 km", "180 km", "200 km"]', '150 km', 'Physics'),
('Find the value of x in the equation: 3x - 7 = 11.', '["4", "5", "6", "7"]', '6', 'Mathematics');

-- Feedback Table
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_name TEXT NOT NULL,
  teacher_subject TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Profiles
CREATE TABLE teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  photo TEXT,
  bio TEXT,
  likes INTEGER DEFAULT 0,
  unlikes INTEGER DEFAULT 0
);

-- Detailed Teacher Feedback/Comments
CREATE TABLE teacher_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  student_name TEXT,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample Teachers
INSERT INTO teachers (name, subject, photo, bio, likes, unlikes) VALUES 
('Dr. Abebe Kebede', 'Physics', NULL, 'Former AAU professor specializing in Quantum Mechanics.', 124, 5),
('Ms. Selamawit Tadesse', 'Mathematics', NULL, 'Expert in ESLCE exam preparation with 10 years experience.', 89, 2),
('Mr. Dawit Yilma', 'English', NULL, 'Linguistics specialist focused on communicative English.', 56, 1),
('Mr. Tilahun Gessesse', 'Biology', NULL, 'Passionate about genetics and ecology with a hands-on approach.', 110, 8),
('Dr. Almaz Bekele', 'Chemistry', NULL, 'Makes organic chemistry fun through real-world experiments.', 95, 3),
('Prof. Yosef Getachew', 'History', NULL, 'Brings Ethiopian history to life with captivating storytelling.', 150, 4);
