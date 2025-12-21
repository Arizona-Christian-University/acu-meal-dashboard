-- Create students table
CREATE TABLE IF NOT EXISTS students (
  student_id TEXT PRIMARY KEY,
  populi_id TEXT,
  first_name TEXT,
  last_name TEXT,
  class TEXT,
  meal_plan TEXT,
  enrollments INTEGER,
  email TEXT,
  ipeds_race_ethnicity TEXT,
  hispanic_or_latino TEXT,
  races TEXT,
  gender TEXT,
  age INTEGER,
  athletics TEXT,
  freshman TEXT,
  housing_plan TEXT,
  student_housing TEXT,
  degrees TEXT,
  specializations TEXT,
  housing_status TEXT,
  is_athlete TEXT,
  meal_plan_type TEXT
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER,
  date TEXT,
  person_campus_id TEXT,
  person_full_name TEXT,
  place TEXT,
  account_name TEXT,
  transaction_type TEXT,
  net_transaction_amount REAL,
  transaction_response TEXT,
  meal_period TEXT,
  tender TEXT,
  terminal_id TEXT,
  week_number INTEGER,
  day_of_week TEXT,
  hour INTEGER,
  is_swipe INTEGER,
  is_denied INTEGER,
  unused_meals INTEGER
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_person_id ON transactions(person_campus_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_students_housing_status ON students(housing_status);
CREATE INDEX IF NOT EXISTS idx_students_meal_plan_type ON students(meal_plan_type);
CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender);
CREATE INDEX IF NOT EXISTS idx_students_is_athlete ON students(is_athlete);
