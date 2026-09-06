import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/current-account";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const account = await getCurrentAccount();

  if (!account) redirect("/login");
  if (account.role !== "admin") redirect("/criadora");

  return children;
}
