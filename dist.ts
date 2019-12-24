import * as path from "path";
import * as glob from "glob";
import * as fs from "fs";

interface Language {
    language: string;
    path: string;
    html: File[];
    assets: File[];
}

interface File {
    path: string;
    file: string;
}

function getFiles(directory: string, pattern: string): File[] {
    return glob
        .sync(path.join(directory, pattern))
        .map<File>((file: string) => ({ path: file, file: path.basename(file) }));
}

const dist = path.join(__dirname, "dist");

const languages = glob
    .sync(path.join(__dirname, "src/languages/*.json"))
    .map<Language>((file: string) => {
        const language = path.basename(file, path.extname(file));
        const directory = path.join(dist, language);
        return {
            language: language,
            path: directory,
            html: getFiles(directory, "/**/*.html"),
            assets: getFiles(directory, "/**/!(*.html|*.js)")
        } as Language;
    });

languages.forEach((language: Language) => {
    language.assets.forEach((file: File) => {
        fs.renameSync(file.path, path.join(dist, file.file));
    });
    language.html.forEach((file: File) => {
        let content = fs.readFileSync(file.path, {
            encoding: "utf8",
            flag: "r"
        });
        const re = /(<link href|<img src)="(?!http[s]?)/gi;
        content = content.replace(re, "$1=\"../");
        console.log(`saving ${file.path}`);
        fs.writeFileSync(file.path, content);
    });
});