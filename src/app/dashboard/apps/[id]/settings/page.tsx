import { redirect } from "next/navigation";

export default function SettingsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return redirect(`/dashboard/apps/${id}/settings/storages`);
}
