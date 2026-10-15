import { createElement, type ComponentType } from "react";
import { render } from "@react-email/components";
import { env } from "@repo/env/apps-web";
import { Resend } from "resend";

import TwoFactorOTPTemplate, {
  type TwoFactorOTPTemplateProps,
} from "./two-factor-otp";
import ChangeEmailTemplate, {
  type ChangeEmailTemplateProps,
} from "./change-email";
import OrganizationInvitationEmail, {
  type OrganizationInvitationEmailProps,
} from "./organization-invitation";
import ResetPasswordTemplate, {
  type ResetPasswordTemplateProps,
} from "./reset-password";
import VerifyEmailTemplate, {
  type VerifyEmailTemplateProps,
} from "./verify-email";

const resendClient = new Resend(env.RESEND_API_KEY);

const templateRegistry = {
  "2fa-otp": TwoFactorOTPTemplate,
  "change-email": ChangeEmailTemplate,
  "organization-invitation": OrganizationInvitationEmail,
  "reset-password": ResetPasswordTemplate,
  "verify-email": VerifyEmailTemplate,
};

type TemplatePropsMap = {
  "2fa-otp": TwoFactorOTPTemplateProps;
  "change-email": ChangeEmailTemplateProps;
  "organization-invitation": OrganizationInvitationEmailProps;
  "reset-password": ResetPasswordTemplateProps;
  "verify-email": VerifyEmailTemplateProps;
};

export type EmailTemplateName = keyof TemplatePropsMap;

export type EmailTemplateProps<Template extends EmailTemplateName> =
  TemplatePropsMap[Template];

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
}

export async function sendEmail<Template extends EmailTemplateName>(
  template: Template,
  props: EmailTemplateProps<Template>,
  options: SendEmailOptions,
) {
  const Component = templateRegistry[template] as ComponentType<
    EmailTemplateProps<Template>
  >;

  return resendClient.emails.send({
    from: options.from ?? env.RESEND_FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    cc: options.cc,
    bcc: options.bcc,
    replyTo: options.replyTo,
    html: await render(createElement(Component, props)),
  });
}
