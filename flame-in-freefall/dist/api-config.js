// Public service URL only. Google credentials remain on the backend.
// Local development continues to use its same-origin Node server.
window.SEVENOAKS_API_BASE = location.hostname === '7oaksspaceapps.vercel.app'
  ? 'https://sevenoaks-assistant-722619489579.europe-west2.run.app'
  : '';
