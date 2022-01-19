function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}   

docReady(() => {
  const links = document.querySelectorAll('link[rel="import"]')

  console.log(links)
  
  // Import and add each page to the DOM
  Array.prototype.forEach.call(links, (link) => {
    let template = link.import.querySelector(".task-template");
    let clone = document.importNode(template.content, true);
  
    document.querySelector(".content").appendChild(clone);
    
  });
})

