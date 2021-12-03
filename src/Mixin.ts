import { ExecutionContext } from "./ExecutionContext";
import { Scenario } from "./Scenario";

export interface Mixin<S extends Scenario<T>, T extends any> {
  init?(context: ExecutionContext, scenario: S): Promise<void>;
  description: string;
  beforeAll?(scenario: S): Promise<void>;
  beforeEach?(scenario: S): Promise<void>;
  beforeExecute?(scenario: S): Promise<void>;
  afterExecute?(scenario: S, result: T): Promise<void>;
  afterAll?(scenario: S): Promise<void>;
  afterEach?(scenario: S): Promise<void>;
  teardown?(scenario: S): Promise<void>;
}
