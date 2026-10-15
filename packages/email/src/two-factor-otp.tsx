import { PROJECT } from "@repo/env/constants";

import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";
import { OtpDisplay } from "./components/otp-display";
import type { OtpEmailTemplateProps } from "./components/email-template-props";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- distinct named type sharing the OTP email envelope; fields may diverge later
export interface TwoFactorOTPTemplateProps extends OtpEmailTemplateProps {}

export default function TwoFactorOtp({
  otp,
  host = PROJECT.DOMAIN,
  name,
}: TwoFactorOTPTemplateProps) {
  return (
    <EmailLayout previewText={`Your temporary password for ${host}`}>
      <div className="mb-6 flex w-full items-center justify-center">
        <Logomark className="h-8 text-white" />
      </div>

      <Card>
        <EmailHeading>{name ? `Hi ${name},` : "Hi there,"}</EmailHeading>

        <EmailText>
          {
            "Copy over your temporary password or use the automatic sign in button."
          }
        </EmailText>

        <EmailButton href={`https://${host}/login?code=${otp}`}>
          {"Sign In"}
        </EmailButton>

        <EmailText>
          {"Your temporary password is "}
          <strong>{"valid for one hour."}</strong>
        </EmailText>

        <OtpDisplay otp={otp} />

        <EmailText>
          {"Thanks,"}
          <br />
          {`The ${PROJECT.COMPANY} Team`}
        </EmailText>
      </Card>

      <EmailFooter />
    </EmailLayout>
  );
}

TwoFactorOtp.PreviewProps = {
  otp: "123456",
  host: PROJECT.DOMAIN,
  name: "Leonard",
} as TwoFactorOTPTemplateProps;
