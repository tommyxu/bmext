$(function() {
    function outputBookmark(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            console.debug(nodes[i].id + ":" + nodes[i].title);
            if (nodes[i].children) {
                outputBookmark(nodes[i].children);
            }
        }
    }

    document.getElementById('sortButton').addEventListener('click', function() {
        //alert('yes');
        //#alert(console);
        //console.debug('yes');
        chrome.bookmarks.create({
            parentId: "1",
            title: 'google.com',
            url: 'https://www.google.com'
        });
        chrome.bookmarks.getTree(function(nodes) {
            outputBookmark(nodes);
        });
    });

    $('#settingsBtn').on('click', function() {
        alert('settings');
    });

    /*
    $(chrome.commands).on('command', function() {
        alert('action triggered');
    });
*/

});

/*
function run() {
    $('#sortButton').on('click', function() {
        alert(chrome.bookmark);
    }
}
$(run);
*/
