function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}   

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
 function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild
}

docReady(() => {

  const links = document.querySelectorAll('link[rel="import"]')

  // Import and add each page to the DOM
  Array.prototype.forEach.call(links, async (link) => {
    let doc = await fetch(link.href, {
      headers: {
        'Content-Type': 'text/html'
      }
    })

    let content = await doc.text()
    let template = htmlToElement(content)
    console.log(template)
    let clone = document.importNode(template, true);
    console.log(clone)
    document.querySelector("#content").appendChild(clone);
  });
})

