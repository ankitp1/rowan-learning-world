import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Blend the Plank: letters slide together while the sounds play, then pick the picture. */
export default function BlendPlank(props: MiniAppProps) {
  return <McApp appId="blend-plank" props={props} variant="plank" />;
}
