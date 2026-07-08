import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/components/Providers";
import DemoUserSwitcher from "@/components/DemoUserSwitcher";
import NavLinks from "@/components/NavLinks";
import Link from "next/link";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b border-gray-200 px-4 py-3 flex gap-6 items-center">
            <span className="font-bold text-indigo-600 text-lg">Forum</span>
            <NavLinks
              locale={locale}
              labels={{ course1: t("course1"), course2: t("course2"), saved: t("saved") }}
            />
            <div className="ml-auto flex items-center gap-4">
              <div className="flex gap-2 text-xs text-gray-400">
                <Link href={`/en/courses/course-1`} className={locale === "en" ? "text-indigo-600 font-medium" : "hover:text-gray-600"}>EN</Link>
                <Link href={`/es/courses/course-1`} className={locale === "es" ? "text-indigo-600 font-medium" : "hover:text-gray-600"}>ES</Link>
              </div>
              <DemoUserSwitcher />
            </div>
          </nav>
          <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
