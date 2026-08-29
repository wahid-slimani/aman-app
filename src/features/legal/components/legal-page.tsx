import Image from "next/image";
import logo from "@/assets/logo.png";

type Props = {
  locale: string;
  dict: Record<string, string>;
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
};

export function LegalPage({ locale, dict, title, intro, sections }: Props) {
  return (
    <main className="min-h-dvh bg-[#f7f9f7] px-4 py-6 md:px-6 md:py-8">
      <article className="mx-auto w-full max-w-4xl rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm md:p-7">
        <header>
          <Image alt={title} className="mb-3 h-10 w-10 rounded-lg border border-[#dfe7df] bg-white p-1" src={logo} />
          <h1 className="text-2xl font-semibold text-[#006233] md:text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">{intro}</p>
        </header>
        <section className="mt-6 space-y-5">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold text-[#006233]">{section.heading}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700 md:text-base">{section.body}</p>
            </div>
          ))}
        </section>
        <footer className="mt-6 border-t border-[#dfe7df] pt-4 text-sm">
          <div className="flex flex-wrap gap-3">
            <a className="font-semibold text-[#006233] underline" href={`/${locale}`}>
              {dict["nav.home"]}
            </a>
            <a className="font-semibold text-[#006233] underline" href={`/${locale}/report-issue`}>
              {dict["nav.reportIssue"]}
            </a>
          </div>
        </footer>
      </article>
    </main>
  );
}
