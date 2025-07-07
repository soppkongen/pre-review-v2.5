import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

// Fix ESM imports in compiled worker files
const files = glob.sync('dist/lib/**/*.js');

files.forEach(file => {
  let content = readFileSync(file, 'utf8');
  
  // Fix relative imports to include .js extension
  content = content.replace(
    /from ['"](\.[^'"]*)['"]/g,
    (match, importPath) => {
      if (!importPath.endsWith('.js') && !importPath.includes('*')) {
        return `from '${importPath}.js'`;
      }
      return match;
    }
  );
  
  writeFileSync(file, content);
  console.log(`Fixed imports in ${file}`);
});

console.log('Worker imports fixed!'); 