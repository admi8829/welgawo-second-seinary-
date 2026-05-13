-- Smart-X Academy Database Final Seed
-- Table structures are handled by server.ts automagically

-- 1. Insert/Sync Admin
INSERT OR REPLACE INTO users (id, name, email, password, phone, is_admin) VALUES (1, 'Academy Central Admin', 'admin@smartx.com', 'SmartX2026', '0900000000', 1);

-- 2. Insert Sample Questions (Grade 12 Focus)
INSERT OR REPLACE INTO questions (id, question, options, answer, subject, grade) VALUES 
(1, 'Which Ethiopian Emperor defeated the Italians at the Battle of Adwa?', '["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"]', 'Menelik II', 'History', '12'),
(2, 'What is the value of gravitational acceleration on Earth approximately?', '["8.9 m/s²", "9.8 m/s²", "10.2 m/s²", "7.5 m/s²"]', '9.8 m/s²', 'Physics', '12'),
(3, 'Which of these is a correct sentence in English?', '["He go to school.", "He goes to school.", "He going to school.", "He have gone to school."]', 'He goes to school.', 'English', '12'),
(4, 'What is the derivative of f(x) = x³?', '["3x", "3x²", "x²", "x³-1"]', '3x²', 'Mathematics', '12'),
(5, 'What is the chemical symbol for Gold?', '["Ag", "Fe", "Au", "Pb"]', 'Au', 'Chemistry', '12'),
(6, 'The "Blue Nile" originates in which Ethiopian lake?', '["Lake Abaya", "Lake Tana", "Lake Ziway", "Lake Hawassa"]', 'Lake Tana', 'Geography', '12'),
(7, 'Which part of the cell is known as the powerhouse?', '["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"]', 'Mitochondria', 'Biology', '12'),
(8, 'Find the slope of a line passing through (2,3) and (4,7).', '["1", "2", "3", "4"]', '2', 'Mathematics', '12'),
(9, 'Who wrote the famous Amharic novel "Fiqir Eske Meqabir"?', '["Bealu Girma", "Hadis Alemayehu", "Tsegaye Gebre-Medhin", "Berhanu Zerihun"]', 'Hadis Alemayehu', 'Literature', '12'),
(10, 'What is the SI unit of electric current?', '["Volt", "Ohm", "Ampere", "Watt"]', 'Ampere', 'Physics', '12'),
(11, 'Which Ethiopian city is known as the "City of Harari"?', '["Dire Dawa", "Harar", "Jijiga", "Bahir Dar"]', 'Harar', 'History', '12'),
(12, 'Simplify: cos²(x) + sin²(x)', '["0", "1", "sin(x)", "cos(x)"]', '1', 'Mathematics', '12');

-- 3. Insert Initial Teachers
INSERT OR REPLACE INTO teachers (id, name, subject, bio, likes) VALUES
(1, 'Dr. Abebe Kebede', 'Physics', 'Specialist in Quantum Physics with 15 years experience at AAU.', 150),
(2, 'Ms. Selamawit Tadesse', 'Mathematics', 'Calculus and Algebra Expert. Known for simple exam tricks.', 120),
(3, 'Mr. Dawit Yilma', 'English', 'ESLCE English Mastery Coach. Expert in Grammar and Reading.', 95);
