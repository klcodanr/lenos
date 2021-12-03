import { ExecutionContext } from "./ExecutionContext";
import { Mixin } from "./Mixin";
import { Verifier } from "./Verifier";
import log from "./Logger";
import {
  callAfterExecuteOnMixins,
  callBeforeExecuteOnMixins,
  callHook,
  callInitForAll,
} from "./Runner";

export type Hooks =
  | "beforeAll"
  | "beforeEach"
  | "afterAll"
  | "afterEach"
  | "teardown";

export interface Scenario<Result extends any> {
  container: boolean;
  description: string;
  mixins: Array<Mixin<Scenario<Result>, Result>>;
  verifiers: Array<Verifier<Result>>;
  init?(context: ExecutionContext): Promise<void>;
  beforeAll?(): Promise<void>;
  beforeEach?(): Promise<void>;
  execute(): Promise<Result>;
  afterAll?(): Promise<void>;
  afterEach?(): Promise<void>;
  teardown?(): Promise<void>;
}

export class SequenceScenario<Result extends any> implements Scenario<void> {
  container = true;
  description: string;
  mixins = [];
  scenarios: Scenario<Result>[];
  verifiers = [];

  constructor(description: string, scenarios: Array<Scenario<Result>>) {
    this.description = description;
    this.scenarios = scenarios;
  }

  async init(context: ExecutionContext): Promise<void> {
    await callInitForAll(this.scenarios, context);
  }
  async execute(): Promise<void> {
    log.info(`Executing sequence scenario`);
    const sce = this;
    describe(this.description, async function () {
      for (const s of sce.scenarios) {
        log.info(`Executing scenario: ${s.description}`);
        step(s.description, async function () {
          before(async function () {
            await callHook(s, "beforeAll");
          });
          beforeEach(async function () {
            await callHook(s, "beforeEach");
          });
          after(async function () {
            await callHook(s, "afterAll");
          });
          afterEach(async function () {
            await callHook(s, "afterEach");
          });
          await callBeforeExecuteOnMixins(s);
          const result = await s.execute();
          await callAfterExecuteOnMixins(s, result);
          for (const verifier of s.verifiers) {
            await verifier.verify(result);
          }
        });
      }
    });
    return Promise.resolve();
  }
  async teardown(): Promise<void> {
    for (const scenario of this.scenarios) {
      await callHook(scenario, "teardown");
    }
  }
}
