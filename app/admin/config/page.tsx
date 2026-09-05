import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import DistributionSettings from "@/components/DistributionSettings";

export default function Config() {
  return (
    <Shell admin>
      <div className="page-head">
        <div>
          <p className="eyebrow">Configuração financeira</p>
          <h1>Simular distribuição</h1>
          <p>Teste repasses e custo de anúncio para entender sua margem.</p>
        </div>
      </div>
      <SectionTitle icon="settings">Percentuais e custos</SectionTitle>
      <DistributionSettings />
    </Shell>
  );
}
