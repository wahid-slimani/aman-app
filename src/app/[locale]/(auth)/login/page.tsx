import { getDictionary } from "@/i18n/dictionaries";
import LoginForm from "@/features/authentication/components/login-form";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";

type LoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return (
    <main className="min-h-dvh bg-[#f7f9f7] px-4 py-8 md:py-12">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-[#dfe7df] bg-white p-6 shadow-sm md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <Image alt={dict["app.title"]} className="h-10 w-10 rounded-lg border border-[#dfe7df] bg-white p-1" priority src={logo} />
          <Link className="text-sm font-semibold text-[#006233] underline" href={`/${resolved.locale}`}>
            {dict["nav.home"]}
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-[#006233]">{dict["auth.loginTitle"]}</h1>
        <p className="mt-2 text-sm text-slate-600">{dict["auth.loginSubtitle"]}</p>
        <LoginForm dict={dict} locale={resolved.locale} />
      </section>
    </main>
  );
}
