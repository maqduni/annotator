"use strict";

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var $ = window.$ || window.jQuery;

var Util = {};

// Public: DOM Node type identifiers. These are exposed on the Node global in
// most browsers, but (surprise, surprise) not in IE.
Util.NodeTypes = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
};

// Public: determine the first text node in or after the given jQuery node.
Util.getFirstTextNodeNotBefore = function(n) {
    switch (n.nodeType) {
        case Util.NodeTypes.TEXT_NODE:
            return n; // We have found our text node.
            break;
        case Util.NodeTypes.ELEMENT_NODE:
            // This is an element, we need to dig in
            if (n.firstChild != null) {
                // Does it have children at all?
                var result = Util.getFirstTextNodeNotBefore(n.firstChild);
                if (result != null) {
                    return result;
                }
            }
            break;
        default:
    }
    // Not a text or an element node.
    // Could not find a text node in current node, go forward
    n = n.nextSibling;
    if (n != null) {
        return Util.getFirstTextNodeNotBefore(n);
    } else {
        return null;
    }
};

// Public: determine the last text node inside or before the given node
Util.getLastTextNodeUpTo = function(n) {
    switch (n.nodeType) {
        case Util.NodeTypes.TEXT_NODE:
            return n; // We have found our text node.
            break;
        case Util.NodeTypes.ELEMENT_NODE:
            // This is an element, we need to dig in
            if (n.lastChild != null) {
                // Does it have children at all?
                var result = Util.getLastTextNodeUpTo(n.lastChild);
                if (result != null) {
                    return result;
                }
            }
            break;
        default:
    }
    // Not a text node, and not an element node.
    // Could not find a text node in current node, go backwards
    n = n.previousSibling;
    if (n != null) {
        return Util.getLastTextNodeUpTo(n);
    } else {
        return null;
    }
};

// Public: Finds all text nodes within the elements in the current collection.
//
// Returns a new jQuery collection of text nodes.
Util.getTextNodes = function(jq) {
    var getTextNodes = function getTextNodes(node) {
        if (node && node.nodeType !== Util.NodeTypes.TEXT_NODE) {
            var nodes = [];

            // If not a comment then traverse children collecting text nodes.
            // We traverse the child nodes manually rather than using the .childNodes
            // property because IE9 does not update the .childNodes property after
            // .splitText() is called on a child text node.
            if (node.nodeType !== Util.NodeTypes.COMMENT_NODE) {
                // Start at the last child and walk backwards through siblings.
                node = node.lastChild;
                while (node) {
                    nodes.push(getTextNodes(node));
                    node = node.previousSibling;
                }
            }

            // Finally reverse the array so that nodes are in the correct order.
            return nodes.reverse();
        } else {
            return node;
        }
    };

    return jq.map(function() {
        return Util.flatten(getTextNodes(this));
    });
};

Util.getGlobal = function() {
    return (function() {
        return this;
    })();
};

// Public: decides whether node A is an ancestor of node B.
//
// This function purposefully ignores the native browser function for this,
// because it acts weird in PhantomJS.
// Issue: https://github.com/ariya/phantomjs/issues/11479
Util.contains = function(parent, child) {
    var node = child;
    while (node != null) {
        if (node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

// Public: Flatten a nested array structure
//
// Returns an array
Util.flatten = function(array) {
    var flatten = function flatten(ary) {
        var flat = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (
                var _iterator = Array.from(ary)[Symbol.iterator](), _step;
                !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                _iteratorNormalCompletion = true
            ) {
                var el = _step.value;

                flat = flat.concat(el && $.isArray(el) ? flatten(el) : el);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return flat;
    };

    return flatten(array);
};

// Export Util object
module.exports = Util;
