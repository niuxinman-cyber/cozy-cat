// Stable loader: start the cat animation layer directly, then run the existing app logic.
// Keeping this explicit avoids relying on Service Worker injection timing.
import('./cat-anim.js').catch(err=>console.error('cat-anim load failed',err));
import('./app-core.js').catch(err=>console.error('app-core load failed',err));
