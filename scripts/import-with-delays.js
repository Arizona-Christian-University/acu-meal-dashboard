#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'Data');
const TEMP_SQL = path.join(__dirname, 'temp_import.sql');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function main() {
  console.log('📦 Importing transactions to remote D1 (with rate limit delays)...\n');

  const transFiles = [
    'Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv',
    'Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv',
    'Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv'
  ];

  for (const filename of transFiles) {
    console.log(`\nProcessing ${filename}...`);
    const transFile = path.join(DATA_DIR, filename);
    const transContent = fs.readFileSync(transFile, 'utf-8');
    const transLines = transContent.split('\n').filter(line => line.trim());

    const ROWS_PER_INSERT = 50;
    const INSERTS_PER_BATCH = 10; // 10 inserts per batch = 500 rows
    const DELAY_MS = 2000; // 2 second delay between batches

    let sqlLines = [];
    let currentBatch = [];

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

    console.log(`  Total: ${sqlLines.length} INSERT statements (${transLines.length - 1} rows)`);
    console.log(`  Executing in batches of ${INSERTS_PER_BATCH} with ${DELAY_MS}ms delays...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sqlLines.length; i += INSERTS_PER_BATCH) {
      const chunk = sqlLines.slice(i, i + INSERTS_PER_BATCH);
      fs.writeFileSync(TEMP_SQL, chunk.join('\n\n'));

      try {
        execSync(`wrangler d1 execute acu-meal-data --remote --file="${TEMP_SQL}"`, { stdio: 'pipe' });
        successCount += chunk.length;
        process.stdout.write(`\r  Progress: ${Math.min(i + INSERTS_PER_BATCH, sqlLines.length)}/${sqlLines.length} (${successCount} success, ${errorCount} errors)`);

        // Delay between batches to avoid rate limits
        if (i + INSERTS_PER_BATCH < sqlLines.length) {
          await sleep(DELAY_MS);
        }
      } catch (error) {
        errorCount += chunk.length;
        process.stdout.write(`\r  Progress: ${Math.min(i + INSERTS_PER_BATCH, sqlLines.length)}/${sqlLines.length} (${successCount} success, ${errorCount} errors)`);
        // Still delay even on error
        await sleep(DELAY_MS);
      }
    }

    console.log(` ✓`);
  }

  if (fs.existsSync(TEMP_SQL)) {
    fs.unlinkSync(TEMP_SQL);
  }

  console.log('\n✨ Import complete!');
  console.log('\nChecking final counts...');

  try {
    const result = execSync('wrangler d1 execute acu-meal-data --remote --command "SELECT (SELECT COUNT(*) FROM students) as students, (SELECT COUNT(*) FROM transactions) as transactions"', { encoding: 'utf-8' });
    console.log(result);
  } catch (e) {
    console.log('Could not query final counts');
  }
}

main().catch(console.error);
