import { ExecutionContext } from "./ExecutionContext";
import log from "./Logger";
import { Hooks, Scenario } from "./Scenario";

export interface Runner {
  description: string;
  scenarios: Array<Scenario<any>>;
  run(): Promise<void>;
}

export async function callInitForAll(
  scenarios: Array<Scenario<any>>,
  context: ExecutionContext
) {
  for (const scenario of scenarios) {
    if (scenario.init) {
      log.debug(`Calling init on scenario ${scenario.description}`);
      await scenario.init(context);
    } else {
      log.debug(`No init for scenario ${scenario.description}`);
    }
    if (scenario.mixins) {
      for (const mixin of scenario.mixins) {
        if (mixin.init) {
          log.debug(`Calling init on mixin ${mixin.description}`);
          await mixin.init(context, scenario);
        } else {
          log.debug(`No init method on mixin ${mixin.description}`);
        }
      }
    } else {
      log.debug(`No mixins for scenario ${scenario.description}`);
    }
  }
}

export async function callHook(scenario: Scenario<any>, method: Hooks) {
  const fn = scenario[method];
  if (fn) {
    log.debug(`Calling hook ${method} on scenario ${scenario.description}`);
    await fn();
  } else {
    log.debug(`No hook ${method} found on scenario ${scenario.description}`);
  }
  if (scenario.mixins) {
    for (const mixin of scenario.mixins) {
      const mfn = mixin[method];
      if (mfn) {
        log.debug(`Calling hook ${method} on mixin: ${mixin.description}`);
        await mfn(scenario);
      } else {
        log.debug(`No hook ${method} found on mixin ${mixin.description}`);
      }
    }
  } else {
    log.debug(`No mixins found on scenario ${scenario.description}`);
  }
}

export async function callBeforeExecuteOnMixins(scenario: Scenario<any>) {
  if (scenario.mixins) {
    for (const mixin of scenario.mixins) {
      if (mixin.beforeExecute) {
        mixin.beforeExecute(scenario);
      }
    }
  }
}

export async function callAfterExecuteOnMixins(
  scenario: Scenario<any>,
  result: any
) {
  if (scenario.mixins) {
    for (const mixin of scenario.mixins) {
      if (mixin.afterExecute) {
        mixin.afterExecute(scenario, result);
      }
    }
  }
}

export class SimpleRunner implements Runner {
  scenarios;
  description;
  constructor(description: string, scenarios: Array<Scenario<any>>) {
    this.description = description;
    this.scenarios = scenarios;
  }
  async run(): Promise<void> {
    log.info(`Starting runner`);
    const context = new ExecutionContext(this);
    await callInitForAll(this.scenarios, context);

    const ctx = this;
    describe(ctx.description, async function () {
      for (const s of ctx.scenarios) {
        log.info(`Executing scenario: ${s.description}`);
        it(s.description, async function () {
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
    for (const scenario of this.scenarios) {
      await callHook(scenario, "teardown");
    }

    log.info(`Runner complete`);

    return Promise.resolve();
  }
}
