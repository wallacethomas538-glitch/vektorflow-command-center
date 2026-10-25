/* VektorFlow Command Center — backend configuration.
 * Single source of truth for the real VektorFlow backend.
 * Do NOT point this at anything else; no second backend, no mocks.
 */
const VEKTORFLOW_API_URL = "https://vektorflow-15xr-1.onrender.com";

/* Local Hermes agent dashboard (NousResearch Hermes Agent).
 * Runs on the SAME phone as this command center at 127.0.0.1:9119.
 * Reachable only when the dashboard is started locally (`hermes dashboard`
 * in Termux) and this page is opened on that same phone. No backend proxy.
 */
const HERMES_URL = "http://127.0.0.1:9119";
