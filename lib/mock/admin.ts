import { sales, videos } from "./creator";

const creatorVideoIds: Record<string, string[]> = {
  "Maria Souza": ["v1", "v2", "v3", "v4"],
  "Ana Clara": [],
  "Bia Martins": [],
};

export const creators = Object.entries(creatorVideoIds).map(([name, ids]) => ({
  name,
  handle:
    name === "Maria Souza"
      ? "@mariacria"
      : name === "Ana Clara"
        ? "@anaclara"
        : "@biamartins",
  videos: ids.length,
  activeWindows: ids.filter(
    (id) => videos.find((video) => video.id === id)?.janela_status === "ativa",
  ).length,
  sales: sales
    .filter((sale) => ids.includes(sale.videoId))
    .reduce((sum, sale) => sum + sale.quantity, 0),
  commission: Number(
    sales
      .filter((sale) => ids.includes(sale.videoId))
      .reduce((sum, sale) => sum + sale.creatorCommission, 0)
      .toFixed(2),
  ),
  initials: name
    .split(" ")
    .map((part) => part[0])
    .join(""),
}));

export const pending = [
  {
    id: "v4",
    creator: "Ana Clara",
    product: "Luminária LED para vídeos",
    title: "Minha luz mudou tudo",
    time: "há 32 min",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "v5",
    creator: "Bia Martins",
    product: "Kit organizador de maquiagem",
    title: "Antes e depois da gaveta",
    time: "há 1 hora",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
  },
];
