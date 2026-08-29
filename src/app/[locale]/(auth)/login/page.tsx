import { getDictionary } from "@/i18n/dictionaries";

type LoginPageProps = {
  params: {
    locale: string;
  };
};

export default function LoginPage({ params }: LoginPageProps) {
  const dict = getDictionary(params.locale);

  return (
    <main className="mx-auto min-h-screen max-w-md p-6">
      <h1 className="text-2xl font-semibold">{dict["auth.loginTitle"]}</h1>
      <p className="mt-2 text-sm text-slate-600">{dict["auth.loginSubtitle"]}</p>
      <form className="mt-6 space-y-3">
        <input aria-label={dict["auth.username"]} className="w-full rounded border p-2" placeholder={dict["auth.username"]} />
        <input aria-label={dict["auth.password"]} className="w-full rounded border p-2" placeholder={dict["auth.password"]} type="password" />
        <button className="w-full rounded bg-slate-900 p-2 text-white" type="submit">
          {dict["auth.loginAction"]}
        </button>
      </form>
    </main>
  );
}
