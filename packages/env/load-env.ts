import { config } from "dotenv";

config({ path: [".env", ".env.local", "../../.env", "../../.env.local"] });
