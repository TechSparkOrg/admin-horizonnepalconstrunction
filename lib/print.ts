export function printHtml(html: string, timeout = 1000) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:0;left:-100vw;width:210mm;height:297mm;border:0";
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), timeout);
  };
  iframe.srcdoc = html;
}
