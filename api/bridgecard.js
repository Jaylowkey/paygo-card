import AES256 from 'aes-everywhere';

const BASE = {
  sandbox: 'https://issuecards.api.bridgecard.co/v1/issuing/sandbox',
  production: 'https://issuecards.api.bridgecard.co/v1/issuing'
};

const json = (body, status = 200) => ({
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

function credentials(env) {
  const token = env === 'production' ? process.env.BRIDGECARD_LIVE_TOKEN : process.env.BRIDGECARD_TEST_TOKEN;
  const secret = env === 'production' ? process.env.BRIDGECARD_LIVE_SECRET : process.env.BRIDGECARD_TEST_SECRET;
  return { token, secret };
}

export default async function handler(req, res) {
  const started = Date.now();
  try {
    const env = req.query.env === 'production' ? 'production' : 'sandbox';
    const action = req.query.action || 'health';
    const { token, secret } = credentials(env);

    if (!token) return res.status(500).json({ status: 'error', message: `Missing ${env} Bridgecard token` });

    const base = BASE[env];
    let method = 'GET';
    let path = '';
    let body;

    if (action === 'health') {
      path = '/cards/get_all_cards?page=1';
    } else if (action === 'cardholders') {
      path = `/cards/get_all_cardholder?page=${encodeURIComponent(req.query.page || '1')}`;
    } else if (action === 'cards') {
      path = `/cards/get_all_cards?page=${encodeURIComponent(req.query.page || '1')}`;
    } else if (action === 'card-details') {
      path = `/cards/get_card_details?card_id=${encodeURIComponent(req.query.card_id || '')}`;
    } else if (action === 'card-balance') {
      path = `/cards/get_card_balance?card_id=${encodeURIComponent(req.query.card_id || '')}`;
    } else if (action === 'card-transactions') {
      path = `/cards/get_card_transactions?card_id=${encodeURIComponent(req.query.card_id || '')}&page=${encodeURIComponent(req.query.page || '1')}`;
    } else if (action === 'register-cardholder') {
      method = 'POST';
      path = '/cardholder/register_cardholder_synchronously';
      body = req.body || {};
    } else if (action === 'create-card') {
      method = 'POST';
      path = '/cards/create_card';
      body = { ...(req.body || {}) };
      if (body.pin && secret) body.pin = AES256.encrypt(String(body.pin), secret).toString();
    } else if (action === 'fund-card') {
      method = 'POST';
      path = '/cards/fund_card';
      body = req.body || {};
    } else if (action === 'unload-card') {
      method = 'POST';
      path = '/cards/unload_card';
      body = req.body || {};
    } else if (action === 'freeze-card') {
      method = 'POST';
      path = '/cards/freeze_card';
      body = req.body || {};
    } else if (action === 'unfreeze-card') {
      method = 'POST';
      path = '/cards/unfreeze_card';
      body = req.body || {};
    } else {
      return res.status(400).json({ status: 'error', message: 'Unknown action' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), action === 'register-cardholder' ? 50000 : 30000);

    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        token: `Bearer ${token}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      ...(method !== 'GET' ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(response.status).json({
      status: response.ok ? 'success' : 'error',
      environment: env,
      action,
      http_status: response.status,
      duration_ms: Date.now() - started,
      data
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.name === 'AbortError' ? 'Bridgecard request timed out' : error.message,
      duration_ms: Date.now() - started
    });
  }
}
