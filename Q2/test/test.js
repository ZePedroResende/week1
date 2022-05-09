const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe("HelloWorld", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    // create proof and public signals with the input `{"a":"1","b":"2"}`
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    // `log the result of 1 * 2`
    console.log("1x2 =", publicSignals[0]);

    // turn the public signal string in to a BigInt
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    // turn the proof strings in to a BigInts
    const editedProof = unstringifyBigInts(proof);

    // transform the proof and public signal in to solidity calldata
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      // flat map the calldata
      .replace(/["[\]\s]/g, "")
      // create an array of hex strings
      .split(",")
      // transform the hex values to BigInt string representation
      .map((x) => BigInt(x).toString());

    // construct the a value of the proof
    const a = [argv[0], argv[1]];
    // construct the b value of the proof
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    // construct the c value of the proof
    const c = [argv[6], argv[7]];
    // construct the input value of the proof
    const Input = argv.slice(8);

    // pass the  proof and signal to the verifier (solidity contract)
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];

    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("Multiplier3Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    // create proof and public signals with the input `{"a":"1","b":"2", "c": "3"}`
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2", c: "3" },
      "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3/circuit_final.zkey"
    );

    // `log the result of 1 * 2 * 3`
    console.log("1x2 = ", publicSignals[0]);
    console.log(publicSignals[0] + "X3 = ", publicSignals[1]);

    // turn the public signal string in to a BigInt
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    // turn the proof strings in to a BigInts
    const editedProof = unstringifyBigInts(proof);

    // transform the proof and public signal in to solidity calldata
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      // flat map the calldata
      .replace(/["[\]\s]/g, "")
      // create an array of hex strings
      .split(",")
      // transform the hex values to BigInt string representation
      .map((x) => BigInt(x).toString());

    // construct the a value of the proof
    const a = [argv[0], argv[1]];
    // construct the b value of the proof
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    // construct the c value of the proof
    const c = [argv[6], argv[7]];
    // construct the Input value of the proof
    const Input = [argv[8], argv[9]];

    // pass the  proof and signal to the verifier (solidity contract)
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0, 0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("Multiplier3VerifierPlonk");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    // create proof and public signals with the input `{"a":"1","b":"2", "c": "3"}`
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1", b: "2", c: "3" },
      "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
    );

    // `log the result of 1 * 2 * 3`
    console.log("1x2 = ", publicSignals[0]);
    console.log(publicSignals[0] + "X3 = ", publicSignals[1]);

    // turn the public signal string in to a BigInt
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    // turn the proof strings in to a BigInts
    const editedProof = unstringifyBigInts(proof);

    // transform the proof and public signal in to solidity calldata
    const calldata = await plonk.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      // flat map the calldata
      .replace(/["[\]\s]/g, "")
      // create an array of hex strings
      .split(",");

    const Proof = argv[0];

    const Input = argv
      .slice(1)
      // transform the hex values to BigInt string representation
      .map((x) => BigInt(x).toString());

    // pass the  proof and signal to the verifier (solidity contract)
    expect(await verifier.verifyProof(Proof, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    let a = 0;
    let signals = [0, 0];
    expect(await verifier.verifyProof(a, signals)).to.be.false;
  });
});
