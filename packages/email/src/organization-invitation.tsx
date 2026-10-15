import { PROJECT } from "@repo/env/constants";

import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

export interface OrganizationInvitationEmailProps {
  email: string;
  organization: string;
  inviter: {
    name: string;
    email: string;
  };
  url: string;
  host: string;
}

export default function OrganizationInvitation({
  organization,
  inviter,
  url,
  host,
}: OrganizationInvitationEmailProps) {
  return (
    <EmailLayout
      previewText={`You're invited to join ${organization} on ${host}`}
    >
      <div className="mb-6 flex w-full items-center justify-center">
        <Logomark className="h-8 text-white" />
      </div>

      <Card>
        <EmailHeading>
          You&apos;re invited to join {organization} on {host}
        </EmailHeading>

        <EmailText>
          {inviter?.name} <span className="opacity-50">({inviter?.email})</span>{" "}
          has invited you to join {organization} on {host}.
        </EmailText>

        <EmailButton href={url}>Accept invitation</EmailButton>

        <EmailText>
          If you weren&apos;t expecting this invitation or don&apos;t want to
          join, you can safely ignore this email.
        </EmailText>

        <EmailText>
          Best,
          <br />
          The {host} Team
        </EmailText>
      </Card>

      <EmailFooter>{host}</EmailFooter>
    </EmailLayout>
  );
}

OrganizationInvitation.PreviewProps = {
  organization: "Acme Inc",
  inviter: {
    name: "John Doe",
    email: "john@example.com",
  },
  url: "https://example.com/accept-invite",
  host: PROJECT.DOMAIN,
} as OrganizationInvitationEmailProps;
