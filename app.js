// Stable loader: start the cat animation layer directly, then run the existing app logic and cozy world features.
// Versioned imports keep iPhone Safari/PWA caches from pinning older behavior.
import('./cat-anim.js?v=22').catch(err=>console.error('cat-anim load failed',err));
import('./app-core.js?v=22').catch(err=>console.error('app-core load failed',err));
import('./cozy-world.js?v=1').catch(err=>console.error('cozy-world load failed',err));
import('./cat-moments.js?v=1').catch(err=>console.error('cat-moments load failed',err));
