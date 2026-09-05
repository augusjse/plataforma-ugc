import Icon from "./Icon";

type Props = { eyebrow: string; title: string; image: string; action: string };

export default function PromoCard({ eyebrow, title, image, action }: Props) {
  return (
    <div className="promo-card">
      <img src={image} alt="" aria-hidden="true" />
      <span className="promo-warmth" />
      <span className="promo-badge">{eyebrow}</span>
      <div className="promo-content">
        <strong>{title}</strong>
        <span className="promo-subtitle">
          Conteúdo que pode virar resultado.
        </span>
        <button className="promo-button">
          <Icon name="arrow" size={16} />
          {action}
        </button>
      </div>
    </div>
  );
}
