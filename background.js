//alert(chrome.commands.onCommand.addListener);
chrome.commands.onCommand.addListener(function () {
//    console.info("aaa");
});

(function () {
    function stringComparator(a, b) {
        a = a || "";
        b = b || "";
        return a.localeCompare(b);
    }

    function transformTitle(b, backward) {
        var sep = ' || ';
        var text = b.title;
        if (backward) {
            var idx = b.title.lastIndexOf(sep);
            if (idx > 0) {
              text = b.title.substring(idx + sep.length).trim();
              //text = b.title.substring(0, idx).trim();
            }
        } else {
            if (b.url) {
              var hostPattern = new RegExp('^(?:https?://)+([^/]+).*');
              var matchResult = hostPattern.exec(b.url);
              if (matchResult) {
                  text = matchResult[1] + sep + b.title;
              }
            }
        }
        return text;
    }

    function sortBookmarkFolder(folderId) {
        chrome.bookmarks.getChildren(folderId, function (results) {
            results.sort(function (a, b) {
                return stringComparator(a.url, b.url) * 10 + stringComparator(a.title, b.title);
            });

            var updateBookmarkTitle = function(updatedBm) {
                    // append url to the title
                    // console.debug("we moved bookmark id: " + updatedBm.id);
                    chrome.bookmarks.update(updatedBm.id, { title : transformTitle(updatedBm) });
            };

            var idx = results.length - 1;
            for (; idx >= 0; idx--) {
                var bm = results[idx];
                chrome.bookmarks.move(bm.id, { parentId : folderId, index: 0 }, updateBookmarkTitle);
            }
        });
    }

    function recoverBookmarkFolder(folderId) {
        chrome.bookmarks.getChildren(folderId, function (results) {
            results.forEach(function (bm) {
                var newTitle = transformTitle(bm, true);
                if (bm.title !== newTitle) {
                  console.debug('should transform to: ' + newTitle);
                  chrome.bookmarks.update(bm.id, { title : newTitle });
                }
            });
        });
    }

    var EXTENSION_SORT_ACTION = "BMEXT-ACTION-SORT-BOOKMARK";
    var EXTENSION_RECOVER_ACTION = "BMEXT-ACTION-RECOVER-TITLE";

    chrome.contextMenus.create({
        id : EXTENSION_SORT_ACTION,
        type : "normal",
        title : "Sort By Url",
        //contexts : ['all'],
        documentUrlPatterns : ["chrome-extension://*/*"]
    });

    chrome.contextMenus.create({
        id : EXTENSION_RECOVER_ACTION,
        type : "normal",
        title : "Recover Title",
        //contexts : ['all'],
        documentUrlPatterns : ["chrome-extension://*/*"]
    });

    var cmlistener = function(info, tab) {
        console.debug("action trigger on listener on page:" + JSON.stringify(info));
        var pageUrl = info.pageUrl;
        var bmFolderId = pageUrl.substring(pageUrl.lastIndexOf('#') + 1);
        if (info.menuItemId === EXTENSION_SORT_ACTION) {
          //sortBookmarkFolder(bmFolderId);
          //chrome.tabs.executeScript(tab.id, { code : 'alert("haha!");' });
          console.debug("Time: " + chrome.bookmarks.MAX_WRITE_OPERATIONS_PER_HOUR);
          console.debug("Time: " + chrome.bookmarks.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE);
        } else if (info.menuItemId === EXTENSION_RECOVER_ACTION) {
          recoverBookmarkFolder(bmFolderId);
        }
    };
    chrome.contextMenus.onClicked.addListener(cmlistener);
})();

