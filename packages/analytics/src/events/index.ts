export type AnalyticsEventProperties = {
  user_signed_up: {
    method: "email" | "oauth";
    provider?: string;
  };
  user_signed_in: {
    method: "email" | "oauth";
    provider?: string;
  };
  user_signed_out: Record<string, never>;
  organization_created: {
    organizationId: string;
    organizationName: string;
  };
  organization_joined: {
    organizationId: string;
    organizationName: string;
    role: string;
  };
  page_viewed: {
    path: string;
    title?: string;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventProperties;

export type AnalyticsEvent<E extends AnalyticsEventName> = {
  name: E;
  properties: AnalyticsEventProperties[E];
};
