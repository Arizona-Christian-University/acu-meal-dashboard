#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'Data');
const TEMP_SQL = path.join(__dirname, 'temp_import.sql');

function escapeSql(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  return "'" + String(value).replace(/'/g, "''") + "'";
}

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

console.log('📦 Importing to remote D1 database...\n');

// STUDENTS
console.log('1. Importing students...');
const studentsFile = path.join(DATA_DIR, 'Atrium Members - Students.csv');
const studentsContent = fs.readFileSync(studentsFile, 'utf-8');
const studentsLines = studentsContent.split('\n').filter(line => line.trim());

let sqlLines = [];
const ROWS_PER_INSERT = 50;
let currentBatch = [];

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

  currentBatch.push(`(${values.join(', ')})`);

  if (currentBatch.length >= ROWS_PER_INSERT) {
    sqlLines.push(`INSERT OR IGNORE INTO students (student_id, populi_id, first_name, last_name, class, meal_plan, enrollments, email, ipeds_race_ethnicity, hispanic_or_latino, races, gender, age, athletics, freshman, housing_plan, student_housing, degrees, specializations, housing_status, is_athlete, meal_plan_type) VALUES ${currentBatch.join(', ')};`);
    currentBatch = [];
  }
}

if (currentBatch.length > 0) {
  sqlLines.push(`INSERT OR IGNORE INTO students (student_id, populi_id, first_name, last_name, class, meal_plan, enrollments, email, ipeds_race_ethnicity, hispanic_or_latino, races, gender, age, athletics, freshman, housing_plan, student_housing, degrees, specializations, housing_status, is_athlete, meal_plan_type) VALUES ${currentBatch.join(', ')};`);
}

fs.writeFileSync(TEMP_SQL, sqlLines.join('\n\n'));
console.log(`   Generated ${sqlLines.length} INSERT statements for students`);
console.log('   Executing...');

try {
  const output = execSync(`wrangler d1 execute acu-meal-data --remote --file="${TEMP_SQL}"`, { encoding: 'utf-8' });
  console.log('   ✓ Students imported successfully');
} catch (error) {
  console.error('   ✗ Error:', error.stderr || error.message);
  process.exit(1);
}

// TRANSACTIONS
console.log('\n2. Importing transactions (this will take a while)...');
const transFiles = [
  'Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv',
  'Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv',
  'Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv',
  'Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv'
];

for (const filename of transFiles) {
  console.log(`\n   Processing ${filename}...`);
  const transFile = path.join(DATA_DIR, filename);
  const transContent = fs.readFileSync(transFile, 'utf-8');
  const transLines = transContent.split('\n').filter(line => line.trim());

  sqlLines = [];
  currentBatch = [];

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

    currentBatch.push(`(${values.join(', ')})`);

    if (currentBatch.length >= ROWS_PER_INSERT) {
      sqlLines.push(`INSERT INTO transactions (transaction_id, date, person_campus_id, person_full_name, place, account_name, transaction_type, net_transaction_amount, transaction_response, meal_period, tender, terminal_id, week_number, day_of_week, hour, is_swipe, is_denied, unused_meals) VALUES ${currentBatch.join(', ')};`);
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    sqlLines.push(`INSERT INTO transactions (transaction_id, date, person_campus_id, person_full_name, place, account_name, transaction_type, net_transaction_amount, transaction_response, meal_period, tender, terminal_id, week_number, day_of_week, hour, is_swipe, is_denied, unused_meals) VALUES ${currentBatch.join(', ')};`);
  }

  // Execute in chunks of 30 statements at a time
  const CHUNK_SIZE = 30;
  for (let i = 0; i < sqlLines.length; i += CHUNK_SIZE) {
    const chunk = sqlLines.slice(i, i + CHUNK_SIZE);
    fs.writeFileSync(TEMP_SQL, chunk.join('\n\n'));

    try {
      execSync(`wrangler d1 execute acu-meal-data --remote --file="${TEMP_SQL}"`, { stdio: 'pipe' });
      process.stdout.write(`\r   Progress: ${Math.min(i + CHUNK_SIZE, sqlLines.length)}/${sqlLines.length} batches`);
    } catch (error) {
      console.error(`\n   Error at batch ${i}:`, error.message.substring(0, 100));
    }
  }

  console.log(` ✓`);
}

fs.unlinkSync(TEMP_SQL);
console.log('\n✨ Import complete!');
