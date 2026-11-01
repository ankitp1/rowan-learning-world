import type { MiniAppProps } from '../core/types';
import { McApp } from '../ui/Round';

/** Group Names: what is a group of lions called? One mouse, two what? */
export default function GroupNames(props: MiniAppProps) {
  return <McApp appId="group-names" props={props} variant="groups" />;
}
