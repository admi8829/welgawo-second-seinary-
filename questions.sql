-- questions.sql (Examples of how to insert data into the Smart-X Academy DB)

-- 1. Insert Sample Users
INSERT INTO users (name, email, password, gender, age, grade, schoolName) 
VALUES 
('Abebe Bikila', 'abebe@example.com', 'pass123', 'Male', 18, '12', 'Addis Ababa High School'),
('Sara Girma', 'sara@example.com', 'pass123', 'Female', 16, '10', 'Bole Preparatory');

-- 2. Insert Sample Questions
INSERT INTO questions (question, options, answer, subject, grade) 
VALUES 
('Which of the following is the capital city of Ethiopia?', '["Nairobi", "Mogadishu", "Addis Ababa", "Asmara"]', 'Addis Ababa', 'Geography', '12'),
('Who was the Emperor of Ethiopia during the Battle of Adwa?', '["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"]', 'Menelik II', 'History', '12'),
('What is the main component of the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Nitrogen', 'Chemistry', '12'),
('Find the value of x in the equation: 3x - 7 = 11.', '["4", "5", "6", "7"]', '6', 'Mathematics', '12'),
('If a car travels at 60 km/h, how far will it travel in 2.5 hours?', '["120 km", "150 km", "180 km", "200 km"]', '150 km', 'Physics', '10');

-- 3. Insert Sample Teachers
INSERT INTO teachers (name, subject, photo, bio, likes, unlikes) 
VALUES 
('Dr. Abebe Kebede', 'Physics', NULL, 'Former AAU professor specializing in Quantum Mechanics.', 124, 5),
('Ms. Selamawit Tadesse', 'Mathematics', NULL, 'Expert in ESLCE exam preparation with 10 years experience.', 89, 2);

-- 4. Insert Sample Quiz Results
INSERT INTO quiz_results (user_id, subject, grade, score, total) 
VALUES 
(1, 'Physics', '12', 4, 5),
(2, 'History', '10', 5, 5);

-- 5. Insert Sample Teacher Feedback
INSERT INTO teacher_feedback (teacher_id, student_name, comment) 
VALUES 
(1, 'Abebe Bikila', 'Great physics teacher, explains concepts very clearly.');

-- 6. Insert General Feedback
INSERT INTO feedback (student_name, teacher_subject, comment) 
VALUES 
('Sara Girma', 'Mathematics', 'The math resources are very helpful for my exams.');
