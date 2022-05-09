const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegex = /contract Verifier/;
const filenameRegex = /(.*)?.sol/;

function bumpSolidityVersion(name) {
  let content = fs.readFileSync(`./contracts/${name}.sol`, {
    encoding: "utf-8",
  });
  let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
  bumped = bumped.replace(verifierRegex, `contract ${name}`);

  fs.writeFileSync(`./contracts/${name}.sol`, bumped);
}

fs.readdirSync("./contracts")
  .filter((fn) => fn.endsWith(".sol"))
  .map((filename) => filename.match(filenameRegex)[1])
  .map((file) => bumpSolidityVersion(file));
