import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Coin Count: count to 10 then 20, and compare piles. */
export default function CoinCount(props: MiniAppProps) {
  return <McApp appId="coin-count" props={props} />;
}
