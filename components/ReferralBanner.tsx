"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import Icon from "./Icon";

const slides = [
  { badge: "Indique e compartilhe", title: "Convide sua mamãe, amiga ou prima", description: "Elas gravam vídeos, ganham dinheiro. Simples assim.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85", action: "share" as const },
  { badge: "Grave mais", title: "Quanto mais vídeos você grava, mais você ganha", description: "Cada vídeo novo é uma chance a mais de vender. Não pare por aqui.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85", action: "catalog" as const },
];

export default function ReferralBanner() {
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const referralLink = "https://plataforma-ugc.vercel.app/join?ref=maria-souza";

  useEffect(() => {
    // Backgrounds are CSS-driven, so explicitly warm both URLs before the
    // first rotation. This prevents a blank frame while the next slide fades in.
    slides.forEach((slide) => {
      const preload = new window.Image();
      preload.src = slide.image;
    });
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 5600);
    return () => window.clearInterval(timer);
  }, []);

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
    <section className="referral-banner" aria-roledescription="carousel" aria-label="Anúncios para criadoras">
      {slides.map((slide, index) => (
        <div className={`referral-slide${index === activeSlide ? " is-active" : ""}`} key={slide.title} style={{ "--referral-image": `url("${slide.image}")` } as CSSProperties} aria-hidden={index !== activeSlide}>
          <img className="referral-slide-image" src={slide.image} alt="" aria-hidden="true" loading="eager" decoding="async" />
          <div className="referral-copy">
            <span className="referral-badge">{slide.badge}</span>
            <h2 id={index === activeSlide ? "referral-title" : undefined}>{slide.title}</h2>
            <p>{slide.description}</p>
            {slide.action === "share" ? (
              <button className="button button-primary referral-button" type="button" onClick={shareInvite}><Icon name="arrow" size={17} />{copied ? "Link copiado!" : "Compartilhar convite"}</button>
            ) : (
              <Link className="button button-primary referral-button" href="/criadora/catalogo"><Icon name="arrow" size={17} />Ver produtos disponíveis</Link>
            )}
            {copied && slide.action === "share" && <small className="referral-feedback">Seu convite já está pronto para enviar.</small>}
          </div>
          <div className="referral-orbit" aria-hidden="true"><span>UGC</span></div>
        </div>
      ))}
      <div className="referral-indicators" aria-label="Selecionar anúncio">
        {slides.map((slide, index) => <button aria-label={`Anúncio ${index + 1}`} aria-current={index === activeSlide} className={index === activeSlide ? "is-active" : ""} key={slide.title} onClick={() => setActiveSlide(index)} type="button" />)}
      </div>
    </section>
  );
}
