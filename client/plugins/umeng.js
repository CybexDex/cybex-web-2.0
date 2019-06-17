/* eslint-disable */
import config from '~/lib/config/config.js'
export default ({ app }) => {
  /*
  ** Only run on client-side and only in production mode
  */
  // if (process.env.NODE_ENV !== 'production') return
  /*
  ** Include Umeng Script
  */
 var cnzz_protocol = (("https:" == document.location.protocol) ? "https://" : "http://");
 (function(i,s,o,g,r,a,m){i['UmengObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script',`${cnzz_protocol}s96.cnzz.com/z_stat.php?id=${config.umengID || '1277677507'}`,'umeng');
  /*
  ** Set the current page
  /*
  ** Every time the route changes (fired on initialization too)
  */
  app.router.afterEach((to, from) => {
    try {
      (window._czc || []).push(['_trackPageview', to.fullPath, from.fullPath])
    } catch (e) {
      console.log(e)
    }
  })
}