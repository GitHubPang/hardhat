import { AssertionError, expect } from "chai";

import "../src";
import { PANIC_CODES } from "../src/panic";
import {
  runSuccessfulAsserts,
  runFailedAsserts,
  useEnvironment,
  useEnvironmentWithNode,
} from "./helpers";

describe("INTEGRATION: Reverted with panic", function () {
  describe("with the in-process hardhat network", function () {
    useEnvironment("hardhat-project");

    runTests();
  });

  describe("connected to a hardhat node", function () {
    useEnvironmentWithNode("hardhat-project");

    runTests();
  });

  function runTests() {
    // deploy Matchers contract before each test
    let matchers: any;
    beforeEach("deploy matchers contract", async function () {
      const Matchers = await this.hre.ethers.getContractFactory("Matchers");
      matchers = await Matchers.deploy();
    });

    // helpers
    const expectAssertionError = async (x: Promise<void>, message: string) => {
      return expect(x).to.be.eventually.rejectedWith(AssertionError, message);
    };

    const mineSuccessfulTransaction = async (hre: any) => {
      await hre.network.provider.send("evm_setAutomine", [false]);

      const [signer] = await hre.ethers.getSigners();
      const tx = await signer.sendTransaction({ to: signer.address });

      await hre.network.provider.send("hardhat_mine", []);
      await hre.network.provider.send("evm_setAutomine", [true]);

      return tx;
    };

    describe("calling a method that succeeds", function () {
      it("successful asserts", async function () {
        await runSuccessfulAsserts({
          matchers,
          method: "succeeds",
          successfulAssert: (x) => expect(x).not.to.be.revertedWithPanic(),
        });

        await runSuccessfulAsserts({
          matchers,
          method: "succeeds",
          successfulAssert: (x) =>
            expect(x).not.to.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
        });
      });

      it("failed asserts", async function () {
        await runFailedAsserts({
          matchers,
          method: "succeeds",
          failedAssert: (x) => expect(x).to.be.revertedWithPanic(),
          failedAssertReason:
            "Expected transaction to be reverted with some panic code, but it didn't revert",
        });

        await runFailedAsserts({
          matchers,
          method: "succeeds",
          failedAssert: (x) =>
            expect(x).to.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
          failedAssertReason:
            "Expected transaction to be reverted with panic code 0x01 (Assertion error), but it didn't revert",
        });
      });
    });

    describe("calling a method that reverts without a reason string", function () {
      it("successful asserts", async function () {
        await runSuccessfulAsserts({
          matchers,
          method: "revertsWithoutReasonString",
          successfulAssert: (x) => expect(x).to.not.be.revertedWithPanic(),
        });

        await runSuccessfulAsserts({
          matchers,
          method: "revertsWithoutReasonString",
          successfulAssert: (x) =>
            expect(x).to.not.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
        });
      });

      it("failed asserts", async function () {
        await runFailedAsserts({
          matchers,
          method: "revertsWithoutReasonString",
          failedAssert: (x) => expect(x).to.be.revertedWithPanic(),
          failedAssertReason:
            "Expected transaction to be reverted with some panic code, but it reverted without a reason string",
        });

        await runFailedAsserts({
          matchers,
          method: "revertsWithoutReasonString",
          failedAssert: (x) =>
            expect(x).to.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
          failedAssertReason:
            "Expected transaction to be reverted with panic code 0x01 (Assertion error), but it reverted without a reason string",
        });
      });
    });

    describe("calling a method that reverts with a reason string", function () {
      it("successful asserts", async function () {
        await runSuccessfulAsserts({
          matchers,
          method: "revertsWith",
          args: ["some reason"],
          successfulAssert: (x) => expect(x).to.not.be.revertedWithPanic(),
        });

        await runSuccessfulAsserts({
          matchers,
          method: "revertsWith",
          args: ["some reason"],
          successfulAssert: (x) =>
            expect(x).to.not.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
        });
      });

      it("failed asserts", async function () {
        await runFailedAsserts({
          matchers,
          method: "revertsWith",
          args: ["some reason"],
          failedAssert: (x) => expect(x).to.be.revertedWithPanic(),
          failedAssertReason:
            "Expected transaction to be reverted with some panic code, but it reverted with reason 'some reason'",
        });

        await runFailedAsserts({
          matchers,
          method: "revertsWith",
          args: ["some reason"],
          failedAssert: (x) =>
            expect(x).to.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
          failedAssertReason:
            "Expected transaction to be reverted with panic code 0x01 (Assertion error), but it reverted with reason 'some reason'",
        });
      });
    });

    describe("calling a method that reverts with a panic code", function () {
      it("successful asserts", async function () {
        await runSuccessfulAsserts({
          matchers,
          method: "panicAssert",
          successfulAssert: (x) => expect(x).to.be.revertedWithPanic(),
        });

        await runSuccessfulAsserts({
          matchers,
          method: "panicAssert",
          successfulAssert: (x) =>
            expect(x).to.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
        });
      });

      it("failed asserts", async function () {
        await runFailedAsserts({
          matchers,
          method: "panicAssert",
          failedAssert: (x) => expect(x).to.not.be.revertedWithPanic(),
          failedAssertReason:
            "Expected transaction NOT to be reverted with some panic code, but it reverted with panic code 0x01 (Assertion error)",
        });

        await runFailedAsserts({
          matchers,
          method: "panicAssert",
          failedAssert: (x) =>
            expect(x).to.not.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
          failedAssertReason:
            "Expected transaction NOT to be reverted with panic code 0x01 (Assertion error), but it did",
        });

        await runFailedAsserts({
          matchers,
          method: "panicAssert",
          failedAssert: (x) =>
            expect(x).to.be.revertedWithPanic(
              PANIC_CODES.ARITHMETIC_UNDER_OR_OVERFLOW
            ),
          failedAssertReason:
            "Expected transaction to be reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block), but it reverted with panic code 0x01 (Assertion error)",
        });
      });
    });

    describe("calling a method that reverts with a custom error", function () {
      it("successful asserts", async function () {
        await runSuccessfulAsserts({
          matchers,
          method: "revertWithSomeCustomError",
          successfulAssert: (x) => expect(x).to.not.be.revertedWithPanic(),
        });

        await runSuccessfulAsserts({
          matchers,
          method: "revertWithSomeCustomError",
          successfulAssert: (x) =>
            expect(x).to.not.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
        });
      });

      it("failed asserts", async function () {
        await runFailedAsserts({
          matchers,
          method: "revertWithSomeCustomError",
          failedAssert: (x) => expect(x).to.be.revertedWithPanic(),
          failedAssertReason:
            "Expected transaction to be reverted with some panic code, but it reverted with a custom error",
        });

        await runFailedAsserts({
          matchers,
          method: "revertWithSomeCustomError",
          failedAssert: (x) =>
            expect(x).to.be.revertedWithPanic(PANIC_CODES.ASSERTION_ERROR),
          failedAssertReason:
            "Expected transaction to be reverted with panic code 0x01 (Assertion error), but it reverted with a custom error",
        });
      });
    });

    describe("invalid values", function () {
      it("non-errors as subject", async function () {
        await expectAssertionError(
          expect(Promise.reject({})).to.be.revertedWithPanic(1),
          "Expected an Error object"
        );
      });

      it("non-number as expectation", async function () {
        const { hash } = await mineSuccessfulTransaction(this.hre);

        await expectAssertionError(
          expect(hash).to.be.revertedWithPanic("10" as any),
          "Expected a number or BigNumber as the expected panic code"
        );
      });
    });
  }
});
