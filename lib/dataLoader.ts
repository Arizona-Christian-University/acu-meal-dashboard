import Papa from 'papaparse';
import { StudentMember, Transaction } from './types';
import { readFile } from 'fs/promises';
import { join } from 'path';

// For Cloudflare Workers compatibility
async function readCSVFile(filename: string): Promise<string> {
  // In Cloudflare Workers, files are bundled relative to the worker root
  // In development, they're in the Data folder from cwd
  const paths = [
    join(process.cwd(), 'Data', filename),           // Development
    join('Data', filename),                           // Cloudflare Workers (relative to bundle)
    join('/var/task', 'Data', filename),             // Alternative Workers path
  ];

  for (const filePath of paths) {
    try {
      return await readFile(filePath, 'utf-8');
    } catch (error) {
      // Try next path
      continue;
    }
  }

  throw new Error(`Could not find CSV file: ${filename}`);
}

export async function loadStudentMembers(): Promise<StudentMember[]> {
  const fileContent = await readCSVFile('Atrium Members - Students.csv');

  return new Promise((resolve, reject) => {
    Papa.parse<StudentMember>(fileContent, {
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
  const files = [
    'Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv',
    'Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv',
    'Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv',
  ];

  const allTransactions: Transaction[] = [];

  for (const file of files) {
    const fileContent = await readCSVFile(file);

    const transactions = await new Promise<Transaction[]>((resolve, reject) => {
      Papa.parse<Transaction>(fileContent, {
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
  const fileContent = await readCSVFile(
    'Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv'
  );

  return new Promise((resolve, reject) => {
    Papa.parse<Transaction>(fileContent, {
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
