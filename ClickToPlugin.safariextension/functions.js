function downloadURL(url) {
    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, true, false, false, 0, null);
    
    downloadLink.dispatchEvent(event);
}

function getInfo(element, url) {
    // gathers attributes of the element that might be needed later on
    // Done by a single function so that we only loop once through the <param> children
    var info = new Object();
    var tmpAnchor = document.createElement("a");
    switch (element.tag) {
        case "embed":
            if(element.hasAttribute("qtsrc")) {
                tmpAnchor.href = element.getAttribute("qtsrc");
                info.src = tmpAnchor.href;
            }
            if(element.hasAttribute("autohref")) {
                info.autohref = /^true$/i.test(element.getAttribute("autohref"));
            }
            if(element.hasAttribute("href")) {
                tmpAnchor.href = element.getAttribute("href");
                info.href = tmpAnchor.href;
            }
            if(element.hasAttribute("target")) {
                info.target = element.getAttribute("target");
            }
            if(element.hasAttribute("previewimage")) {
                tmpAnchor.href = element.getAttribute("previewimage");
                info.image = tmpAnchor.href;
            }
            break;
        case "object":
            var paramElements = element.getElementsByTagName("param");
            for (var i = 0; i < paramElements.length; i++) {
                if(!paramElements[i].hasAttribute("value")) continue;
                /* NOTE 1
                The 'name' attribute of a <param> element is mandatory.
                However, Safari will load an <object> element even if it has <param> children with no 'name',
                so we have to account for this possibilty, otherwise CTP could easily be circumvented!
                For these reasons we use try/catch statements.
                */
                try{
                    var paramName = paramElements[i].getAttribute("name").toLowerCase();
                    switch(paramName) {
                        case "source": // Silverlight true source
                            tmpAnchor.href = paramElements[i].getAttribute("value");
                            info.src = tmpAnchor.href;
                            break;
                        case "qtsrc": // QuickTime true source
                            tmpAnchor.href = paramElements[i].getAttribute("value");
                            info.src = tmpAnchor.href;
                            break;
                        case "autohref": // QuickTime redirection
                            info.autohref = /^true$/i.test(paramElements[i].getAttribute("value"));
                            break;
                        case "href": // QuickTime redirection
                            tmpAnchor.href = paramElements[i].getAttribute("value");
                            info.href = tmpAnchor.href;
                            break;
                        case "target": // QuickTime redirection
                            info.target = paramElements[i].getAttribute("value");
                            break;
                        case "previewimage": // DivX poster
                            tmpAnchor.href = paramElements[i].getAttribute("value");
                            info.image = tmpAnchor.href;
                            break;
                    }
                } catch(err) {}
            }
            break;
    }
    if(!info.src) {
        if(!url) info.src = "";
        else {
            tmpAnchor.href = url;
            info.src = tmpAnchor.href;
        }
    }
    return info;
}

function getTypeOf(element) {
    switch (element.tag) {
        case "embed":
            return element.type;
            break;
        case "object":
            if(element.type) {
                return element.type;
            } else {
                var paramElements = element.getElementsByTagName("param");
                for (var i = 0; i < paramElements.length; i++) {
                    try { // see NOTE 1
                        if(paramElements[i].getAttribute("name").toLowerCase() == "type") {
                            return paramElements[i].getAttribute("value");
                        }
                    } catch(err) {}
                }
                var embedChildren = element.getElementsByTagName("embed");
                if(embedChildren.length == 0) return "";
                return embedChildren[0].type;
            }
            break;
    }
}

function getParamsOf(element) {
    switch(element.plugin) {
        case "Flash":
            switch (element.tag) {
                case "embed":
                    return (element.hasAttribute("flashvars") ? element.getAttribute("flashvars") : ""); // fixing Safari's buggy JS support
                    break
                case "object":
                    var paramElements = element.getElementsByTagName("param");
                    for (var i = paramElements.length - 1; i >= 0; i--) {
                        try{ // see NOTE 1
                            if(paramElements[i].getAttribute("name").toLowerCase() == "flashvars") {
                                return paramElements[i].getAttribute("value");
                            }
                        } catch(err) {}
                    }
                    return "";
                    break;
            }
            break;
        case "Silverlight":
            if(element.tag != "object") return "";
            var paramElements = element.getElementsByTagName("param");
            for (var i = 0; i < paramElements.length; i++) {
                try { // see NOTE 1
                    if(paramElements[i].getAttribute("name").toLowerCase() == "initparams") {
                        return paramElements[i].getAttribute("value").replace(/\s+/g,"");
                    }
                } catch(err) {}
            }
            return "";
            break;
        default: return "";
    }
}

// Debugging functions
document.HTMLToString = function(element){
    return (new XMLSerializer()).serializeToString(element);
};
