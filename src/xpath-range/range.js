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

var _createClass = (function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
})();

var _typeof =
    typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
        ? function(obj) {
            return typeof obj;
        }
        : function(obj) {
            return obj &&
            typeof Symbol === "function" &&
            obj.constructor === Symbol &&
            obj !== Symbol.prototype
                ? "symbol"
                : typeof obj;
        };

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called"
        );
    }
    return call && (typeof call === "object" || typeof call === "function")
        ? call
        : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError(
            "Super expression must either be null or a function, not " +
            typeof superClass
        );
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf
            ? Object.setPrototypeOf(subClass, superClass)
            : (subClass.__proto__ = superClass);
}

/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var xpath = require("./xpath");
var Util = require("./util");
var $ = window.$ || window.jQuery;

var Range = {};

// Public: Determines the type of Range of the provided object and returns
// a suitable Range instance.
//
// r - A range Object.
//
// Examples
//
//   selection = window.getSelection()
//   Range.sniff(selection.getRangeAt(0))
//   # => Returns a BrowserRange instance.
//
// Returns a Range object or false.
Range.sniff = function(r) {
    if (r.commonAncestorContainer != null) {
        return new Range.BrowserRange(r);
    } else if (typeof r.start === "string") {
        return new Range.SerializedRange(r);
    } else if (r.start && _typeof(r.start) === "object") {
        return new Range.NormalizedRange(r);
    } else {
        return false;
    }
};

Range.RangeError = (function(_Error) {
    _inherits(RangeError, _Error);

    function RangeError(type, message) {
        var _this;

        var parent =
            arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, RangeError);

        {
            // Hack: trick Babel/TypeScript into allowing this before super.
            if (false) {
                var _this = _possibleConstructorReturn(
                    this,
                    (RangeError.__proto__ || Object.getPrototypeOf(RangeError)).call(this)
                );
            }
            var thisFn = function() {
                return _this;
            }.toString();
            var thisName = thisFn
                .slice(thisFn.indexOf("return") + 6 + 1, thisFn.indexOf(";"))
                .trim();
            eval(thisName + " = this;");
        }
        _this.type = type;
        _this.message = message;
        _this.parent = parent;
        return (_this = _possibleConstructorReturn(
            this,
            (RangeError.__proto__ || Object.getPrototypeOf(RangeError))
                .call(this, _this.message)
        ));
    }

    return RangeError;
})(Error);

