import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Captain's Log: read a written direction, then tap the shape that matches. */
export default function CaptainsLog(props: MiniAppProps) {
  return <McApp appId="captains-log" props={props} />;
}
