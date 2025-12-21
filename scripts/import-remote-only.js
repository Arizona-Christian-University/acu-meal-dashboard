#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'Data');

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

console.log('📦 Importing students to remote D1...\n');

// Import students
const studentsFile = path.join(DATA_DIR, 'Atrium Members - Students.csv');
const studentsContent = fs.readFileSync(studentsFile, 'utf-8');
const studentsLines = studentsContent.split('\n').filter(line => line.trim());

let count = 0;
const BATCH_SIZE = 100;
let batch = [];

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

  batch.push(`(${values.join(', ')})`);

  if (batch.length >= BATCH_SIZE) {
    const sql = `INSERT OR IGNORE INTO students (student_id, populi_id, first_name, last_name, class, meal_plan, enrollments, email, ipeds_race_ethnicity, hispanic_or_latino, races, gender, age, athletics, freshman, housing_plan, student_housing, degrees, specializations, housing_status, is_athlete, meal_plan_type) VALUES ${batch.join(', ')};`;

    try {
      execSync(`wrangler d1 execute acu-meal-data --remote --command "${sql.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
      count += batch.length;
      process.stdout.write(`\r   Imported ${count} students...`);
    } catch (error) {
      console.error(`\n   Error at batch ${count}:`, error.message.substring(0, 100));
    }
    batch = [];
  }
}

// Insert remaining
if (batch.length > 0) {
  const sql = `INSERT OR IGNORE INTO students (student_id, populi_id, first_name, last_name, class, meal_plan, enrollments, email, ipeds_race_ethnicity, hispanic_or_latino, races, gender, age, athletics, freshman, housing_plan, student_housing, degrees, specializations, housing_status, is_athlete, meal_plan_type) VALUES ${batch.join(', ')};`;
  try {
    execSync(`wrangler d1 execute acu-meal-data --remote --command "${sql.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
    count += batch.length;
    process.stdout.write(`\r   Imported ${count} students...`);
  } catch (error) {
    console.error(`\n   Error:`, error.message.substring(0, 100));
  }
}

console.log(`\n\n✨ Import complete! ${count} students imported.`);