// Public: Creates a wrapper around a range object obtained from a DOMSelection.
Range.BrowserRange = (function() {
    // Public: Creates an instance of BrowserRange.
    //
    // object - A range object obtained via DOMSelection#getRangeAt().
    //
    // Examples
    //
    //   selection = window.getSelection()
    //   range = new Range.BrowserRange(selection.getRangeAt(0))
    //
    // Returns an instance of BrowserRange.
    function BrowserRange(obj) {
        _classCallCheck(this, BrowserRange);

        this.commonAncestorContainer = obj.commonAncestorContainer;
        this.startContainer = obj.startContainer;
        this.startOffset = obj.startOffset;
        this.endContainer = obj.endContainer;
        this.endOffset = obj.endOffset;
    }

    // Public: normalize works around the fact that browsers don't generate
    // ranges/selections in a consistent manner. Some (Safari) will create
    // ranges that have (say) a textNode startContainer and elementNode
    // endContainer. Others (Firefox) seem to only ever generate
    // textNode/textNode or elementNode/elementNode pairs.
    //
    // Returns an instance of Range.NormalizedRange

    _createClass(BrowserRange, [
        {
            key: "normalize",
            value: function normalize(root) {
                if (this.tainted) {
                    return false;
                } else {
                    this.tainted = true;
                }

                var r = {};
                this._normalizeStart(r);
                this._normalizeEnd(r);

                // Now let's start to slice & dice the text elements!
                var nr = {};

                if (r.startOffset > 0) {
                    // Do we really have to cut?
                    if (r.start.nodeValue.length > r.startOffset) {
                        // Yes. Cut.
                        nr.start = r.start.splitText(r.startOffset);
                    } else {
                        // Avoid splitting off zero-length pieces.
                        nr.start = r.start.nextSibling;
                    }
                } else {
                    nr.start = r.start;
                }

                // is the whole selection inside one text element ?
                if (r.start === r.end) {
                    if (nr.start.nodeValue.length > r.endOffset - r.startOffset) {
                        nr.start.splitText(r.endOffset - r.startOffset);
                    }
                    nr.end = nr.start;
                } else {
                    // no, the end of the selection is in a separate text element
                    // does the end need to be cut?
                    if (r.end.nodeValue.length > r.endOffset) {
                        r.end.splitText(r.endOffset);
                    }
                    nr.end = r.end;
                }

                // Make sure the common ancestor is an element node.
                nr.commonAncestor = this.commonAncestorContainer;
                while (nr.commonAncestor.nodeType !== Util.NodeTypes.ELEMENT_NODE) {
                    nr.commonAncestor = nr.commonAncestor.parentNode;
                }

                return new Range.NormalizedRange(nr);
            }
        },
        {
            key: "_normalizeStart",
            value: function _normalizeStart(r) {
                // Look at the start
                if (this.startContainer.nodeType === Util.NodeTypes.ELEMENT_NODE) {
                    // We are dealing with element nodes
                    r.start = Util.getFirstTextNodeNotBefore(
                        this.startContainer.childNodes[this.startOffset]
                    );
                    return (r.startOffset = 0);
                } else {
                    // We are dealing with simple text nodes
                    r.start = this.startContainer;
                    return (r.startOffset = this.startOffset);
                }
            }
        },
        {
            key: "_normalizeEnd",
            value: function _normalizeEnd(r) {
                // Look at the end
                if (this.endContainer.nodeType === Util.NodeTypes.ELEMENT_NODE) {
                    // Get specified node.
                    var node = this.endContainer.childNodes[this.endOffset];

                    if (node != null) {
                        // Does that node exist?
                        // Look for a text node either at the immediate beginning of node
                        var n = node;
                        while (n != null && n.nodeType !== Util.NodeTypes.TEXT_NODE) {
                            n = n.firstChild;
                        }
                        if (n != null) {
                            // Did we find a text node at the start of this element?
                            r.end = n;
                            r.endOffset = 0;
                        }
                    }

                    if (r.end == null) {
                        // We need to find a text node in the previous sibling of the node at the
                        // given offset, if one exists, or in the previous sibling of its
                        // container.
                        if (this.endOffset) {
                            node = this.endContainer.childNodes[this.endOffset - 1];
                        } else {
                            node = this.endContainer.previousSibling;
                        }
                        r.end = Util.getLastTextNodeUpTo(node);
                        return (r.endOffset = r.end.nodeValue.length);
                    }
                } else {
                    // We are dealing with simple text nodes
                    r.end = this.endContainer;
                    return (r.endOffset = this.endOffset);
                }
            }

            // Public: Creates a range suitable for storage.
            //
            // root           - A root Element from which to anchor the serialisation.
            // ignoreSelector - A selector String of elements to ignore. For example
            //                  elements injected by the annotator.
            //
            // Returns an instance of SerializedRange.
        },
        {
            key: "serialize",
            value: function serialize(root, ignoreSelector) {
                return this.normalize(root).serialize(root, ignoreSelector);
            }
        }
    ]);

    return BrowserRange;
})();

