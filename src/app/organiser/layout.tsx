import type { ReactNode } from "react";

type OrganiserLayoutProps = {
  children: ReactNode;
};

export default function OrganiserLayout({ children }: OrganiserLayoutProps) {
  return <section id="organiser-shell">{children}</section>;
}
