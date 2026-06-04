import { app, initDB } from '../server.js';

// Initialiser la DB — on log l'erreur exacte si ça échoue
initDB()
  .then(() => console.log('[api] DB init OK'))
  .catch((e: any) => console.error('[api] DB init FAILED:', e.message, e.code, e.stack));

export default app;
