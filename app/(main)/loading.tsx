import { Carrot } from "@phosphor-icons/react/ssr";
import StatusScreen from "@/components/StatusScreen";

export default function Loading() {
  return <StatusScreen icon={<Carrot size={56} weight="fill" />} title="불러오는 중이에요" bounce />;
}
