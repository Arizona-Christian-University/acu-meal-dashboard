#!/usr/bin/env node
/**
 * Import CSV data into Cloudflare D1 database
 * This script reads CSV files and imports them into the D1 database
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'Data');

// Helper function to escape single quotes in SQL
function escapeSql(value) {
  if (value === null || value === undefined || value === '') {
    return 'NULL';
  }
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field); // Add last field

  return fields;
}

// Helper function to execute SQL via wrangler
function executeSQL(sql, remote = false) {
  const tempFile = path.join(__dirname, 'temp-migration.sql');
  fs.writeFileSync(tempFile, sql, 'utf-8');

  try {
    const remoteFlag = remote ? '--remote' : '';
    execSync(`wrangler d1 execute acu-meal-data --file="${tempFile}" ${remoteFlag}`, {
      stdio: 'inherit'
    });
  } finally {
    fs.unlinkSync(tempFile);
  }
}

// Import students
console.log('📦 Importing students...');
const studentsFile = path.join(DATA_DIR, 'Atrium Members - Students.csv');
const studentsContent = fs.readFileSync(studentsFile, 'utf-8');
const studentsLines = studentsContent.split('\n').filter(line => line.trim());
const studentsHeaders = parseCSVLine(studentsLines[0]);

let studentInserts = [];
for (let i = 1; i < studentsLines.length; i++) {
  const fields = parseCSVLine(studentsLines[i]);
  if (fields.length < studentsHeaders.length) continue;

  const values = [
    escapeSql(fields[0]), // student_id
    escapeSql(fields[1]), // populi_id
    escapeSql(fields[2]), // first_name
    escapeSql(fields[3]), // last_name
    escapeSql(fields[4]), // class
    escapeSql(fields[5]), // meal_plan
    fields[6] || 'NULL', // enrollments (integer)
    escapeSql(fields[7]), // email
    escapeSql(fields[8]), // ipeds_race_ethnicity
    escapeSql(fields[9]), // hispanic_or_latino
    escapeSql(fields[10]), // races
    escapeSql(fields[11]), // gender
    fields[12] || 'NULL', // age (integer)
    escapeSql(fields[13]), // athletics
    escapeSql(fields[14]), // freshman
    escapeSql(fields[15]), // housing_plan
    escapeSql(fields[16]), // student_housing
    escapeSql(fields[17]), // degrees
    escapeSql(fields[18]), // specializations
    escapeSql(fields[19]), // housing_status
    escapeSql(fields[20]), // is_athlete
    escapeSql(fields[21])  // meal_plan_type
  ];

  studentInserts.push(`(${values.join(', ')})`);

  // Execute in batches of 100 to avoid SQL size limits
  if (studentInserts.length >= 100) {
    const sql = `INSERT OR IGNORE INTO students (student_id, populi_id, first_name, last_name, class, meal_plan, enrollments, email, ipeds_race_ethnicity, hispanic_or_latino, races, gender, age, athletics, freshman, housing_plan, student_housing, degrees, specializations, housing_status, is_athlete, meal_plan_type) VALUES ${studentInserts.join(', ')};`;
    console.log(`  Inserting batch of ${studentInserts.length} students...`);
    executeSQL(sql, false); // Local first
    studentInserts = [];
  }
}

// Insert remaining students
if (studentInserts.length > 0) {
  const sql = `INSERT OR IGNORE INTO students (student_id, populi_id, first_name, last_name, class, meal_plan, enrollments, email, ipeds_race_ethnicity, hispanic_or_latino, races, gender, age, athletics, freshman, housing_plan, student_housing, degrees, specializations, housing_status, is_athlete, meal_plan_type) VALUES ${studentInserts.join(', ')};`;
  console.log(`  Inserting final batch of ${studentInserts.length} students...`);
  executeSQL(sql, false);
}

console.log('✅ Students imported successfully!');

// Import transactions from all meal plan files
const transactionFiles = [
  'Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv',
  'Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv',
  'Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv',
  'Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv'
];

console.log('📦 Importing transactions...');
let totalTransactions = 0;

for (const filename of transactionFiles) {
  console.log(`  Processing ${filename}...`);
  const transFile = path.join(DATA_DIR, filename);
  const transContent = fs.readFileSync(transFile, 'utf-8');
  const transLines = transContent.split('\n').filter(line => line.trim());
  const transHeaders = parseCSVLine(transLines[0]);

  let transactionInserts = [];
  for (let i = 1; i < transLines.length; i++) {
    const fields = parseCSVLine(transLines[i]);
    if (fields.length < transHeaders.length) continue;

    const values = [
      fields[11] || 'NULL', // transaction_id (integer, not primary key anymore)
      escapeSql(fields[0]), // date
      escapeSql(fields[1]), // person_campus_id
      escapeSql(fields[2]), // person_full_name
      escapeSql(fields[3]), // place
      escapeSql(fields[4]), // account_name
      escapeSql(fields[5]), // transaction_type
      fields[6] || 'NULL', // net_transaction_amount (real)
      escapeSql(fields[7]), // transaction_response
      escapeSql(fields[8]), // meal_period
      escapeSql(fields[9]), // tender
      escapeSql(fields[10]), // terminal_id
      fields[12] || 'NULL', // week_number (integer)
      escapeSql(fields[13]), // day_of_week
      fields[14] || 'NULL', // hour (integer)
      fields[15] || 'NULL', // is_swipe (integer)
      fields[16] || 'NULL', // is_denied (integer)
      fields[17] || 'NULL'  // unused_meals (integer)
    ];

    transactionInserts.push(`(${values.join(', ')})`);
    totalTransactions++;

    // Execute in batches of 100
    if (transactionInserts.length >= 100) {
      const sql = `INSERT INTO transactions (transaction_id, date, person_campus_id, person_full_name, place, account_name, transaction_type, net_transaction_amount, transaction_response, meal_period, tender, terminal_id, week_number, day_of_week, hour, is_swipe, is_denied, unused_meals) VALUES ${transactionInserts.join(', ')};`;
      console.log(`    Inserting batch of ${transactionInserts.length} transactions...`);
      executeSQL(sql, false);
      transactionInserts = [];
    }
  }

  // Insert remaining transactions from this file
  if (transactionInserts.length > 0) {
    const sql = `INSERT INTO transactions (transaction_id, date, person_campus_id, person_full_name, place, account_name, transaction_type, net_transaction_amount, transaction_response, meal_period, tender, terminal_id, week_number, day_of_week, hour, is_swipe, is_denied, unused_meals) VALUES ${transactionInserts.join(', ')};`;
    console.log(`    Inserting final batch of ${transactionInserts.length} transactions...`);
    executeSQL(sql, false);
  }
}

console.log(`✅ Transactions imported successfully! (${totalTransactions} total)`);

console.log('\n📤 Now syncing to remote database...');
executeSQL('SELECT COUNT(*) FROM students;', true);
executeSQL('SELECT COUNT(*) FROM transactions;', true);

console.log('\n✨ Data import complete!');
console.log('\n📊 To verify the import, run:');
console.log('  wrangler d1 execute acu-meal-data --command="SELECT COUNT(*) FROM students"');
console.log('  wrangler d1 execute acu-meal-data --command="SELECT COUNT(*) FROM transactions"');
