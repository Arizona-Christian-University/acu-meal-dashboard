export interface StudentMember {
  "Student ID": string;
  "Populi ID": string;
  "First Name": string;
  "Last Name": string;
  Class: string;
  "Fall Semester 2025-2026 Term Meal Plan": string;
  "2025-2026: Fall Traditional Enrollments": string;
  Email: string;
  "IPEDS Race/Ethnicity": string;
  "Hispanic or Latino": string;
  "Race(s)": string;
  Gender: string;
  Age: string;
  "Intercollegiate Athletics": string;
  Freshman: string;
  "Housing Plan": string;
  "Student Housing": string;
  Degrees: string;
  Specializations: string;
  Housing_Status: string;
  Is_Athlete: string;
  Meal_Plan_Type: string;
}

export interface Transaction {
  Date: string;
  "Person Campus ID": string;
  "Person Full Name": string;
  Place: string;
  "Account Name": string;
  "Transaction Type": string;
  "Net Transaction Amount": string;
  "Transaction Response": string;
  "Meal Period": string;
  Tender: string;
  "Terminal ID": string;
  "Transaction ID": string;
  Week_Number: string;
  Day_of_Week: string;
  Hour: string;
  Is_Swipe: string;
  Is_Denied: string;
  Unused_Meals: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalTransactions: number;
  totalMealSwipes: number;
  totalFlexDollarsSpent: number;
  averageMealsPerStudent: number;
  averageFlexPerStudent: number;
  mealPlanDistribution: { [key: string]: number };
  housingDistribution: { [key: string]: number };
  athleteDistribution: { [key: string]: number };
  genderDistribution: { [key: string]: number };
  raceDistribution: { [key: string]: number };
}

export interface TimeSeriesData {
  date: string;
  count: number;
  amount?: number;
}

export interface CohortData {
  cohort: string;
  totalTransactions: number;
  totalAmount: number;
  averagePerPerson: number;
}
