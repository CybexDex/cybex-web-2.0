/* eslint-disable */
import appconfig from '~/lib/config/config.js'
export default ({ app }) => {
    window.rawlog = console.log;
    if (appconfig.log_ignore){
        console.log('plugin log')
        var _privateLog = console.log;
        // Redefine console.log method with a custom function
        console.log = function (message) {
            // _privateLog.apply(console, arguments);
            if (window.islog == true){
              _privateLog.apply(console, arguments);
            }else{
    
            }
        };
        console.log('cannot see')
    }
}