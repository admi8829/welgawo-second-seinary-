-- Smart-X Academy Database Initial Seed
-- Table structures are handled by server.ts

-- 1. Insert Admin and Students
INSERT INTO users (name, email, password, phone, is_admin) VALUES ('System Admin', 'admin@smartx.com', 'admin123', '0911223344', 1);
INSERT INTO users (name, email, password, phone, gender, age, grade, schoolName) VALUES ('Abebe Bikila', 'abebe@example.com', 'pass123', '0922334455', 'Male', 18, '12', 'Addis Ababa High School');

-- 2. Insert Sample Questions
INSERT INTO questions (question, options, answer, subject, grade) VALUES 
('Which Ethiopian Emperor defeated the Italians at the Battle of Adwa?', '["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"]', 'Menelik II', 'History', '12'),
('What is the value of gravitational acceleration on Earth approximately?', '["8.9 m/s²", "9.8 m/s²", "10.2 m/s²", "7.5 m/s²"]', '9.8 m/s²', 'Physics', '12'),
('Which of these is a correct sentence in English?', '["He go to school.", "He goes to school.", "He going to school.", "He have gone to school."]', 'He goes to school.', 'English', '12'),
('What is the derivative of f(x) = x³?', '["3x", "3x²", "x²", "x³-1"]', '3x²', 'Mathematics', '12'),
('What is the chemical symbol for Gold?', '["Ag", "Fe", "Au", "Pb"]', 'Au', 'Chemistry', '11'),
('The "Blue Nile" originates in which Ethiopian lake?', '["Lake Abaya", "Lake Tana", "Lake Ziway", "Lake Hawassa"]', 'Lake Tana', 'Geography', '12'),
('Which part of the cell is known as the powerhouse?', '["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"]', 'Mitochondria', 'Biology', '11'),
('Find the slope of a line passing through (2,3) and (4,7).', '["1", "2", "3", "4"]', '2', 'Mathematics', '10'),
('Who wrote the famous Amharic novel "Fiqir Eske Meqabir"?', '["Bealu Girma", "Hadis Alemayehu", "Tsegaye Gebre-Medhin", "Berhanu Zerihun"]', 'Hadis Alemayehu', 'Literature', '12');

-- 3. Insert Sample Teachers
INSERT INTO teachers (name, subject, bio, likes) VALUES
('Dr. Abebe Kebede', 'Physics', 'Specialist in Quantum Physics', 150),
('Ms. Selamawit Tadesse', 'Mathematics', 'Calculus Expert', 120);
