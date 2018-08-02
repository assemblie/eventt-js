(function(window, undefined) {
    let listeners = {},
        jQueryEventInfo = {},
        bridge = null;

    let parseEventName = function (name) {
        let event = name.split(':');

        return [event[0], event[1]];
    };

    let addListener = function (event, callback, required = []) {
        if (typeof callback !== "function") {
            console.error('invalid listener callback must be function object');
            return false;
        }

        [scope, event] = parseEventName(event);

        if (!(scope in listeners)) {
            listeners[scope] = {};
        }

        if (!(event in listeners[scope])) {
            listeners[scope][event] = [];
        }

        listeners[scope][event].push({
            callback,
            required
        });
    };

    let emitEvent = function (event, data, ref = null) {
        [scope, event] = parseEventName(event);

        if (scope in listeners && event in listeners[scope]) {
            if (typeof data === "undefined") {
                data = {};
            }

            let toFire = listeners[scope][event];

            for (let ii = 0; ii < toFire.length; ii++) {
                if (validateRequiredParameters(toFire[ii].required, data)) {
                    toFire[ii].callback.prototype.constructor.call(ref, data);
                }
            }
        }
    };

    let validateRequiredParameters = function (params, data) {
        for (let ii = 0; ii < params.length; ii++) {
            if (typeof data === "undefined" || !(params[ii] in data)) {
                console.error('parameter "' + params[ii] + '" is required');
                return false;
            }
        }
        return true;
    };

    let parseAndReturnFunctionArguments = function (func) {
        let args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        return args.split(',').map(function (arg) {
            arg = arg.replace(/\/\*.*\*\//, '').trim();
            arg = arg.split("=");

            let desc = {
                name: arg[0].trim().replace('$', ''),
                required: true
            };

            if (arg.length > 1) {
                desc.required = false;
            }

            return desc;
        })
    };

    window.Eventt = {
        fire: emitEvent,
        listen: addListener
    };
} (window));
