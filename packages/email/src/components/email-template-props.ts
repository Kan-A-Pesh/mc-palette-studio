// Shared envelope for OTP-style email templates. Concrete template props
// extend this so each can add or tighten fields (e.g. require `host`, add
// `email`) while sharing the common shape today.
export interface OtpEmailTemplateProps {
  otp: string;
  host?: string;
  name?: string;
}
