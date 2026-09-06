"use client";

import Icon from "./Icon";
import { useEffect, useState, type CSSProperties } from "react";

type Props = { eyebrow: string; title: string; image: string; action: string };

export default function PromoCard({ eyebrow, title, image, action }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { title, image },
    { title: "Compartilhe o Studio com quem cria conteúdo", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80" },
  ];
  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 5600);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  return (
    <div className="promo-card" aria-roledescription="carousel" aria-label={eyebrow}>
      {slides.map((slide, index) => <div className={`promo-slide${index === activeSlide ? " is-active" : ""}`} key={slide.title} style={{ "--promo-image": `url("${slide.image}")` } as CSSProperties} aria-hidden={index !== activeSlide}>
        <span className="promo-warmth" />
        <span className="promo-badge">{eyebrow}</span>
        <div className="promo-content">
          <strong>{slide.title}</strong>
          <span className="promo-subtitle">Conteúdo que pode virar resultado.</span>
          <button className="promo-button"><Icon name="arrow" size={16} />{action}</button>
        </div>
      </div>)}
      <div className="promo-indicators" aria-label="Selecionar destaque">{slides.map((slide, index) => <button key={slide.title} type="button" aria-label={`Destaque ${index + 1}`} aria-current={index === activeSlide} className={index === activeSlide ? "is-active" : ""} onClick={() => setActiveSlide(index)} />)}</div>
    </div>
  );
}
