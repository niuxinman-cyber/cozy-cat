// Stable loader: prepare the daily word plan first, then run the existing app logic and UI layers.
// Versioned imports keep iPhone Safari/PWA caches from pinning older behavior.
(async()=>{
  try{await import('./cat-anim.js?v=22')}catch(err){console.error('cat-anim load failed',err)}
  try{await import('./study-prep.js?v=1')}catch(err){console.error('study-prep load failed',err)}
  try{await import('./app-core.js?v=25')}catch(err){console.error('app-core load failed',err)}
  import('./study-library.js?v=1').catch(err=>console.error('study-library load failed',err));
  import('./cozy-world.js?v=2').catch(err=>console.error('cozy-world load failed',err));
  import('./cat-moments.js?v=1').catch(err=>console.error('cat-moments load failed',err));
})();
