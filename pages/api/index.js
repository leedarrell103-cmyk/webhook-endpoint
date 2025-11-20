// /pages/api/index.js
export const config = {
  api: {
    bodyParser: true, // Explicitly enable JSON parsing
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the request body
  const body = req.body;
  
  // Log the incoming webhook data
  console.log('Webhook received:');
  console.log(JSON.stringify(body, null, 2));

  // Forward to Kimi if URL is configured
  const kimiUrl = process.env.KIMI_THREAD_URL;
  
  if (kimiUrl) {
    try {
      const response = await fetch(kimiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      console.log(`Forwarded to Kimi: ${response.status}`);
    } catch (error) {
      console.error('Failed to forward to Kimi:', error.message);
    }
  } else {
    console.log('KIMI_THREAD_URL not configured, skipping forward');
  }

  // Respond with success
  res.status(200).json({ received: true });
}
