import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {GoogleGenAI} from '@google/genai';

function nervesApiPlugin() {
  return {
    name: 'nerves-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/gemini/situation-report' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured', fallback: true }));
                return;
              }
              const ai = new GoogleGenAI({ apiKey });
              const prompt = `You are the NERVES AI Logistics & Accessibility Intelligence Officer for the North Eastern Region of India (SIH26002).
Current Scenario: ${data.scenario || 'Operational'}
Weather: ${data.weather || 'Variable'}
Active Incidents: ${data.incidentCount || 0}
Blocked Corridors: ${data.blockedCorridors?.join(', ') || 'None'}
Affected Vehicles: ${data.affectedVehicles?.map((v: any) => `${v.id} (${v.cargo})`).join(', ') || 'None'}
Critical Shortages: ${data.criticalSupplies?.join(', ') || 'None'}

Generate a professional, concise, actionable NER Emergency Operations Logistics Situation Report.
Structure:
1. EXECUTIVE LOGISTICS SITUATION SUMMARY (2-3 sentences)
2. CRITICAL BOTTLENECK & ACCESSIBILITY IMPACTS (Corridors, vehicles, delay risks)
3. IMMEDIATE OPERATIONAL DIRECTIVES (Hold / Reroute / Safe Staging / Air Support recommendations)
4. SUPPLY CHAIN CONTINUITY DIRECTIVES (Focusing on life-saving medicines and relief goods)

Keep the tone authoritative, clear, and focused on accessibility risk rather than certainty.`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ report: response.text, fallback: false }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message, fallback: true }));
            }
          });
          return;
        }

        if (req.url === '/api/gemini/assistant' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured', fallback: true }));
                return;
              }
              const ai = new GoogleGenAI({ apiKey });
              const prompt = `You are NERVES Assistant, the intelligent accessibility & logistics advisor for India's North Eastern Region.
Context:
Scenario: ${data.scenario}
Blocked Roads: ${data.blockedCorridors?.join(', ') || 'None'}
Delayed Vehicles: ${data.delayedVehicles?.join(', ') || 'None'}
User Question: "${data.query}"

Provide a direct, helpful, concise answer based on NER logistics principles: "We don't just navigate roads — we predict their accessibility". Never claim certainty about landslides; use disruption risk estimation. If alternate routes are blocked or risky, emphasize Safe Staging Points or holding movement.`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ answer: response.text, fallback: false }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message, fallback: true }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), nervesApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
