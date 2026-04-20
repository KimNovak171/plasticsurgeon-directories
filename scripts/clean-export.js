const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "out");

/**
 * @param {string} fileName
 */
function isTxtExtensionCaseInsensitive(fileName) {
  return fileName.toLowerCase().endsWith(".txt");
}

/**
 * Preserve only the file named exactly "robots.txt" (any letter case on the name).
 * @param {string} fileName
 */
function isPreservedRobotsTxt(fileName) {
  return fileName.toLowerCase() === "robots.txt";
}

/**
 * @param {string} dir
 */
function walkAndDeleteTxt(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndDeleteTxt(fullPath);
    } else if (entry.isFile()) {
      if (isTxtExtensionCaseInsensitive(entry.name) && !isPreservedRobotsTxt(entry.name)) {
        fs.unlinkSync(fullPath);
      }
    }
  }
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    return;
  }
  const stat = fs.statSync(OUT_DIR);
  if (!stat.isDirectory()) {
    return;
  }
  walkAndDeleteTxt(OUT_DIR);
}

main();
