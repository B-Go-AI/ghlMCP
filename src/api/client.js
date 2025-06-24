// src/api/client.ts
// HighLevel API client for authentication and requests
// Use the built-in fetch API from Node.js 18+
// No import needed for fetch in Node.js 18+
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
dotenv.config();
export class HighLevelApiClient {
    constructor(apiKey, baseUrl = "https://services.leadconnectorhq.com") {
        // Prefer explicit API key, then env location, then env agency
        this.apiKey =
            apiKey ||
                process.env.GHL_API_KEY_LOCATION ||
                process.env.GHL_API_KEY_AGENCY ||
                "";
        this.baseUrl = baseUrl;
    }
    /**
     * Get the correct API version header for a given endpoint
     */
    getVersionHeader(endpoint) {
        // Example: contacts endpoints require a version header
        if (endpoint.startsWith("/contacts"))
            return "2021-07-28";
        // Add more endpoint-specific version logic as needed
        return undefined;
    }
    /**
     * Make an authenticated request to the HighLevel API
     * @param endpoint API endpoint (e.g. '/contacts')
     * @param options Fetch options (method, body, etc.)
     */
    request(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, options = {}) {
            const url = `${this.baseUrl}${endpoint}`;
            const version = this.getVersionHeader(endpoint);
            // Convert options.headers to a plain object if needed
            let extraHeaders = {};
            if (options.headers) {
                if (options.headers instanceof Headers) {
                    options.headers.forEach((value, key) => {
                        extraHeaders[key] = value;
                    });
                }
                else if (Array.isArray(options.headers)) {
                    options.headers.forEach(([key, value]) => {
                        extraHeaders[key] = value;
                    });
                }
                else {
                    extraHeaders = Object.assign({}, options.headers);
                }
            }
            const headers = Object.assign(Object.assign({ Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" }, (version ? { Version: version } : {})), extraHeaders);
            try {
                const response = yield fetch(url, Object.assign(Object.assign({}, options), { headers }));
                // Handle empty response bodies gracefully
                const text = yield response.text();
                let data = {};
                if (text) {
                    try {
                        data = JSON.parse(text);
                    }
                    catch (err) {
                        return {
                            status: "error",
                            message: err instanceof Error ? err.message : String(err),
                            errors: err,
                        };
                    }
                }
                if (!data.status && response.ok)
                    data.status = "success";
                return data;
            }
            catch (err) {
                return { status: "error", message: err.message, errors: err };
            }
        });
    }
}
