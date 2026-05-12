-- sample_questions.sql
-- Run this in your Cloudflare D1 Console

INSERT INTO questions (question, options, answer, subject) VALUES 
('Which of the following is the capital city of Ethiopia?', '["Nairobi", "Mogadishu", "Addis Ababa", "Asmara"]', 'Addis Ababa', 'Geography'),
('Who was the Emperor of Ethiopia during the Battle of Adwa?', '["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"]', 'Menelik II', 'History'),
('What is the main component of the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Nitrogen', 'Chemistry'),
('If a car travels at 60 km/h, how far will it travel in 2.5 hours?', '["120 km", "150 km", "180 km", "200 km"]', '150 km', 'Physics'),
('Find the value of x in the equation: 3x - 7 = 11.', '["4", "5", "6", "7"]', '6', 'Mathematics');

-- Feedback Table (New)
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_name TEXT NOT NULL,
  teacher_subject TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
