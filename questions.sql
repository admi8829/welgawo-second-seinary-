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
  likes INTEGER DEFAULT 0
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
INSERT INTO teachers (name, subject, photo, bio, likes) VALUES 
('Dr. Abebe Kebede', 'Physics', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop', 'Former AAU professor specializing in Quantum Mechanics.', 124),
('Ms. Selamawit Tadesse', 'Mathematics', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop', 'Expert in ESLCE exam preparation with 10 years experience.', 89),
('Mr. Dawit Yilma', 'English', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop', 'Linguistics specialist focused on communicative English.', 56);
