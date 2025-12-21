import { StudentMember, Transaction } from './types';

// D1 database binding type
export interface Env {
  DB: D1Database;
}

export async function loadStudentMembers(db: D1Database): Promise<StudentMember[]> {
  const result = await db.prepare(`
    SELECT
      student_id as "Student ID",
      populi_id as "Populi ID",
      first_name as "First Name",
      last_name as "Last Name",
      class as "Class",
      meal_plan as "Fall Semester 2025-2026 Term Meal Plan",
      enrollments as "2025-2026: Fall Traditional Enrollments",
      email as "Email",
      ipeds_race_ethnicity as "IPEDS Race/Ethnicity",
      hispanic_or_latino as "Hispanic or Latino",
      races as "Race(s)",
      gender as "Gender",
      CAST(age AS TEXT) as "Age",
      athletics as "Intercollegiate Athletics",
      freshman as "Freshman",
      housing_plan as "Housing Plan",
      student_housing as "Student Housing",
      degrees as "Degrees",
      specializations as "Specializations",
      housing_status as "Housing_Status",
      is_athlete as "Is_Athlete",
      meal_plan_type as "Meal_Plan_Type"
    FROM students
  `).all();

  return result.results as unknown as StudentMember[];
}

export async function loadMealTransactions(db: D1Database): Promise<Transaction[]> {
  const result = await db.prepare(`
    SELECT
      date as "Date",
      person_campus_id as "Person Campus ID",
      person_full_name as "Person Full Name",
      place as "Place",
      account_name as "Account Name",
      transaction_type as "Transaction Type",
      CAST(net_transaction_amount AS TEXT) as "Net Transaction Amount",
      transaction_response as "Transaction Response",
      meal_period as "Meal Period",
      tender as "Tender",
      CAST(terminal_id AS TEXT) as "Terminal ID",
      CAST(transaction_id AS TEXT) as "Transaction ID",
      CAST(week_number AS TEXT) as "Week_Number",
      day_of_week as "Day_of_Week",
      CAST(hour AS TEXT) as "Hour",
      CAST(is_swipe AS TEXT) as "Is_Swipe",
      CAST(is_denied AS TEXT) as "Is_Denied",
      CAST(unused_meals AS TEXT) as "Unused_Meals"
    FROM transactions
    WHERE transaction_type = 'deposit' OR account_name LIKE '%Meal%'
  `).all();

  return result.results as unknown as Transaction[];
}

export async function loadFlexDollarsTransactions(db: D1Database): Promise<Transaction[]> {
  const result = await db.prepare(`
    SELECT
      date as "Date",
      person_campus_id as "Person Campus ID",
      person_full_name as "Person Full Name",
      place as "Place",
      account_name as "Account Name",
      transaction_type as "Transaction Type",
      CAST(net_transaction_amount AS TEXT) as "Net Transaction Amount",
      transaction_response as "Transaction Response",
      meal_period as "Meal Period",
      tender as "Tender",
      CAST(terminal_id AS TEXT) as "Terminal ID",
      CAST(transaction_id AS TEXT) as "Transaction ID",
      CAST(week_number AS TEXT) as "Week_Number",
      day_of_week as "Day_of_Week",
      CAST(hour AS TEXT) as "Hour",
      CAST(is_swipe AS TEXT) as "Is_Swipe",
      CAST(is_denied AS TEXT) as "Is_Denied",
      CAST(unused_meals AS TEXT) as "Unused_Meals"
    FROM transactions
    WHERE account_name LIKE '%Flex%'
  `).all();

  return result.results as unknown as Transaction[];
}

export async function loadAllData(db: D1Database) {
  const [students, mealTransactions, flexTransactions] = await Promise.all([
    loadStudentMembers(db),
    loadMealTransactions(db),
    loadFlexDollarsTransactions(db),
  ]);

  return {
    students,
    mealTransactions,
    flexTransactions,
    allTransactions: [...mealTransactions, ...flexTransactions],
  };
}
