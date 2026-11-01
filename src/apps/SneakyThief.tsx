import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Sneaky Thief (Sneaky Seagull in the pirate theme): subtraction as "how many are left?". */
export default function SneakyThief(props: MiniAppProps) {
  return <McApp appId="sneaky-thief" props={props} />;
}
