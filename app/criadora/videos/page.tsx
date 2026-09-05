import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import VideoRow from "@/components/VideoRow";
import { videos } from "@/lib/mock/creator";
export default function Videos() {
  return (
    <Shell>
      <div className="page-head">
        <div>
          <p className="eyebrow">Sua produção</p>
          <h1>Meus vídeos</h1>
          <p>Acompanhe cada etapa dos seus conteúdos.</p>
        </div>
        <span className="button button-primary">+ Enviar vídeo</span>
      </div>
      <SectionTitle icon="play">
        Todos os vídeos <span className="muted">({videos.length})</span>
      </SectionTitle>
      <div className="video-list">
        {videos.map((v) => (
          <VideoRow key={v.id} video={v} />
        ))}
      </div>
    </Shell>
  );
}
