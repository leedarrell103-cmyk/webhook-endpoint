// Kimi Orchestrator – receives webhook, decides next move, calls Browser-Use & Rube
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const payload = req.body;                 // from Browser-Use or manual trigger
  console.log('ORCHESTRATOR IN:', JSON.stringify(payload, null, 2));

  // 1. Forward raw payload to Kimi (this chat) for logging / reasoning
  await fetch(process.env.KIMI_THREAD_URL, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(payload)
  });

  // 2. Kimi decides next Browser-Use task (returned as JSON in response)
  const kimResp = await fetch(process.env.KIMI_THREAD_URL + '/decide', {
    method : 'POST',
    body   : JSON.stringify({ action: 'decide_next', data: payload })
  }).then(r => r.json());                   // { browserTask: "...", rubeTasks: [...] }

  // 3. If Kimi wants Browser-Use to act, send it
  if (kimResp.browserTask) {
    await fetch('https://cloud.browser-use.com/api/v1/run', {
      method : 'POST',
      headers: { 'Authorization': `Bearer ${process.env.BROWSER_USE_KEY}` },
      body   : JSON.stringify({
        task        : kimResp.browserTask,
        webhookUrl  : 'https://webhook-endpoint-kappa.vercel.app/api/index.js' // back to us
      })
    });
  }

  // 4. Fire any Rube tasks Kimi requested
  for (const t of kimResp.rubeTasks || []) {
    await fetch(`https://rube.app/mcp/actions/${t.action}/invoke`, {
      method : 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RUBE_KEY}` },
      body   : JSON.stringify(t.params)
    });
  }

  res.status(200).json({ ok: true });
}
