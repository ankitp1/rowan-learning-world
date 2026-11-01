import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Sight-word Cannon: the helper says a word, the child taps the matching word. */
export default function SightCannon(props: MiniAppProps) {
  return <McApp appId="sight-cannon" props={props} />;
}
