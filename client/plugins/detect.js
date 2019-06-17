export default function () {
  // 给body添加os class用以区分字体
  var OSName = "Unknown OS";
  const el = document.body;
  if (navigator.appVersion.indexOf("Win") != -1) OSName = "windows";
  if (navigator.appVersion.indexOf("Mac") != -1) OSName = "macos";
  if (navigator.appVersion.indexOf("X11") != -1) OSName = "unix";
  if (navigator.appVersion.indexOf("Linux") != -1) OSName = "linux";
  el.classList.add('os-' + OSName);
  // console.log('Your OS is: ' + OSName);
}