var jsh=function(e){var t={};function n(a){if(t[a])return t[a].exports;var r=t[a]={i:a,l:!1,exports:{}};return e[a].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(a,r,function(t){return e[t]}.bind(null,r));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t,n){function a(e){0}e.exports={debug:a,InputStream:function(e){let t=[],n=null;function r(e){a(),n?(n(e),n=null,a()):(a(),t.push(e))}return e&&e.recieve&&e.recieve(r),Object.freeze({read:function(){return new Promise(e=>{t.length>0?(a(),e(t.shift())):(a(),n=e)})},send:r})},OutputStream:function(e){return Object.freeze({print:function(t){e.send(t)}})}}},function(e,t,n){const a=n(2),{InputStream:r,OutputStream:s,debug:o}=n(0);e.exports={ProcessPool:a,InputStream:r,OutputStream:s,debug:o}},function(module,exports,__webpack_require__){function _objectSpread(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{},a=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(a=a.concat(Object.getOwnPropertySymbols(n).filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),a.forEach(function(t){_defineProperty(e,t,n[t])})}return e}function _defineProperty(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const{InputStream:InputStream,OutputStream:OutputStream,debug:debug}=__webpack_require__(0),workerCode=__webpack_require__(3);function ProcessPool(e={}){const t={};function n(n,s,o,l){let u=null;const i=new Blob([generateWebWorkerCode(n,l,Object.keys(e))]),c=window.URL.createObjectURL(i),p=new Worker(c);return p.onmessage=(async l=>{const i=l.data;if("READ"===i.type){debug("await reading");const e=await s.read();p.postMessage({type:"READ_RETURN",value:e})}else if("PRINT"===i.type){const e=i.value;debug("GOT PRINT: "+e),o.print(e)}else if("SPAWN"===i.type){const e=i.body,t=i.source,n=i.sink;let r=s;null!=t&&(r=new InputStream(deserialize(t)));let l=o;null!=n&&(l=new OutputStream(deserialize(n)));const u=a(r,l,e);debug("created child process: "+u),p.postMessage({type:"SPAWN_RETURN",value:u})}else if("SPAWN_MULTIPLE"===i.type){const e=i.bodies.split("@@@");let t=[],n=s;for(let r=e.length-1;r>=0;r--){const l=e[r],u=0===r?s:new InputStream,i=a(u,r===e.length-1?o:new OutputStream(n),l);t.unshift(i),n=u}p.postMessage({type:"SPAWN_MULTIPLE_RETURN",value:t})}else if("WAIT"===i.type){const e=i.value;t[e]&&t[e].finishCallbacks.push(()=>p.postMessage({type:"WAIT_RETURN"}))}else if("START_OTHER"===i.type){const e=i.value;debug("STARTING PROCESS "+e),r(e)}else if("GLOBAL"===i.type){const t=i.name,n=i.args;if(e[t]){const a=await e[t].apply(_objectSpread({},e,{read:s.read,print:o.print}),n);p.postMessage({type:"GLOBAL_RETURN",name:t,value:a})}}else"FINISH"===i.type&&(debug("closing "+n),window.URL.revokeObjectURL(c),p.terminate(),u&&u())}),{start:function(){p.postMessage({type:"START"})},onFinish:function(e){u=e}}}function a(e,a,r){const s=function(){let e=1e3*Math.random()|0;for(;t[e];)e=1e3*Math.random()|0;return e}(),o=new n(s,e,a,r);return t[s]={process:o,finishCallbacks:[]},o.onFinish(()=>{debug("running callbacks for "+s),t[s].finishCallbacks.forEach(e=>e())}),s}function r(e){t[e]&&t[e].process.start()}return Object.freeze({createProcess:a,startProcess:r,waitProcess:async function(e){return new Promise(n=>{t[e]&&t[e].process.onFinish(n)})}})}function deserialize(str){const parsed=JSON.parse(str);return Object.keys(parsed).reduce((acc,key)=>_objectSpread({},acc,{[key]:eval("("+parsed[key]+")")}),{})}function generateWebWorkerCode(e,t,n){return`(\n    (_pid, _body, _globalNames) => {\n      ${workerCode}\n    }\n  )(\n    ${e},\n    String(${t.toString()}),\n    [${n.map(e=>`"${e}"`).toString()}]\n  )`}module.exports=ProcessPool},function(module,exports,__webpack_require__){const code=String(()=>{function debug(e){0}let globalCallbacks={};const globals=_globalNames.reduce((e,t)=>Object.assign(e,{[t]:function(...e){return new Promise(n=>{globalCallbacks[t]=n,postMessage({type:"GLOBAL",name:t,args:e})})}}),{});function InputStream(e){let t=[],n=null;this.read=function(){return new Promise(e=>{if(t.length>0){debug("inputstream: read from buffer"),e(t.shift())}else debug("inputstream: waiting read from callback"),postMessage({type:"READ"}),n=e})},this.send=function(e){debug('inputstream: received "'+e+'"'),n?(debug("inputstream: send to callback"),n(e),n=null):(debug("inputstream: save to buffer"),t.push(e))},e&&e.recieve(this.send)}function OutputStream(e){this.print=function(t){e.send(t)}}const stdin=new InputStream({recieve:function(e){addEventListener("message",t=>{if("READ_RETURN"===t.data.type){const n=t.data.value;e(n)}})}}),stdout=new OutputStream({send:function(e){debug("PRINTING "+e),postMessage({type:"PRINT",value:e})}});let spawnCallback=null;async function spawn(e,t,n){return new Promise(a=>{spawnCallback=a,postMessage({type:"SPAWN",body:e.toString(),source:t?serialize(t):null,sink:n?serialize(n):null})})}let waitCallback=null;async function wait(e){return new Promise(t=>{waitCallback=t,postMessage({type:"WAIT",value:e})})}let spawnMultipleCallback=null;function spawnMultiple(...e){return new Promise(t=>{spawnMultipleCallback=t,postMessage({type:"SPAWN_MULTIPLE",bodies:e.join("@@@")})})}function start(e){postMessage({type:"START_OTHER",value:e})}function serialize(e){return JSON.stringify(Object.keys(e).reduce((t,n)=>Object.assign(t,{[n]:e[n].toString()}),{}))}addEventListener("message",async e=>{if("START"===e.data.type){const body=eval("("+_body+")"),std=Object.assign({pid:_pid,read:stdin.read,print:stdout.print,spawn:spawn,wait:wait,start:start,spawnMultiple:spawnMultiple},globals);await body(std),postMessage({type:"FINISH"})}else if("SPAWN_RETURN"===e.data.type){const t=e.data.value;spawnCallback&&(spawnCallback(t),spawnCallback=null)}else if("SPAWN_MULTIPLE_RETURN"===e.data.type){const t=e.data.value;spawnMultipleCallback&&(spawnMultipleCallback(t),spawnMultipleCallback=null)}else if("WAIT_RETURN"===e.data.type)waitCallback&&(waitCallback(),waitCallback=null);else if("GLOBAL_RETURN"===e.data.type){const t=e.data.name,n=e.data.value,a=globalCallbacks[t];a&&(a(n),delete globalCallbacks[t])}})}),start=code.indexOf("{")+1,end=code.lastIndexOf("}");module.exports=code.slice(start,end)}]);