// Public: A normalised range is most commonly used throughout the annotator.
// its the result of a deserialised SerializedRange or a BrowserRange with
// out browser inconsistencies.
Range.NormalizedRange = (function() {
    // Public: Creates an instance of a NormalizedRange.
    //
    // This is usually created by calling the .normalize() method on one of the
    // other Range classes rather than manually.
    //
    // obj - An Object literal. Should have the following properties.
    //       commonAncestor: A Element that encompasses both the start and end
    //                       nodes
    //       start:          The first TextNode in the range.
    //       end             The last TextNode in the range.
    //
    // Returns an instance of NormalizedRange.
    function NormalizedRange(obj) {
        _classCallCheck(this, NormalizedRange);

        this.commonAncestor = obj.commonAncestor;
        this.start = obj.start;
        this.end = obj.end;
    }

    // Public: For API consistency.
    //
    // Returns itself.

    _createClass(NormalizedRange, [
        {
            key: "normalize",
            value: function normalize(root) {
                return this;
            }

            // Public: Limits the nodes within the NormalizedRange to those contained
            // withing the bounds parameter. It returns an updated range with all
            // properties updated. NOTE: Method returns null if all nodes fall outside
            // of the bounds.
            //
            // bounds - An Element to limit the range to.
            //
            // Returns updated self or null.
        },
        {
            key: "limit",
            value: function limit(bounds) {
                var nodes = $.grep(this.textNodes(), function(node) {
                    return (
                        node.parentNode === bounds || $.contains(bounds, node.parentNode)
                    );
                });

                if (!nodes.length) {
                    return null;
                }

                this.start = nodes[0];
                this.end = nodes[nodes.length - 1];

                var startParents = $(this.start).parents();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (
                        var _iterator = Array.from($(this.end).parents())[
                                Symbol.iterator
                                ](),
                            _step;
                        !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                        _iteratorNormalCompletion = true
                    ) {
                        var parent = _step.value;

                        if (startParents.index(parent) !== -1) {
                            this.commonAncestor = parent;
                            break;
                        }
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

                return this;
            }

            // Convert this range into an object consisting of two pairs of (xpath,
            // character offset), which can be easily stored in a database.
            //
            // root - The root Element relative to which XPaths should be calculated
            // ignoreSelector - A selector String of elements to ignore. For example
            //                  elements injected by the annotator.
            //
            // Returns an instance of SerializedRange.
        },
        {
            key: "serialize",
            value: function serialize(root, ignoreSelector) {
                var serialization = function serialization(node, isEnd) {
                    var origParent = void 0;
                    if (ignoreSelector) {
                        origParent = $(node)
                            .parents(":not(" + ignoreSelector + ")")
                            .eq(0);
                    } else {
                        origParent = $(node).parent();
                    }

                    var path = xpath.fromNode(origParent, root)[0];
                    var textNodes = Util.getTextNodes(origParent);

                    // Calculate real offset as the combined length of all the
                    // preceding textNode siblings. We include the length of the
                    // node if it's the end node.
                    var nodes = textNodes.slice(0, textNodes.index(node));
                    var offset = 0;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (
                            var _iterator2 = Array.from(nodes)[Symbol.iterator](), _step2;
                            !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done);
                            _iteratorNormalCompletion2 = true
                        ) {
                            var n = _step2.value;

                            offset += n.nodeValue.length;
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

                    if (isEnd) {
                        return [path, offset + node.nodeValue.length];
                    } else {
                        return [path, offset];
                    }
                };

                var start = serialization(this.start);
                var end = serialization(this.end, true);

                return new Range.SerializedRange({
                    // XPath strings
                    start: start[0],
                    end: end[0],
                    // Character offsets (integer)
                    startOffset: start[1],
                    endOffset: end[1]
                });
            }

            // Public: Creates a concatenated String of the contents of all the text nodes
            // within the range.
            //
            // Returns a String.
        },
        {
            key: "text",
            value: function text() {
                return Array.from(this.textNodes())
                    .map(function(node) {
                        return node.nodeValue;
                    })
                    .join("");
            }

            // Public: Fetches only the text nodes within th range.
            //
            // Returns an Array of TextNode instances.
        },
        {
            key: "textNodes",
            value: function textNodes() {
                var textNodes = Util.getTextNodes($(this.commonAncestor));

                var _Array$from = Array.from([
                        textNodes.index(this.start),
                        textNodes.index(this.end)
                    ]),
                    _Array$from2 = _slicedToArray(_Array$from, 2),
                    start = _Array$from2[0],
                    end = _Array$from2[1];
                // Return the textNodes that fall between the start and end indexes.

                return $.makeArray(textNodes.slice(start, +end + 1 || undefined));
            }
        }
    ]);

    return NormalizedRange;
})();

// Public: A range suitable for storing in local storage or serializing to JSON.
Range.SerializedRange = (function() {
    // Public: Creates a SerializedRange
    //
    // obj - The stored object. It should have the following properties.
    //       start:       An xpath to the Element containing the first TextNode
    //                    relative to the root Element.
    //       startOffset: The offset to the start of the selection from obj.start.
    //       end:         An xpath to the Element containing the last TextNode
    //                    relative to the root Element.
    //       startOffset: The offset to the end of the selection from obj.end.
    //
    // Returns an instance of SerializedRange
    function SerializedRange(obj) {
        _classCallCheck(this, SerializedRange);

        this.start = obj.start;
        this.startOffset = obj.startOffset;
        this.end = obj.end;
        this.endOffset = obj.endOffset;
    }

    // Public: Creates a NormalizedRange.
    //
    // root - The root Element from which the XPaths were generated.
    //
    // Returns a NormalizedRange instance.

    _createClass(SerializedRange, [
        {
            key: "normalize",
            value: function normalize(root) {
                var range = {};

                var _arr = ["start", "end"];
                for (var _i = 0; _i < _arr.length; _i++) {
                    var p = _arr[_i];
                    var node;
                    try {
                        node = xpath.toNode(this[p], root);
                    } catch (e) {
                        throw new Range.RangeError(
                            p,
                            "Error while finding " + p + " node: " + this[p] + ": " + e,
                            e
                        );
                    }

                    if (!node) {
                        throw new Range.RangeError(
                            p,
                            "Couldn't find " + p + " node: " + this[p]
                        );
                    }

                    // Unfortunately, we *can't* guarantee only one textNode per
                    // elementNode, so we have to walk along the element's textNodes until
                    // the combined length of the textNodes to that point exceeds or
                    // matches the value of the offset.
                    var length = 0;
                    var targetOffset = this[p + "Offset"];

                    // Range excludes its endpoint because it describes the boundary position.
                    // Target the string index of the last character inside the range.
                    if (p === "end") {
                        targetOffset -= 1;
                    }

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (
                            var _iterator3 = Array.from(Util.getTextNodes($(node)))[
                                    Symbol.iterator
                                    ](),
                                _step3;
                            !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done);
                            _iteratorNormalCompletion3 = true
                        ) {
                            var tn = _step3.value;

                            if (length + tn.nodeValue.length > targetOffset) {
                                range[p + "Container"] = tn;
                                range[p + "Offset"] = this[p + "Offset"] - length;
                                break;
                            } else {
                                length += tn.nodeValue.length;
                            }
                        }

                        // If we fall off the end of the for loop without having set
                        // 'startOffset'/'endOffset', the element has shorter content than when
                        // we annotated, so throw an error:
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }

                    if (range[p + "Offset"] == null) {
                        throw new Range.RangeError(
                            p + "offset",
                            "Couldn't find offset " +
                            this[p + "Offset"] +
                            " in element " +
                            this[p]
                        );
                    }
                }

                // Here's an elegant next step...
                //
                //   range.commonAncestorContainer = $(range.startContainer)
                //     .parents()
                //     .has(range.endContainer)[0]
                //
                // ...but unfortunately Node.contains() is broken in Safari 5.1.5 (7534.55.3)
                // and presumably other earlier versions of WebKit. In particular, in a
                // document like
                //
                //   <p>Hello</p>
                //
                // the code
                //
                //   p = document.getElementsByTagName('p')[0]
                //   p.contains(p.firstChild)
                //
                // returns `false`. Yay.
                //
                // So instead, we step through the parents from the bottom up and use
                // Node.compareDocumentPosition() to decide when to set the
                // commonAncestorContainer and bail out.

                var contains =
                    document.compareDocumentPosition != null
                        ? // Everyone else
                        function(a, b) {
                            return (
                                a.compareDocumentPosition(b) &
                                Node.DOCUMENT_POSITION_CONTAINED_BY
                            );
                        }
                        : // Newer IE
                        function(a, b) {
                            return a.contains(b);
                        };

                $(range.startContainer)
                    .parents()
                    .each(function() {
                        var endContainer = void 0;
                        if (range.endContainer.nodeType === Util.NodeTypes.TEXT_NODE) {
                            endContainer = range.endContainer.parentNode;
                        } else {
                            endContainer = range.endContainer;
                        }

                        if (contains(this, endContainer)) {
                            range.commonAncestorContainer = this;
                            return false;
                        }
                    });

                return new Range.BrowserRange(range).normalize(root);
            }

            // Public: Creates a range suitable for storage.
            //
            // root           - A root Element from which to anchor the serialisation.
            // ignoreSelector - A selector String of elements to ignore. For example
            //                  elements injected by the annotator.
            //
            // Returns an instance of SerializedRange.
        },
        {
            key: "serialize",
            value: function serialize(root, ignoreSelector) {
                return this.normalize(root).serialize(root, ignoreSelector);
            }

            // Public: Returns the range as an Object literal.
        },
        {
            key: "toObject",
            value: function toObject() {
                return {
                    start: this.start,
                    startOffset: this.startOffset,
                    end: this.end,
                    endOffset: this.endOffset
                };
            }
        }
    ]);

    return SerializedRange;
})();

// Export Range object.
module.exports = Range;
