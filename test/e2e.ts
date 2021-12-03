import { expect } from "chai";
import { SimpleRunner } from "../src/Runner";
import { Scenario } from "../src/Scenario";
import { StringVerfier } from "../src/Verifier";

class TestScenario implements Scenario<string> {
  container = false;
  description = "test scenario";
  mixins = [];
  verifiers = new Array();

  async execute(): Promise<string> {
    return "hello world!";
  }
}

it("test simple scenario", async function () {
  const scenario = new TestScenario();
  expect(await scenario.execute()).to.equal("hello world!");
});

it("test simple runner", async function () {
  const runner = new SimpleRunner("simple runner", [new TestScenario()]);
  await runner.run();
});

it("test runner with verifiers", async function () {
  const verifier = new StringVerfier("hello world!");

  const scenario = new TestScenario();
  scenario.verifiers.push(verifier);
  const runner = new SimpleRunner("simple runner", [scenario]);
  await runner.run();
});

it("test runner with failing verifiers", async function () {
  const verifier = new StringVerfier("hello world2!");

  const scenario = new TestScenario();
  scenario.verifiers.push(verifier);
  const runner = new SimpleRunner("simple runner", [scenario]);
  await runner.run();
});
