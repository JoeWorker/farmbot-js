"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_1 = require("mqtt");
var util_1 = require("./util");
var util_2 = require("./util");
var config_1 = require("./config");
var resource_adapter_1 = require("./resources/resource_adapter");
exports.NULL = "null";
var RECONNECT_THROTTLE = 1000;
var Farmbot = /** @class */ (function () {
    function Farmbot(input) {
        var _this = this;
        this.getConfig = function (key) { return _this.config[key]; };
        this.setConfig = function (key, value) {
            _this.config[key] = value;
        };
        /** Installs a "Farmware" (plugin) onto the bot's SD card.
         * URL must point to a valid Farmware manifest JSON document. */
        this.installFarmware = function (url) {
            return _this.send(util_1.rpcRequest([{ kind: "install_farmware", args: { url: url } }]));
        };
        /** Checks for updates on a particular Farmware plugin when given the name of
         * a farmware. `updateFarmware("take-photo")`
         */
        this.updateFarmware = function (pkg) {
            return _this.send(util_1.rpcRequest([{
                    kind: "update_farmware",
                    args: { package: pkg }
                }]));
        };
        /** Uninstall a Farmware plugin. */
        this.removeFarmware = function (pkg) {
            return _this.send(util_1.rpcRequest([{
                    kind: "remove_farmware",
                    args: { package: pkg }
                }]));
        };
        /** Installs "Farmwares" (plugins) authored by FarmBot.io
       * onto the bot's SD card.
       */
        this.installFirstPartyFarmware = function () {
            return _this.send(util_1.rpcRequest([{
                    kind: "install_first_party_farmware",
                    args: {}
                }]));
        };
        /** Deactivate FarmBot OS completely. */
        this.powerOff = function () {
            return _this.send(util_1.rpcRequest([{ kind: "power_off", args: {} }]));
        };
        /** Cycle device power. */
        this.reboot = function () {
            var r = util_1.rpcRequest([{ kind: "reboot", args: { package: "farmbot_os" } }]);
            return _this.send(r);
        };
        this.rebootFirmware = function () {
            var r = util_1.rpcRequest([{ kind: "reboot", args: { package: "arduino_firmware" } }]);
            return _this.send(r);
        };
        /** Check for new versions of FarmBot OS. */
        this.checkUpdates = function () {
            return _this.send(util_1.rpcRequest([
                { kind: "check_updates", args: { package: "farmbot_os" } }
            ]));
        };
        /** THIS WILL RESET THE SD CARD! Be careful!! */
        this.resetOS = function () {
            return _this.publish(util_1.rpcRequest([
                { kind: "factory_reset", args: { package: "farmbot_os" } }
            ]));
        };
        this.resetMCU = function () {
            return _this.send(util_1.rpcRequest([
                { kind: "factory_reset", args: { package: "arduino_firmware" } }
            ]));
        };
        /** Lock the bot from moving. This also will pause running regimens and cause
         *  any running sequences to exit */
        this.emergencyLock = function () {
            return _this.send(util_1.rpcRequest([{ kind: "emergency_lock", args: {} }]));
        };
        /** Unlock the bot when the user says it is safe. Currently experiencing
         * issues. Consider reboot() instead. */
        this.emergencyUnlock = function () {
            return _this.send(util_1.rpcRequest([{ kind: "emergency_unlock", args: {} }]));
        };
        /** Execute a sequence by its ID on the API. */
        this.execSequence = function (sequence_id) {
            return _this.send(util_1.rpcRequest([{ kind: "execute", args: { sequence_id: sequence_id } }]));
        };
        /** Run a preloaded Farmware / script on the SD Card. */
        this.execScript = function (/** Filename of the script */ label, 
        /** Optional ENV vars to pass the script */
        envVars) {
            return _this.send(util_1.rpcRequest([
                { kind: "execute_script", args: { label: label }, body: envVars }
            ]));
        };
        /** Bring a particular axis (or all of them) to position 0. */
        this.home = function (args) {
            return _this.send(util_1.rpcRequest([{ kind: "home", args: args }]));
        };
        /** Use end stops or encoders to figure out where 0,0,0 is.
         *  WON'T WORK WITHOUT ENCODERS OR END STOPS! */
        this.findHome = function (args) {
            return _this.send(util_1.rpcRequest([{ kind: "find_home", args: args }]));
        };
        /** Move gantry to an absolute point. */
        this.moveAbsolute = function (args) {
            var x = args.x, y = args.y, z = args.z;
            var speed = args.speed || config_1.CONFIG_DEFAULTS.speed;
            return _this.send(util_1.rpcRequest([
                {
                    kind: "move_absolute",
                    args: {
                        location: util_1.coordinate(x, y, z),
                        offset: util_1.coordinate(0, 0, 0),
                        speed: speed
                    }
                }
            ]));
        };
        /** Move gantry to position relative to its current position. */
        this.moveRelative = function (args) {
            var x = args.x, y = args.y, z = args.z;
            var speed = args.speed || config_1.CONFIG_DEFAULTS.speed;
            return _this.send(util_1.rpcRequest([{ kind: "move_relative", args: { x: x, y: y, z: z, speed: speed } }]));
        };
        /** Set a GPIO pin to a particular value. */
        this.writePin = function (args) {
            return _this.send(util_1.rpcRequest([{ kind: "write_pin", args: args }]));
        };
        /** Set a GPIO pin to a particular value. */
        this.readPin = function (args) {
            return _this.send(util_1.rpcRequest([{ kind: "read_pin", args: args }]));
        };
        /** Reverse the value of a digital pin. */
        this.togglePin = function (args) {
            return _this.send(util_1.rpcRequest([{ kind: "toggle_pin", args: args }]));
        };
        /** Read the status of the bot. Should not be needed unless you are first
         * logging in to the device, since the device pushes new states out on
         * every update. */
        this.readStatus = function (args) {
            if (args === void 0) { args = {}; }
            return _this.send(util_1.rpcRequest([{ kind: "read_status", args: args }]));
        };
        /** Snap a photo and send to the API for post processing. */
        this.takePhoto = function (args) {
            if (args === void 0) { args = {}; }
            return _this.send(util_1.rpcRequest([{ kind: "take_photo", args: args }]));
        };
        /** Force device to download all of the latest JSON resources (plants,
         * account info, etc.) from the FarmBot API. */
        this.sync = function (args) {
            if (args === void 0) { args = {}; }
            return _this.send(util_1.rpcRequest([{ kind: "sync", args: args }]));
        };
        /** Set the position of the given axis to 0 at the current position of said
         * axis. Example: Sending bot.setZero("x") at x: 255 will translate position
         * 255 to 0. */
        this.setZero = function (axis) {
            return _this.send(util_1.rpcRequest([{
                    kind: "zero",
                    args: { axis: axis }
                }]));
        };
        /** Update the Arduino settings */
        this.updateMcu = function (update) {
            var body = [];
            Object
                .keys(update)
                .forEach(function (label) {
                var value = util_2.pick(update, label, "ERROR");
                body.push({
                    kind: "config_update",
                    args: { package: "arduino_firmware" },
                    body: [{ kind: "pair", args: { value: value, label: label } }]
                });
            });
            return _this.send(util_1.rpcRequest(body));
        };
        /** Set user ENV vars (usually used by 3rd party Farmware scripts).
         * Set value to `undefined` to unset. */
        this.setUserEnv = function (configs) {
            var body = Object
                .keys(configs)
                .map(function (label) {
                return {
                    kind: "pair",
                    args: { label: label, value: (configs[label] || exports.NULL) }
                };
            });
            return _this.send(util_1.rpcRequest([{ kind: "set_user_env", args: {}, body: body }]));
        };
        this.registerGpio = function (input) {
            var sequence_id = input.sequence_id, pin_number = input.pin_number;
            var rpc = util_1.rpcRequest([{
                    kind: "register_gpio",
                    args: { sequence_id: sequence_id, pin_number: pin_number }
                }]);
            return _this.send(rpc);
        };
        this.unregisterGpio = function (input) {
            var pin_number = input.pin_number;
            var rpc = util_1.rpcRequest([{
                    kind: "unregister_gpio",
                    args: { pin_number: pin_number }
                }]);
            return _this.send(rpc);
        };
        this.setServoAngle = function (args) {
            var result = _this.send(util_1.rpcRequest([{ kind: "set_servo_angle", args: args }]));
            // Celery script can't validate `pin_number` and `pin_value` the way we need
            // for `set_servo_angle`. We will send the RPC command off, but also
            // crash the client to aid debugging.
            if (![4, 5].includes(args.pin_number)) {
                throw new Error("Servos only work on pins 4 and 5");
            }
            if (args.pin_value > 360 || args.pin_value < 0) {
                throw new Error("Pin value outside of 0...360 range");
            }
            return result;
        };
        /** Update a config option for FarmBot OS. */
        this.updateConfig = function (update) {
            var body = Object
                .keys(update)
                .map(function (label) {
                var value = util_2.pick(update, label, "ERROR");
                return { kind: "pair", args: { value: value, label: label } };
            });
            return _this.send(util_1.rpcRequest([{
                    kind: "config_update",
                    args: { package: "farmbot_os" },
                    body: body
                }]));
        };
        this.calibrate = function (args) {
            return _this.send(util_1.rpcRequest([{ kind: "calibrate", args: args }]));
        };
        /** Tell the bot to send diagnostic info to the API.*/
        this.dumpInfo = function () {
            return _this.send(util_1.rpcRequest([{
                    kind: "dump_info",
                    args: {}
                }]));
        };
        /** Retrieves all of the event handlers for a particular event.
         * Returns an empty array if the event did not exist.
          */
        this.event = function (name) {
            _this._events[name] = _this._events[name] || [];
            return _this._events[name];
        };
        this.on = function (event, callback) { return _this.event(event).push(callback); };
        this.emit = function (event, data) {
            [_this.event(event), _this.event("*")]
                .forEach(function (handlers) {
                handlers.forEach(function (handler) {
                    try {
                        handler(data, event);
                    }
                    catch (e) {
                        console.warn("Exception thrown while handling `" + event + "` event.");
                        console.dir(e);
                    }
                });
            });
        };
        /** Low level means of sending MQTT packets. Does not check format. Does not
         * acknowledge confirmation. Probably not the one you want. */
        this.publish = function (msg, important) {
            if (important === void 0) { important = true; }
            if (_this.client) {
                _this.emit("sent", msg);
                /** SEE: https://github.com/mqttjs/MQTT.js#client */
                _this.client.publish(_this.channel.toDevice, JSON.stringify(msg));
            }
            else {
                if (important) {
                    throw new Error("Not connected to server");
                }
            }
        };
        /** Low level means of sending MQTT RPC commands to the bot. Acknowledges
         * receipt of message, but does not check formatting. Consider using higher
         * level methods like .moveRelative(), .calibrate(), etc....
        */
        this.send = function (input) {
            return new Promise(function (resolve, reject) {
                _this.publish(input);
                _this.on(input.args.label, function (response) {
                    switch (response.kind) {
                        case "rpc_ok": return resolve(response);
                        case "rpc_error":
                            var reason = (response.body || []).map(function (x) { return x.args.message; }).join(", ");
                            return reject(new Error("Problem sending RPC command: " + reason));
                        default:
                            console.dir(response);
                            throw new Error("Got a bad CeleryScript node.");
                    }
                });
            });
        };
        /** Main entry point for all MQTT packets. */
        this._onmessage = function (chan, buffer) {
            try {
                /** UNSAFE CODE: TODO: Add user defined type guards? */
                var msg = JSON.parse(buffer.toString());
                switch (chan) {
                    case _this.channel.logs: return _this.emit("logs", msg);
                    case _this.channel.status: return _this.emit("status", msg);
                    case _this.channel.toClient:
                    case _this.channel.fromAPI:
                    default:
                        // Did it come from the auto_sync channel? Process it as such.
                        if (chan.includes("sync")) {
                            return _this.emit("sync", msg);
                        }
                        // Is it valid CS? Probably a batch resource or RPC operation.
                        if (util_2.isCeleryScript(msg)) {
                            return _this.emit(msg.args.label, msg);
                        }
                        // Still nothing? Emit "malformed", but don't crash incase we're
                        // getting outdated messages from a legacy bot.
                        console.warn("Unhandled inbound message from " + chan);
                        _this.emit("malformed", msg);
                }
            }
            catch (error) {
                console.warn("Could not parse inbound message from MQTT.");
                _this.emit("malformed", buffer.toString());
            }
        };
        /** Bootstrap the device onto the MQTT broker. */
        this.connect = function () {
            var _a = _this.config, mqttUsername = _a.mqttUsername, token = _a.token, mqttServer = _a.mqttServer;
            var client = mqtt_1.connect(mqttServer, {
                username: mqttUsername,
                password: token,
                clean: true,
                clientId: "FBJS-" + Farmbot.VERSION + "-" + util_1.uuid(),
                reconnectPeriod: RECONNECT_THROTTLE
            });
            _this.client = client;
            _this.resources = new resource_adapter_1.ResourceAdapter(_this, _this.config.mqttUsername);
            client.on("message", _this._onmessage);
            client.on("offline", function () { return _this.emit("offline", {}); });
            client.on("connect", function () { return _this.emit("online", {}); });
            var channels = [
                _this.channel.fromAPI,
                _this.channel.logs,
                _this.channel.status,
                _this.channel.sync,
                _this.channel.toClient,
            ];
            client.subscribe(channels);
            return new Promise(function (resolve, _reject) {
                var client = _this.client;
                if (client) {
                    client.once("connect", function () { return resolve(_this); });
                }
                else {
                    throw new Error("Please connect first.");
                }
            });
        };
        this._events = {};
        this.config = config_1.generateConfig(input);
        this.resources = new resource_adapter_1.ResourceAdapter(this, this.config.mqttUsername);
    }
    Farmbot.prototype.reinitFirmware = function () {
        var r = util_1.rpcRequest([{ kind: "reboot", args: { package: "arduino_firmware" } }]);
        return this.send(r);
    };
    Object.defineProperty(Farmbot.prototype, "channel", {
        /** Dictionary of all relevant MQTT channels the bot uses. */
        get: function () {
            var deviceName = this.config.mqttUsername;
            return {
                /** From the browser, usually. */
                toDevice: "bot/" + deviceName + "/from_clients",
                /** From farmbot */
                toClient: "bot/" + deviceName + "/from_device",
                status: "bot/" + deviceName + "/status",
                logs: "bot/" + deviceName + "/logs",
                sync: "bot/" + deviceName + "/sync/#",
                fromAPI: "bot/" + deviceName + "/from_api",
            };
        },
        enumerable: true,
        configurable: true
    });
    Farmbot.VERSION = "6.5.6";
    return Farmbot;
}());
exports.Farmbot = Farmbot;
