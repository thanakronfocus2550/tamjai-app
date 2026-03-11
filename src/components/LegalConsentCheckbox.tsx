"use client";

import React from "react";
import Link from "next/link";

interface LegalConsentCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const LegalConsentCheckbox: React.FC<LegalConsentCheckboxProps> = ({ checked, onChange }) => {
    return (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-brand-orange/30 transition-all group">
            <div className="flex items-center h-5">
                <input
                    id="legal-consent"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange cursor-pointer transition-colors"
                />
            </div>
            <label htmlFor="legal-consent" className="text-xs font-medium text-gray-500 leading-relaxed cursor-pointer select-none">
                ฉันได้อ่านและยอมรับ{" "}
                <Link
                    href="/privacy"
                    target="_blank"
                    className="text-brand-orange font-bold hover:underline transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    นโยบายความเป็นส่วนตัว
                </Link>
                {" "}และ{" "}
                <Link
                    href="/terms"
                    target="_blank"
                    className="text-brand-orange font-bold hover:underline transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    ข้อกำหนดและเงื่อนไขการใช้บริการ
                </Link>
            </label>
        </div>
    );
};

export default LegalConsentCheckbox;
