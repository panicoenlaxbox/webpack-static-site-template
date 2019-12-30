const path = require("path");
const glob = require("glob");
const exec = require("child_process").exec;

module.exports.exec = command => {
  exec(command, (err, stdout, stderr) => {
    process.stdout.write(stdout);
    process.stderr.write(stderr);
  });
};

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
