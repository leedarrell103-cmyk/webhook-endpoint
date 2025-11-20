module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the current timestamp
  const timestamp = new Date().toISOString();

  // Log request details
  const webhookData = {
    timestamp: timestamp,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
    url: req.url
  };

  console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

  // Respond with success
  res.status(200).json({
    success: true,
    message: 'Webhook received successfully',
    timestamp: timestamp,
    received: {
      method: req.method,
      headers: req.headers,
      body: req.body
    }
  });
};