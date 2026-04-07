'use client';

export default function Disclaimer() {
  return (
    <div className="px-4 py-6 text-center border-t border-[#2a2a3e] bg-[#0a0a14]">
      <p className="text-[#6b6b80] text-[10px] leading-relaxed max-w-sm mx-auto">
        APEX Driver provides educational information and AI-powered guidance to help users understand automotive issues.
        This app does not replace professional mechanical inspection, diagnosis, or repair. All diagnostic suggestions
        are based on user-provided descriptions and publicly available information. Actual conditions may vary. Always
        have safety-critical systems inspected by a qualified professional before operating your vehicle. A.W.C.
        Consulting LLC is not liable for any injury, property damage, or vehicle damage resulting from actions taken
        based on information provided in this app. By using this app, you acknowledge that automotive repair involves
        inherent risks and that professional service is recommended for all repairs beyond basic maintenance. When in
        doubt, consult a professional.
      </p>
    </div>
  );
}
