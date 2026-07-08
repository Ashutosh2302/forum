"use client";
import { useTranslations } from "next-intl";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  const t = useTranslations("pagination");

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← {t("previous")}
      </button>
      <span className="text-sm font-medium text-gray-700">{t("page", { page, total: totalPages })}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {t("next")} →
      </button>
    </div>
  );
}
