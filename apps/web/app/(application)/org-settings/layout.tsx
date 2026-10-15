import { OrgSettingsShell } from "./_components/org-settings-shell";

export default function OrgSettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OrgSettingsShell>{children}</OrgSettingsShell>;
}
