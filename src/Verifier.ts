import { expect } from "chai";

export interface Verifier<Result> {
  message?: string;
  verify(result: Result): Promise<void>;
}

type ComparisonMode =
  | "equals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "matches";
export class StringVerfier implements Verifier<string> {
  comparison: string;
  message?: string;
  mode = "equals";
  negate = false;
  constructor(
    comparison: string,
    message?: string,
    mode?: ComparisonMode,
    negate?: boolean
  ) {
    this.comparison = comparison;
    if (mode) {
      this.mode = mode;
    }
    if (negate) {
      this.negate = true;
    }
    this.message = message;
  }
  verify(result: string): Promise<void> {
    if (this.negate) {
      switch (this.mode) {
        case "equals": {
          expect(result).to.not.equal(this.comparison, this.message);
          break;
        }
        case "contains": {
          expect(result).to.not.contain(this.comparison, this.message);
          break;
        }
        case "startsWith": {
          expect(result.startsWith(this.comparison)).to.not.equal(
            true,
            `String ${result} started with ${this.comparison} ${this.message}`
          );
          break;
        }
        case "endsWith": {
          expect(result.endsWith(this.comparison)).to.equal(
            true,
            `String ${result} ends with ${this.comparison} ${this.message}`
          );
          break;
        }
        case "matches": {
          expect(result.match(this.comparison)).to.equal(
            null,
            `String ${result} matched regex ${this.comparison} ${this.message}`
          );
          break;
        }
      }
    } else {
      switch (this.mode) {
        case "equals": {
          expect(result).to.equal(this.comparison, this.message);
          break;
        }
        case "contains": {
          expect(result).to.contain(this.comparison, this.message);
          break;
        }
        case "startsWith": {
          expect(result.startsWith(this.comparison)).to.equal(
            true,
            `String ${result} did not start with ${this.comparison} ${this.message}`
          );
          break;
        }
        case "endsWith": {
          expect(result.endsWith(this.comparison)).to.equal(
            true,
            `String ${result} did not end with ${this.comparison} ${this.message}`
          );
          break;
        }
        case "matches": {
          expect(result.match(this.comparison)).to.not.equal(
            null,
            `String ${result} did not match regex ${this.comparison} ${this.message}`
          );
          break;
        }
      }
    }

    return Promise.resolve();
  }
}
