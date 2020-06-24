'use strict';

const nwordTextToMask = 'igg|ig\\(g\\)',
      nwordEndings = '(a(?!rd).*?|er.*?|u[hrsz].*?)',
      nwordPattern = "\\b([nN])(" + nwordTextToMask + ")" + nwordEndings + "\\b",
      nwordRegex = new RegExp(nwordPattern, "gi"),
      TEXTNODE = 3;


function findAndUpdateTextNodes() {
    document.querySelectorAll('*').forEach(function(node) {
        node.childNodes.forEach(childNode => {
            if(childNode.nodeType === TEXTNODE) {
                const value = childNode.nodeValue;
                if (nwordRegex.test(value)) {
                    childNode.nodeValue = getRedactedValue(value);
                }
            }
        });
    });
}


function getRedactedValue (value) {
    return value.replace(nwordRegex, '$1+++$3');
}


window.onload = findAndUpdateTextNodes();
