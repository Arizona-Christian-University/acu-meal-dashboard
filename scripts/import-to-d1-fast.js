#!/usr/bin/env node
/**
 * Fast CSV import into Cloudflare D1
 * Generates one large SQL file and executes it all at once
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'Data');
const MIGRATION_FILE = path.join(__dirname, '0002_import_data.sql');

// Helper to escape single quotes
function escapeSql(value) {
  if (value === null || value === undefined || value === '') {
    return 'NULL';
  }
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// Parse CSV line (handles quoted fields)
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
        i++;
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
  fields.push(field);
  return fields;
}

console.log('📦 Generating SQL migration file...\n');

let sqlStatements = [];

// Import students
console.log('  Processing students...');
const studentsFile = path.join(DATA_DIR, 'Atrium Members - Students.csv');
const studentsContent = fs.readFileSync(studentsFile, 'utf-8');
const studentsLines = studentsContent.split('\n').filter(line => line.trim());

let studentValues = [];
for (let i = 1; i < studentsLines.length; i++) {
  const fields = parseCSVLine(studentsLines[i]);
  if (fields.length < 22) continue;

  const values = [
    escapeSql(fields[0]), escapeSql(fields[1]), escapeSql(fields[2]),
    escapeSql(fields[3]), escapeSql(fields[4]), escapeSql(fields[5]),
    fields[6] || 'NULL', escapeSql(fields[7]), escapeSql(fields[8]),
    escapeSql(fields[9]), escapeSql(fields[10]), escapeSql(fields[11]),
    fields[12] || 'NULL', escapeSql(fields[13]), escapeSql(fields[14]),
    escapeSql(fields[15]), escapeSql(fields[16]), escapeSql(fields[17]),
    escapeSql(fields[18]), escapeSql(fields[19]), escapeSql(fields[20]),
    escapeSql(fields[21])
  ];

  studentValues.push(`(${values.join(', ')})`);
}

if (studentValues.length > 0) {
  // Split into chunks of 500 to avoid SQL size limits
  const chunkSize = 500;
  for (let i = 0; i < studentValues.length; i += chunkSize) {
    const chunk = studentValues.slice(i, i + chunkSize);
    sqlStatements.push(
      `INSERT OR IGNORE INTO students (student_id, populi_id, first_name, last_name, class, meal_plan, enrollments, email, ipeds_race_ethnicity, hispanic_or_latino, races, gender, age, athletics, freshman, housing_plan, student_housing, degrees, specializations, housing_status, is_athlete, meal_plan_type) VALUES ${chunk.join(', ')};`
    );
  }
}

console.log(`    ${studentValues.length} students`);

// Import transactions
const transactionFiles = [
  'Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv',
  'Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv',
  'Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv',
  'Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv'
];

let totalTransactions = 0;

for (const filename of transactionFiles) {
  console.log(`  Processing ${filename}...`);
  const transFile = path.join(DATA_DIR, filename);
  const transContent = fs.readFileSync(transFile, 'utf-8');
  const transLines = transContent.split('\n').filter(line => line.trim());

  let transactionValues = [];
  for (let i = 1; i < transLines.length; i++) {
    const fields = parseCSVLine(transLines[i]);
    if (fields.length < 18) continue;

    const values = [
      fields[11] || 'NULL', escapeSql(fields[0]), escapeSql(fields[1]),
      escapeSql(fields[2]), escapeSql(fields[3]), escapeSql(fields[4]),
      escapeSql(fields[5]), fields[6] || 'NULL', escapeSql(fields[7]),
      escapeSql(fields[8]), escapeSql(fields[9]), escapeSql(fields[10]),
      fields[12] || 'NULL', escapeSql(fields[13]), fields[14] || 'NULL',
      fields[15] || 'NULL', fields[16] || 'NULL', fields[17] || 'NULL'
    ];

    transactionValues.push(`(${values.join(', ')})`);
    totalTransactions++;
  }

  // Split into chunks of 500
  const chunkSize = 500;
  for (let i = 0; i < transactionValues.length; i += chunkSize) {
    const chunk = transactionValues.slice(i, i + chunkSize);
    sqlStatements.push(
      `INSERT INTO transactions (transaction_id, date, person_campus_id, person_full_name, place, account_name, transaction_type, net_transaction_amount, transaction_response, meal_period, tender, terminal_id, week_number, day_of_week, hour, is_swipe, is_denied, unused_meals) VALUES ${chunk.join(', ')};`
    );
  }

  console.log(`    ${transactionValues.length} transactions`);
}

// Execute in batches to avoid size limits
console.log(`\n✅ Generated ${sqlStatements.length} SQL statements`);
console.log(`   ${studentValues.length} students, ${totalTransactions} transactions\n`);

const BATCH_SIZE = 50; // Execute 50 statements at a time
const totalBatches = Math.ceil(sqlStatements.length / BATCH_SIZE);

console.log(`📤 Executing ${totalBatches} batches on local database...`);
for (let i = 0; i < sqlStatements.length; i += BATCH_SIZE) {
  const batch = sqlStatements.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;

  fs.writeFileSync(MIGRATION_FILE, batch.join('\n\n'), 'utf-8');
  console.log(`   Batch ${batchNum}/${totalBatches}...`);

  try {
    execSync(`wrangler d1 execute acu-meal-data --file="${MIGRATION_FILE}" 2>&1`, { stdio: 'pipe' });
  } catch (error) {
    console.error(`   Failed batch ${batchNum}, continuing...`);
  }
}

console.log('\n📤 Executing on remote database...');
for (let i = 0; i < sqlStatements.length; i += BATCH_SIZE) {
  const batch = sqlStatements.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;

  fs.writeFileSync(MIGRATION_FILE, batch.join('\n\n'), 'utf-8');
  console.log(`   Batch ${batchNum}/${totalBatches}...`);

  try {
    const output = execSync(`wrangler d1 execute acu-meal-data --file="${MIGRATION_FILE}" --remote 2>&1`, { encoding: 'utf-8' });
    if (output.includes('error') || output.includes('Error')) {
      console.error(`   Batch ${batchNum} had warnings/errors:`, output.substring(0, 200));
    }
  } catch (error) {
    console.error(`   Failed batch ${batchNum}:`, error.message.substring(0, 200));
  }
}

// Clean up
fs.unlinkSync(MIGRATION_FILE);

console.log('\n✨ Data import complete!');
