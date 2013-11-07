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

    function sortBookmarkFolder(folderId) {
        chrome.bookmarks.getChildren(folderId, function (results) {
            results.sort(function (a, b) {
                return stringComparator(a.url, b.url) * 10 + stringComparator(a.title, b.title);
            });

            var idx = results.length - 1;
            for (; idx >= 0; idx--) {
                var bm = results[idx];
                chrome.bookmarks.move(bm.id, { parentId : folderId, index: 0 }, function(updatedBm) {
                    // append url to the title
                    // console.debug("we moved bookmark id: " + updatedBm.id);
                    var b = updatedBm;
                    if (updatedBm.url) {
                        var text = b.title + ' | ' + b.url;
                        chrome.bookmarks.update(b.id, { title : text });
                    }
                });
            }
        });
    }

    var EXTENSION_SORT_ACTION = "BMEXT-ACTION-SORT-BOOKMARK-BY-URL";
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
        if (info.menuItemId === EXTENSION_SORT_ACTION) {
          console.debug("action trigger on listener on page:" + JSON.stringify(info))
          var pageUrl = info.pageUrl;
          var bmFolderId = pageUrl.substring(pageUrl.lastIndexOf('#') + 1);
          sortBookmarkFolder(bmFolderId);
        } else if (info.menuItemId === EXTENSION_RECOVER_ACTION) {
          

        }
    };

    chrome.contextMenus.onClicked.addListener(cmlistener);
})();

