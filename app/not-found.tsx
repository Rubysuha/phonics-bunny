import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import StatusScreen, { statusStyles } from "@/components/StatusScreen";

export default function NotFound() {
  return (
    <StatusScreen
      icon={<MagnifyingGlass size={56} weight="bold" />}
      title="페이지를 찾을 수 없어요"
      message="주소가 바뀌었거나 없는 페이지예요."
      fullPage
    >
      <Link
        href="/dashboard"
        className={`${statusStyles.button} ${statusStyles.primary}`}
      >
        Home으로 가기
      </Link>
    </StatusScreen>
  );
}
