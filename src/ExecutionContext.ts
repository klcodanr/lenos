import { Runner } from "./Runner";
import log from "./Logger";

export class ExecutionContext {
  log = log;
  runner: Runner;
  params: any;

  constructor(runner: Runner, params?: Object) {
    this.runner = runner;
    this.params = params;
  }
}
