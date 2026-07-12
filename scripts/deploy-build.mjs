import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args, cwd = root) {
  console.log(`\n> ${cmd} ${args.join(' ')}\n`);
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('npm', ['run', 'icons:generate', '--workspace=frontend']);
run('npm', ['run', 'build', '--workspace=backend']);
run('npm', ['run', 'build', '--workspace=frontend']);

console.log('\nProduction build complete.');
console.log('Next: set backend/.env (NODE_ENV=production, SERVE_FRONTEND=true) and run:');
console.log('  npm run start:prod\n');
