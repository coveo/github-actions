const { copyFileSync } = require("fs");

copyFileSync("build/entry.js", "dist/entry.js");
