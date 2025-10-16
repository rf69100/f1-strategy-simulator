import { Menu } from "./Menu";

export default function MenuFlow({ onDone }: { onDone: (choices: any) => void }) {
  return <Menu onDone={onDone} />;
}