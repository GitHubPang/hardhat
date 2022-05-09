import "./types";
import { supportBigNumber } from "./bigNumber";
import { supportEmit } from "./emit";
import { supportReverted } from "./reverted";
import { supportHexEqual } from "./hexEqual";
import { supportProperAddress } from "./properAddress";
import { supportProperPrivateKey } from "./properPrivateKey";
import { supportChangeEtherBalance } from "./changeEtherBalance";
import { supportChangeEtherBalances } from "./changeEtherBalances";
import { supportChangeTokenBalance } from "./changeTokenBalance";

export function hardhatChaiMatchers(
  chai: Chai.ChaiStatic,
  utils: Chai.ChaiUtils
) {
  supportBigNumber(chai.Assertion, utils);
  supportEmit(chai.Assertion);
  supportReverted(chai.Assertion);
  supportHexEqual(chai.Assertion);
  supportProperAddress(chai.Assertion);
  supportProperPrivateKey(chai.Assertion);
  supportChangeEtherBalance(chai.Assertion);
  supportChangeEtherBalances(chai.Assertion);
  supportChangeTokenBalance(chai.Assertion);
}
