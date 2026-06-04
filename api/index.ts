import { app, initDB } from '../server.js';

// Initialiser la DB au démarrage de la fonction Vercel
initDB().catch(console.error);

export default app;
