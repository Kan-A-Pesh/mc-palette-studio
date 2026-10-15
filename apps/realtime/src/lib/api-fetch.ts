import axios from "axios";
import { env } from "@/lib/env";

export const apiClient = axios.create({
  maxRedirects: 5,
});

apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = env.API_URL;
  }

  const bypassSecret = env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypassSecret) {
    config.headers.set("x-vercel-protection-bypass", bypassSecret);
  }

  return config;
});
