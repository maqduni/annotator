"use strict";

var _slicedToArray = (function() {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
            for (
                var _i = arr[Symbol.iterator](), _s;
                !(_n = (_s = _i.next()).done);
                _n = true
            ) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }
    return function(arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError(
                "Invalid attempt to destructure non-iterable instance"
            );
        }
    };
})();

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var $ = window.$ || window.jQuery;
var Util = require("./util");

var evaluateXPath = function evaluateXPath(xp, root) {
    var nsResolver =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (root == null) {
        root = document;
    }
    try {
        return document.evaluate(
            "." + xp,
            root,
            nsResolver,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
    } catch (exception) {
        // There are cases when the evaluation fails, because the HTML documents
        // contains nodes with invalid names, for example tags with equal signs in
        // them, or something like that. In these cases, the XPath expressions will
        // have these abominations, too, and then they can not be evaluated. In these
        // cases, we get an XPathException, with error code 52. See
        // http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathException This does
        // not necessarily make any sense, but this what we see happening.
        //
        // This is an 'evaluator' that should work for the simple expressions we
        // generate.
        var steps = xp.substring(1).split("/");
        var node = root;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (
                var _iterator = Array.from(steps)[Symbol.iterator](), _step;
                !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                _iteratorNormalCompletion = true
            ) {
                var step = _step.value;

                var _Array$from = Array.from(step.split("[")),
                    _Array$from2 = _slicedToArray(_Array$from, 2),
                    name = _Array$from2[0],
                    idx = _Array$from2[1];

                idx =
                    idx != null
                        ? parseInt((idx != null ? idx.split("]") : undefined)[0])
                        : 1;
                node = findChild(node, name.toLowerCase(), idx);
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

        return node;
    }
};

// Get xpath strings to the provided nodes relative to the provided root
//
// relativeRoot - A jQuery object of the nodes whose xpaths are requested.
//
// Returns Array[String]
var simpleXPathJQuery = function simpleXPathJQuery($el, relativeRoot) {
    var jq = $el.map(function() {
        var path = "";
        var elem = this;

        while (
            (elem != null ? elem.nodeType : undefined) ===
            Util.NodeTypes.ELEMENT_NODE &&
            elem !== relativeRoot
            ) {
            var tagName = elem.tagName.replace(":", "\\:");
            var idx =
                $(elem.parentNode)
                    .children(tagName)
                    .index(elem) + 1;

            idx = "[" + idx + "]";
            path = "/" + elem.tagName.toLowerCase() + idx + path;
            elem = elem.parentNode;
        }

        return path;
    });

    return jq.get();
};

// Get xpath strings to the provided nodes relative to the provided root
//
// relativeRoot - A jQuery object of the nodes whose xpaths are requested.
//
// Returns Array[String]
var simpleXPathPure = function simpleXPathPure($el, relativeRoot) {
    var getPathSegment = function getPathSegment(node) {
        var name = getNodeName(node);
        var pos = getNodePosition(node);
        return name + "[" + pos + "]";
    };

    var rootNode = relativeRoot;

    var getPathTo = function getPathTo(node) {
        var xpath = "";
        while (node !== rootNode) {
            if (node == null) {
                throw new Error(
                    "Called getPathTo on a node which was not a descendant of @rootNode. " +
                    rootNode
                );
            }
            xpath = getPathSegment(node) + "/" + xpath;
            node = node.parentNode;
        }
        xpath = "/" + xpath;
        xpath = xpath.replace(/\/$/, "");
        return xpath;
    };

    var jq = $el.map(function() {
        var path = getPathTo(this);

        return path;
    });

    return jq.get();
};

var findChild = function findChild(node, type, index) {
    if (!node.hasChildNodes()) {
        throw new Error("XPath error: node has no children!");
    }
    var children = node.childNodes;
    var found = 0;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (
            var _iterator2 = Array.from(children)[Symbol.iterator](), _step2;
            !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done);
            _iteratorNormalCompletion2 = true
        ) {
            var child = _step2.value;

            var name = getNodeName(child);
            if (name === type) {
                found += 1;
                if (found === index) {
                    return child;
                }
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    throw new Error("XPath error: wanted child not found.");
};

// Get the node name for use in generating an xpath expression.
var getNodeName = function getNodeName(node) {
    var nodeName = node.nodeName.toLowerCase();
    switch (nodeName) {
        case "#text":
            return "text()";
        case "#comment":
            return "comment()";
        case "#cdata-section":
            return "cdata-section()";
        default:
            return nodeName;
    }
};

// Get the index of the node as it appears in its parent's child list
var getNodePosition = function getNodePosition(node) {
    var pos = 0;
    var tmp = node;
    while (tmp) {
        if (tmp.nodeName === node.nodeName) {
            pos += 1;
        }
        tmp = tmp.previousSibling;
    }
    return pos;
};

var fromNode = function fromNode($el, relativeRoot) {
    var result = void 0;
    try {
        result = simpleXPathJQuery($el, relativeRoot);
    } catch (exception) {
        result = simpleXPathPure($el, relativeRoot);
    }
    return result;
};

// Public: Finds an Element Node using an XPath relative to the document root.
//
// If the document is served as application/xhtml+xml it will try and resolve
// any namespaces within the XPath.
//
// path - An XPath String to query.
//
// Examples
//
//   node = toNode('/html/body/div/p[2]')
//   if node
//     # Do something with the node.
//
// Returns the Node if found otherwise null.
var toNode = function toNode(path, root) {
    if (root == null) {
        root = document;
    }
    if (!$.isXMLDoc(document.documentElement)) {
        return evaluateXPath(path, root);
    } else {
        // We're in an XML document, create a namespace resolver function to try
        // and resolve any namespaces in the current document.
        // https://developer.mozilla.org/en/DOM/document.createNSResolver
        var customResolver = document.createNSResolver(
            document.ownerDocument === null
                ? document.documentElement
                : document.ownerDocument.documentElement
        );
        var node = evaluateXPath(path, root, customResolver);

        if (!node) {
            // If the previous search failed to find a node then we must try to
            // provide a custom namespace resolver to take into account the default
            // namespace. We also prefix all node names with a custom xhtml namespace
            // eg. 'div' => 'xhtml:div'.
            path = Array.from(path.split("/"))
                .map(function(segment) {
                    return segment && segment.indexOf(":") === -1
                        ? segment.replace(/^([a-z]+)/, "xhtml:$1")
                        : segment;
                })
                .join("/");

            // Find the default document namespace.
            var namespace = document.lookupNamespaceURI(null);

            // Try and resolve the namespace, first seeing if it is an xhtml node
            // otherwise check the head attributes.
            customResolver = function customResolver(ns) {
                if (ns === "xhtml") {
                    return namespace;
                } else {
                    return document.documentElement.getAttribute("xmlns:" + ns);
                }
            };

            node = evaluateXPath(path, root, customResolver);
        }
        return node;
    }
};

module.exports = {
    fromNode: fromNode,
    toNode: toNode
};
