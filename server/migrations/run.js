/**
 * Migration CLI Runner (P5.1.3)
 *
 * Usage:
 *   node server/migrations/run.js            # Apply pending migrations
 *   node server/migrations/run.js --status    # Show migration status
 *   node server/migrations/run.js --create "description"
 */

import { initializeDatabase } from '../models/database.js';
import { createMigrationTemplate, getMigrationStatus, runMigrations } from './index.js';

const args = process.argv.slice(2);

async function main() {
  await initializeDatabase();

  if (args.includes('--status')) {
    const status = getMigrationStatus();
    console.log('\nMigration Status:');
    console.log('─'.repeat(60));
    for (const m of status) {
      const icon = m.status === 'applied' ? '✅' : '⏳';
      console.log(`  ${icon}  ${m.id}  ${m.name}  [${m.status}]`);
    }
    console.log('─'.repeat(60));
    const pending = status.filter((m) => m.status === 'pending').length;
    console.log(
      `  ${status.length} total, ${status.length - pending} applied, ${pending} pending\n`
    );
  } else if (args.includes('--create')) {
    const nameIdx = args.indexOf('--create') + 1;
    const name = args[nameIdx] || 'unnamed_migration';
    const tpl = createMigrationTemplate(name);
    console.log(`\nAdd this to MIGRATIONS array in server/migrations/index.js:\n`);
    console.log(tpl.template);
    console.log('');
  } else {
    console.log('\nRunning pending migrations...');
    const results = runMigrations();
    console.log(`  Applied: ${results.applied.length}`);
    console.log(`  Skipped: ${results.skipped.length}`);
    if (results.errors.length) {
      console.error(`  Errors:  ${results.errors.length}`);
      for (const e of results.errors) {
        console.error(`    ❌ ${e}`);
      }
      process.exit(1);
    }
    console.log('Done.\n');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Migration runner failed:', err.message);
  process.exit(1);
});
