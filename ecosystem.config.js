const package = require("./package.json")

module.exports = {
  apps: [
    {
      name: `prod@${package.name}`,
      script: package.main,
      args: "",
      watch: false,
    },
  ],
}
