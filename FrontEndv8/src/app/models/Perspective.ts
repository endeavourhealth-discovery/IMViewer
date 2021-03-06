export class NamedState {
  state: string;
  name: string;
}

export class Perspective {
  caption: string;
  subtitle: string;
  description: string;
  primary: NamedState;
  additionalStates?: NamedState[];
  image: string;
  icon: string;
  color: string;
  root: string;
}
