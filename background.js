//alert(chrome.commands.onCommand.addListener);
//chrome.commands.onCommand.addListener(function () {
//    console.info("aaa");
//});

(function() {
    function stringComparator(a, b) {
        a = a || "";
        b = b || "";
        return a.localeCompare(b);
    }

    function transformTitle(b, backward) {
        var sep = ' || ',
            text = b.title;
        if (backward) {
            var idx = b.title.lastIndexOf(sep);
            if (idx > 0) {
                text = b.title.substring(idx + sep.length).trim();
                //text = b.title.substring(0, idx).trim();
            }
        } else {
            if (b.url) {
              if (text.indexOf(sep) < 0) {
                var hostPattern = new RegExp('^(?:https?://)+([^/]+).*');
                var matchResult = hostPattern.exec(b.url);
                if (matchResult) {
                    text = matchResult[1] + sep + b.title;
                }
              }
            }
        }
        return text;
    }

    function sortBookmarkFolder(folderId) {
        chrome.bookmarks.getChildren(folderId, function(results) {
            results.sort(function(a, b) {
                return stringComparator(a.url, b.url) * 10 + stringComparator(a.title, b.title);
            });

            var updateBookmarkTitle = function(updatedBm) {
                // append url to the title
                // console.debug("we moved bookmark id: " + updatedBm.id);
                chrome.bookmarks.update(updatedBm.id, {
                    title: transformTitle(updatedBm)
                });
            };

            var idx = results.length - 1;
            for (; idx >= 0; idx--) {
                var bm = results[idx];
                chrome.bookmarks.move(bm.id, {
                    parentId: folderId,
                    index: 0
                }, updateBookmarkTitle);
            }
        });
    }

    function recoverBookmarkFolder(folderId) {
        chrome.bookmarks.getChildren(folderId, function(results) {
            results.forEach(function(bm) {
                var newTitle = transformTitle(bm, true);
                if (bm.title !== newTitle) {
                    console.debug('should transform to: ' + newTitle);
                    chrome.bookmarks.update(bm.id, {
                        title: newTitle
                    });
                }
            });
        });
    }

    function removeEmptyBookmarkFolder(folderId) {
        var callback = function(results) {
            results.forEach(function(result) {
                // console.debug('' + result.id + ',' + result.title + ',' + result.url + ',' + typeof(result.children));
                // we use 'children' property to decide whether it is folder or not
                if (result.children !== undefined && result.children !== null) {
                    if (result.children.length === 0 && result.parentId !== '0') {
                        console.debug('empty folder: ' + result.title + ', parentId:' + result.parentId);
                        chrome.bookmarks.remove(result.id);
                    } else {
                        callback(result.children);
                    }
                }
            });
        };
        chrome.bookmarks.getTree(callback);
    }

    function removeDuplicateBookmark(folderId) {
        // folderId is no use here as we scan entire bookmark tree
        console.debug('start to scan duplication');
        tables = {};
        duplication = [];

        var processResults = function(results) {
            results.forEach(function(bm) {
                if (bm.url) {
                    var key = bm.url;

                    // we need to parse url to remove # fragment
                    if (key.lastIndexOf('#') >= 0) {
                        key = key.substring(0, key.lastIndexOf('#'));
                    }

                    if (key === 'https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills') {
                        console.debug('find a match !');
                    } else {
                        console.debug('url: ' + key)
                    }

                    if (tables[key]) {
                        console.debug('find duplicate of ' + tables[key] + ' is ' + bm.id);
                        console.debug(key);
                        duplication.push(bm.id);
                    } else {
                        tables[key] = bm.id;
                    }
                }
                if (bm.children) {
                    processResults(bm.children);
                }
            });
        };

        chrome.bookmarks.getTree(function(results) {
            processResults(results);
            console.debug('remove duplication, count: ' + duplication.length);

            duplication.forEach(function(id) {
                console.debug('try to remove bm: ' + id);
                chrome.bookmarks.remove(id);
            });
        });
    }



    var EXTENSION_SORT_ACTION = "BMEXT-ACTION-SORT-BOOKMARK";
    var EXTENSION_RECOVER_ACTION = "BMEXT-ACTION-RECOVER-TITLE";
    var EXTENSION_REMOVE_ACTION = "BMEXT-ACTION-REMOVE-TITLE";
    var EXTENSION_REMOVE_EMPTY_ACTION = "BMEXT-ACTION-REMOVE-EMPTY_FOLDER";

    chrome.contextMenus.create({
        id: EXTENSION_SORT_ACTION,
        type: "normal",
        title: "Sort By Url",
        //contexts : ['all'],
        documentUrlPatterns: ["chrome-extension://*/*"]
    });

    chrome.contextMenus.create({
        id: EXTENSION_RECOVER_ACTION,
        type: "normal",
        title: "Recover Title",
        documentUrlPatterns: ["chrome-extension://*/*"]
    });

    chrome.contextMenus.create({
        id: EXTENSION_REMOVE_ACTION,
        type: "normal",
        title: "Remove Duplicate",
        documentUrlPatterns: ["chrome-extension://*/*"]
    });

    chrome.contextMenus.create({
        id: EXTENSION_REMOVE_EMPTY_ACTION,
        type: "normal",
        title: "Remove Empty Folder",
        documentUrlPatterns: ["chrome-extension://*/*"]
    });

    var cmlistener = function(info, tab) {
        console.debug("action trigger on listener on page:" + JSON.stringify(info));
        var pageUrl = info.pageUrl;
        var bmFolderId = pageUrl.substring(pageUrl.lastIndexOf('#') + 1);
        switch (info.menuItemId) {
            case EXTENSION_SORT_ACTION:
                sortBookmarkFolder(bmFolderId);
                //chrome.tabs.executeScript(tab.id, { code : 'alert("haha!");' });
                //console.debug("Time: " + chrome.bookmarks.MAX_WRITE_OPERATIONS_PER_HOUR);
                //console.debug("Time: " + chrome.bookmarks.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE);
                break;
            case EXTENSION_RECOVER_ACTION:
                recoverBookmarkFolder(bmFolderId);
                break;
            case EXTENSION_REMOVE_ACTION:
                removeDuplicateBookmark(bmFolderId);
                break;
            case EXTENSION_REMOVE_EMPTY_ACTION:
                removeEmptyBookmarkFolder(bmFolderId);
                break;
        }
    };
    chrome.contextMenus.onClicked.addListener(cmlistener);
})();
