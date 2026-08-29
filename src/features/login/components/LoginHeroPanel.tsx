import logoImg from "figma:asset/19603bc35fe7f283ff1a83c590f928c9d0bfe9cf.png";
import { Sparkles } from "lucide-react";
import { ImageWithFallback } from "../../../app/components/figma/ImageWithFallback";
import { PeractCard } from "../../../shared/components/peract-card";
import { PERFUME_BG } from "../config/demoAccounts";

export function LoginHeroPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-[55%]">
      <ImageWithFallback src={PERFUME_BG} alt="Canal Perfumado Decants" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(255,255,255,0) 60%, rgba(255,255,255,0.35) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(247,247,246,0.45) 0%, transparent 40%)" }} />
      <div className="relative z-10 flex w-full flex-col justify-between p-10">
        <div className="self-start rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Canal Perfumado" className="h-10 w-10 rounded-full border-2 object-cover shadow" style={{ borderColor: "#c29958" }} />
            <div>
              <p className="peract-serif-font text-sm leading-tight text-[#1a1a1a]">Canal Perfumado</p>
              <p className="peract-font-color-accent text-xs tracking-[0.12em]">DECANTS</p>
            </div>
          </div>
        </div>
        <PeractCard className="px-5 py-5" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(10px)" }}>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #c29958, transparent)" }} />
            <Sparkles size={13} style={{ color: "#c29958" }} />
          </div>
          <h2 className="peract-serif-font mb-3 text-[2rem] font-normal leading-[1.2] text-[#1a1a1a] tracking-[0.02em]">
            Gestão com a<br />
            <span className="peract-font-color-accent">elegância</span> que<br />
            sua marca merece.
          </h2>
          <p className="peract-font-weight-medium text-sm tracking-[0.08em] text-[#6b6b68]">SISTEMA DE GESTÃO LOGÍSTICA</p>
        </PeractCard>
      </div>
    </div>
  );
}