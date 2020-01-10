const path = require("path");
const glob = require("glob");
const exec = require("child_process").exec;

function execute(command) {
  exec(command, (err, stdout, stderr) => {
    process.stdout.write(stdout);
    process.stderr.write(stderr);
  });
}

module.exports.exec = execute;

module.exports.translations = glob
  .sync("./src/languages/*.json")
  .map(file => ({
    language: path.basename(file, path.extname(file)),
    translation: require(file)
  }))
  .map(translation => {
    const isDefault = translation.language === "en";
    return {
      ...translation,
      default: isDefault,
      dist: path.resolve(
        __dirname,
        "dist",
        !isDefault ? translation.language : ""
      )
    };
  });

module.exports.rimraf = (path, patterns) => {
  patterns.forEach(pattern => {
    execute(`rimraf \"${path}/${pattern}\"`);
  });
};
