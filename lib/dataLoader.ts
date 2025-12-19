import Papa from 'papaparse';
import { StudentMember, Transaction } from './types';
import {
  Atrium_Members_Students,
  Atrium_Transactions_Student_Meals_Fall_2025_7_Meals,
  Atrium_Transactions_Student_Meals_Fall_2025_14_Meals,
  Atrium_Transactions_Student_Meals_Fall_2025_19_Meals,
  Atrium_Transactions_Student_Flex_Dollars_Fall_2025_Student_Flex_Dollars_1_,
} from './data';

export async function loadStudentMembers(): Promise<StudentMember[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<StudentMember>(Atrium_Members_Students, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export async function loadMealTransactions(): Promise<Transaction[]> {
  const csvData = [
    Atrium_Transactions_Student_Meals_Fall_2025_7_Meals,
    Atrium_Transactions_Student_Meals_Fall_2025_14_Meals,
    Atrium_Transactions_Student_Meals_Fall_2025_19_Meals,
  ];

  const allTransactions: Transaction[] = [];

  for (const csvContent of csvData) {
    const transactions = await new Promise<Transaction[]>((resolve, reject) => {
      Papa.parse<Transaction>(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    });

    allTransactions.push(...transactions);
  }

  return allTransactions;
}

export async function loadFlexDollarsTransactions(): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Transaction>(Atrium_Transactions_Student_Flex_Dollars_Fall_2025_Student_Flex_Dollars_1_, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export async function loadAllData() {
  const [students, mealTransactions, flexTransactions] = await Promise.all([
    loadStudentMembers(),
    loadMealTransactions(),
    loadFlexDollarsTransactions(),
  ]);

  return {
    students,
    mealTransactions,
    flexTransactions,
    allTransactions: [...mealTransactions, ...flexTransactions],
  };
}
