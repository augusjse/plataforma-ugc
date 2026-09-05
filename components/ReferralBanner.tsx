"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function ReferralBanner() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://plataforma-ugc.vercel.app/join?ref=maria-souza";

  async function shareInvite() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Vem criar com o Studio UGC",
          text: "Grave vídeos de produtos que você usa e ganhe dinheiro.",
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Cancelar o compartilhamento não deve alterar o estado do banner.
    }
  }

  return (
    <section className="referral-banner" aria-labelledby="referral-title">
      <div className="referral-copy">
        <span className="referral-badge">Indique e compartilhe</span>
        <h2 id="referral-title">Convide sua mamãe, amiga ou prima</h2>
        <p>Elas gravam vídeos, ganham dinheiro. Simples assim.</p>
        <button className="button button-primary referral-button" type="button" onClick={shareInvite}>
          <Icon name="arrow" size={17} />
          {copied ? "Link copiado!" : "Compartilhar convite"}
        </button>
        {copied && <small className="referral-feedback">Seu convite já está pronto para enviar.</small>}
      </div>
      <div className="referral-orbit" aria-hidden="true"><span>UGC</span></div>
    </section>
  );
}
