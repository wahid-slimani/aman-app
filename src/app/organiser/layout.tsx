import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

type OrganiserLayoutProps = {
  children: ReactNode;
};

export default function OrganiserLayout({ children }: OrganiserLayoutProps) {
  return <section id="organiser-shell">{children}</section>;
}
