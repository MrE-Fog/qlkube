"use strict";(self.webpackChunkgrphi1=self.webpackChunkgrphi1||[]).push([[316],{7872:function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){for(var n=[],r=e;r&&r.kind;)n.push(r),r=r.prevState;for(var i=n.length-1;i>=0;i--)t(n[i])}},6334:function(e,t){function n(e,t){var n=e.filter(t);return 0===n.length?e:n}function r(e){return e.toLowerCase().replace(/\W/g,"")}function i(e,t){var n=function(e,t){var n,r,i=[],a=e.length,u=t.length;for(n=0;n<=a;n++)i[n]=[n];for(r=1;r<=u;r++)i[0][r]=r;for(n=1;n<=a;n++)for(r=1;r<=u;r++){var l=e[n-1]===t[r-1]?0:1;i[n][r]=Math.min(i[n-1][r]+1,i[n][r-1]+1,i[n-1][r-1]+l),n>1&&r>1&&e[n-1]===t[r-2]&&e[n-2]===t[r-1]&&(i[n][r]=Math.min(i[n][r],i[n-2][r-2]+l))}return i[a][u]}(t,e);return e.length>t.length&&(n-=e.length-t.length-1,n+=0===e.indexOf(t)?0:.5),n}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,a){var u=function(e,t){if(!t)return n(e,(function(e){return!e.isDeprecated}));return n(n(e.map((function(e){return{proximity:i(r(e.text),t),entry:e}})),(function(e){return e.proximity<=2})),(function(e){return!e.entry.isDeprecated})).sort((function(e,t){return(e.entry.isDeprecated?1:0)-(t.entry.isDeprecated?1:0)||e.proximity-t.proximity||e.entry.text.length-t.entry.text.length})).map((function(e){return e.entry}))}(a,r(t.string));if(u){var l=null!==t.type&&/"|\w/.test(t.string[0])?t.start:t.end;return{list:u,from:{line:e.line,ch:l},to:{line:e.line,ch:t.end}}}}},2316:function(e,t,n){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var i=r(n(1300)),a=n(730),u=r(n(7872)),l=r(n(6334));i.default.registerHelper("hint","graphql-variables",(function(e,t){var n=e.getCursor(),r=e.getTokenAt(n),o=function(e,t,n){var r="Invalid"===t.state.kind?t.state.prevState:t.state,i=r.kind,o=r.step;if("Document"===i&&0===o)return l.default(e,t,[{text:"{"}]);var f=n.variableToType;if(!f)return;var p=function(e,t){var n={type:null,fields:null};return u.default(t,(function(t){if("Variable"===t.kind)n.type=e[t.name];else if("ListValue"===t.kind){var r=n.type?a.getNullableType(n.type):void 0;n.type=r instanceof a.GraphQLList?r.ofType:null}else if("ObjectValue"===t.kind){var i=n.type?a.getNamedType(n.type):void 0;n.fields=i instanceof a.GraphQLInputObjectType?i.getFields():null}else if("ObjectField"===t.kind){var u=t.name&&n.fields?n.fields[t.name]:null;n.type=u&&u.type}})),n}(f,t.state);if("Document"===i||"Variable"===i&&0===o){var s=Object.keys(f);return l.default(e,t,s.map((function(e){return{text:'"'+e+'": ',type:f[e]}})))}if(("ObjectValue"===i||"ObjectField"===i&&0===o)&&p.fields){var c=Object.keys(p.fields).map((function(e){return p.fields[e]}));return l.default(e,t,c.map((function(e){return{text:'"'+e.name+'": ',type:e.type,description:e.description}})))}if("StringValue"===i||"NumberValue"===i||"BooleanValue"===i||"NullValue"===i||"ListValue"===i&&1===o||"ObjectField"===i&&2===o||"Variable"===i&&2===o){var d=p.type?a.getNamedType(p.type):void 0;if(d instanceof a.GraphQLInputObjectType)return l.default(e,t,[{text:"{"}]);if(d instanceof a.GraphQLEnumType){var y=d.getValues();return l.default(e,t,y.map((function(e){return{text:'"'+e.name+'"',type:d,description:e.description}})))}if(d===a.GraphQLBoolean)return l.default(e,t,[{text:"true",type:a.GraphQLBoolean,description:"Not false."},{text:"false",type:a.GraphQLBoolean,description:"Not true."}])}}(n,r,t);return o&&o.list&&o.list.length>0&&(o.from=i.default.Pos(o.from.line,o.from.ch),o.to=i.default.Pos(o.to.line,o.to.ch),i.default.signal(e,"hasCompletion",e,o,r)),o}))}}]);
//# sourceMappingURL=316.0d05ae4d.chunk.js.map