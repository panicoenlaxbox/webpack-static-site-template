import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';

glob
    .sync(path.join(__dirname, 'src/languages/*.json'))
    .map(file => path.basename(file, path.extname(file)))
    .forEach(language => {
        glob
            .sync(path.join(path.join(__dirname, 'dist'), language, '/**/!(*.html|*.js)'))
            .map(file => {
                const oldPath = file;
                const newPath = file.replace(`dist/${language}/`, 'dist/');
                console.log(`moving from ${oldPath} to ${newPath}`);
                fs.renameSync(oldPath, newPath);
            })
    });