import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Number Bonds Bridge: pick the planks that make 10 to fix the bridge. */
export default function NumberBridge(props: MiniAppProps) {
  return <McApp appId="number-bridge" props={props} variant="bridge" />;
}
