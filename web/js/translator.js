'use strict';


var Translator = function(messages) {
    this.messages = messages || {};
};


Translator.prototype.translate = function(msg, params) {
    if (this.messages[msg]) {
        msg = this.messages[msg];
    }

    params = params || {};
    for (var pr in params) {
        msg = msg.replace(pr, params[pr]);
    }

    return msg;
}
