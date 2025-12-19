import Papa from 'papaparse';
import { StudentMember, Transaction } from './types';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'Data');

export async function loadStudentMembers(): Promise<StudentMember[]> {
  const filePath = path.join(DATA_DIR, 'Atrium Members - Students.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');

  return new Promise((resolve, reject) => {
    Papa.parse<StudentMember>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function loadMealTransactions(): Promise<Transaction[]> {
  const files = [
    'Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv',
    'Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv',
    'Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv',
  ];

  const allTransactions: Transaction[] = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const transactions = await new Promise<Transaction[]>((resolve, reject) => {
      Papa.parse<Transaction>(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });

    allTransactions.push(...transactions);
  }

  return allTransactions;
}

export async function loadFlexDollarsTransactions(): Promise<Transaction[]> {
  const filePath = path.join(
    DATA_DIR,
    'Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv'
  );
  const fileContent = await fs.readFile(filePath, 'utf-8');

  return new Promise((resolve, reject) => {
    Papa.parse<Transaction>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
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
