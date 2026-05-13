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
('What is the derivative of x^2?', '["x", "2x", "x^3", "2"]', '2x', 'Mathematics', '12');

-- 3. Insert Sample Teachers
INSERT INTO teachers (name, subject, bio, likes) VALUES
('Dr. Abebe Kebede', 'Physics', 'Specialist in Quantum Physics', 150),
('Ms. Selamawit Tadesse', 'Mathematics', 'Calculus Expert', 120);
