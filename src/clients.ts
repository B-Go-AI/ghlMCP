export interface ClientConfig {
  client_key: string;
  locationId: string;
  pit: string;
}

export const CLIENTS: Record<string, ClientConfig> = {
  "client_BG": {
    client_key: "client_BG",
    locationId: process.env.GHL_LOCATION_ID || "gMgcCQOGXIn1DK6lCDa7",
    pit: process.env.PIT_BG || "Pit-f79562d9-d6cd-4c32-bf57-8dde28fda52c"
  },
  "client_ASB Financial": {
    client_key: "client_ASB Financial",
    locationId: process.env.GHL_LOCATION_ID_ASB || "dsVEq34SgqUiiY64mdBT",
    pit: process.env.PIT_ASB || "pit-03e2ec41-db31-4f8c-94bf-ef3e878b6a65"
  },
  "client_American Senior Benefits": {
    client_key: "client_American Senior Benefits",
    locationId: process.env.GHL_LOCATION_ID_ASB || "KWhVQQQr2bwwdVWxT02i",
    pit: process.env.PIT_ASB || "Pit-33e5337d-43f5-4701-a356-495347aa4e68"
  }
}; 