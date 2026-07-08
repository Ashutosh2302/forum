"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  locale: string;
  labels: { course1: string; course2: string; saved: string };
};

export default function NavLinks({ locale, labels }: Props) {
  const pathname = usePathname();

  function link(href: string, label: string) {
    const active = pathname === href || pathname.startsWith(href + "?");
    return (
      <Link
        href={href}
        className={`text-sm font-medium pb-0.5 border-b-2 transition-colors ${
          active
            ? "text-indigo-600 border-indigo-600"
            : "text-gray-500 border-transparent hover:text-gray-800"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <>
      {link(`/${locale}/courses/course-1`, labels.course1)}
      {link(`/${locale}/courses/course-2`, labels.course2)}
      {link(`/${locale}/saved`, labels.saved)}
    </>
  );
}
