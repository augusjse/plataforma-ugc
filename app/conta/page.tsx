import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import AccountSettings from "@/components/AccountSettings";
import { accountInitials, getCurrentAccount } from "@/lib/current-account";

type Props = { searchParams: Promise<{ visao?: string }> };

export default async function ContaPage({ searchParams }: Props) {
  const [account, params] = await Promise.all([getCurrentAccount(), searchParams]);

  if (!account) redirect("/login");

  const adminView = account.role === "admin" && params.visao !== "criadora";
  const initials = accountInitials(account.name, account.email);

  return (
    <Shell admin={adminView}>
      <div className="page-head account-page-head">
        <div>
          <p className="eyebrow">Seus dados</p>
          <h1>Minha conta</h1>
          <p>Confira as informações vinculadas ao seu acesso.</p>
        </div>
      </div>

      <AccountSettings
        account={{
          name: account.name,
          email: account.email,
          phone: account.phone,
          instagram: account.instagram,
          youtube: account.youtube,
          tiktok: account.tiktok,
          metaDiaria: account.metaDiaria,
          metaSemanal: account.metaSemanal,
          metaMensal: account.metaMensal,
          bonusDiario: account.bonusDiario,
          bonusSemanal: account.bonusSemanal,
          bonusMensal: account.bonusMensal,
          role: account.role,
          avatarUrl: account.avatarUrl,
        }}
        initials={initials}
      />
    </Shell>
  );
}
