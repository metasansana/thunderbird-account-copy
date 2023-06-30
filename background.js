browser.browserAction.onClicked.addListener(()=> {
  browser.tabs.create({
    url: "pages/index.html"
  })
});
