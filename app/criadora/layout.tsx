import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/current-account";

export default async function CriadoraLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const account = await getCurrentAccount();

  if (!account) redirect("/login");
  if (account.role !== "criadora" && account.role !== "admin") redirect("/login");

  return children;
}
