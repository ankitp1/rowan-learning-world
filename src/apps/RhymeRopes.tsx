import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Rhyme Ropes: swing to the word that rhymes. */
export default function RhymeRopes(props: MiniAppProps) {
  return <McApp appId="rhyme-ropes" props={props} variant="ropes" />;
}
