"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "pwa_install_dismissed";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

function isIosSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|Mercury/i.test(ua) &&
    /Safari/i.test(ua);
}

function isAndroidChrome() {
  const ua = navigator.userAgent;
  return /Android/i.test(ua) && /Chrome/i.test(ua) && !/EdgA|OPR|SamsungBrowser|CriOS/i.test(ua);
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [iosModal, setIosModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY) === "true") return;

    const iosSafari = isIosSafari();
    const androidChrome = isAndroidChrome();
    setIos(iosSafari);
    if (iosSafari) setVisible(true);

    const onBeforeInstallPrompt = (event: Event) => {
      if (!androidChrome) return;
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const dismissForever = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
    setIosModal(false);
  };

  const install = async () => {
    if (ios) {
      setIosModal(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <aside className="install-prompt" role="dialog" aria-labelledby="install-prompt-title">
        <div className="install-prompt-icon" aria-hidden="true">S</div>
        <div className="install-prompt-content">
          <h2 id="install-prompt-title">Baixe o app Studio UGC</h2>
          <p>Instale agora e receba notificações de suas vendas na tela do seu smartphone.</p>
          <div className="install-prompt-actions">
            <button className="install-prompt-button" type="button" onClick={install}>Instalar Agora</button>
            <label className="install-prompt-check"><input type="checkbox" onChange={(event) => event.target.checked && dismissForever()} /> Não mostrar novamente</label>
          </div>
        </div>
        <button className="install-prompt-close" type="button" onClick={() => setVisible(false)} aria-label="Fechar aviso"><Icon name="close" size={18} /></button>
      </aside>
      {iosModal && <div className="ios-install-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIosModal(false)}>
        <section className="ios-install-modal" role="dialog" aria-modal="true" aria-labelledby="ios-install-title">
          <button className="install-prompt-close" type="button" onClick={() => setIosModal(false)} aria-label="Fechar instruções"><Icon name="close" size={18} /></button>
          <div className="install-prompt-icon" aria-hidden="true">S</div>
          <h2 id="ios-install-title">Instalar no iPhone/iPad</h2>
          <p>Siga os passos abaixo para adicionar à sua tela de início:</p>
          <ol className="ios-install-steps">
            <li><span className="ios-step-icon ios-share-icon">↑</span><span><strong>Passo 1</strong>Toque no botão Compartilhar na barra inferior do Safari.</span></li>
            <li><span className="ios-step-icon ios-plus-icon">＋</span><span><strong>Passo 2</strong>Role para baixo e selecione Adicionar à Tela de Início.</span></li>
            <li><span className="ios-step-icon ios-add-icon">Add</span><span><strong>Passo 3</strong>Toque em Adicionar no canto superior direito.</span></li>
          </ol>
        </section>
      </div>}
    </>
  );
}
