import Image from "next/image";
import logo from "@/assets/logo.png";

export default function GlobalLoading() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#f6faf6] px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image alt="Aman" className="h-14 w-14 rounded-xl border border-[#dfe7df] bg-white p-1" priority src={logo} />
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#dfe7df]">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-[#006233]" />
        </div>
      </div>
    </main>
  );
}
