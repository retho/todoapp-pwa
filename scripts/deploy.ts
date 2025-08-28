import * as ghpages from 'gh-pages';
import * as cp from 'node:child_process';

const isThereUncommitedChanges = !cp.execSync('git status').toString().includes('nothing to commit, working tree clean');
if (isThereUncommitedChanges) {
  throw new Error('Uncommited changes was found');
}

cp.execSync("yarn run build", {stdio: 'inherit'});

console.log('\n\nPublishing to gh-pages...')
await ghpages.publish('dist', {
  branch: 'gh-pages',
})
