(self.webpackChunkgrphi1=self.webpackChunkgrphi1||[]).push([[190,322],{8190:function(t,e,i){"use strict";var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var o=n(i(1300));i(2322);var s=i(21);o.default.registerHelper("hint","graphql",(function(t,e){var i=e.schema;if(i){var n=t.getCursor(),r=t.getTokenAt(n),c=null!==r.type&&/"|\w/.test(r.string[0])?r.start:r.end,l=new s.Position(n.line,c),h={list:s.getAutocompleteSuggestions(i,t.getValue(),l,r,e.externalFragments).map((function(t){return{text:t.label,type:t.type,description:t.documentation,isDeprecated:t.isDeprecated,deprecationReason:t.deprecationReason}})),from:{line:n.line,ch:c},to:{line:n.line,ch:r.end}};return h&&h.list&&h.list.length>0&&(h.from=o.default.Pos(h.from.line,h.from.ch),h.to=o.default.Pos(h.to.line,h.to.ch),o.default.signal(t,"hasCompletion",t,h,r)),h}}))},2322:function(t,e,i){!function(t){"use strict";var e="CodeMirror-hint",i="CodeMirror-hint-active";function n(t,e){if(this.cm=t,this.options=e,this.widget=null,this.debounce=0,this.tick=0,this.startPos=this.cm.getCursor("start"),this.startLen=this.cm.getLine(this.startPos.line).length-this.cm.getSelection().length,this.options.updateOnCursorActivity){var i=this;t.on("cursorActivity",this.activityFunc=function(){i.cursorActivity()})}}t.showHint=function(t,e,i){if(!e)return t.showHint(i);i&&i.async&&(e.async=!0);var n={hint:e};if(i)for(var o in i)n[o]=i[o];return t.showHint(n)},t.defineExtension("showHint",(function(e){e=r(this,this.getCursor("start"),e);var i=this.listSelections();if(!(i.length>1)){if(this.somethingSelected()){if(!e.hint.supportsSelection)return;for(var o=0;o<i.length;o++)if(i[o].head.line!=i[o].anchor.line)return}this.state.completionActive&&this.state.completionActive.close();var s=this.state.completionActive=new n(this,e);s.options.hint&&(t.signal(this,"startCompletion",this),s.update(!0))}})),t.defineExtension("closeHint",(function(){this.state.completionActive&&this.state.completionActive.close()}));var o=window.requestAnimationFrame||function(t){return setTimeout(t,1e3/60)},s=window.cancelAnimationFrame||clearTimeout;function r(t,e,i){var n=t.options.hintOptions,o={};for(var s in p)o[s]=p[s];if(n)for(var s in n)void 0!==n[s]&&(o[s]=n[s]);if(i)for(var s in i)void 0!==i[s]&&(o[s]=i[s]);return o.hint.resolve&&(o.hint=o.hint.resolve(t,e)),o}function c(t){return"string"==typeof t?t:t.text}function l(t,e){var i={Up:function(){e.moveFocus(-1)},Down:function(){e.moveFocus(1)},PageUp:function(){e.moveFocus(1-e.menuSize(),!0)},PageDown:function(){e.moveFocus(e.menuSize()-1,!0)},Home:function(){e.setFocus(0)},End:function(){e.setFocus(e.length-1)},Enter:e.pick,Tab:e.pick,Esc:e.close};/Mac/.test(navigator.platform)&&(i["Ctrl-P"]=function(){e.moveFocus(-1)},i["Ctrl-N"]=function(){e.moveFocus(1)});var n=t.options.customKeys,o=n?{}:i;function s(t,n){var s;s="string"!=typeof n?function(t){return n(t,e)}:i.hasOwnProperty(n)?i[n]:n,o[t]=s}if(n)for(var r in n)n.hasOwnProperty(r)&&s(r,n[r]);var c=t.options.extraKeys;if(c)for(var r in c)c.hasOwnProperty(r)&&s(r,c[r]);return o}function h(t,e){for(;e&&e!=t;){if("LI"===e.nodeName.toUpperCase()&&e.parentNode==t)return e;e=e.parentNode}}function a(n,o){this.id="cm-complete-"+Math.floor(Math.random(1e6)),this.completion=n,this.data=o,this.picked=!1;var s=this,r=n.cm,a=r.getInputField().ownerDocument,u=a.defaultView||a.parentWindow,f=this.hints=a.createElement("ul");f.setAttribute("role","listbox"),f.setAttribute("aria-expanded","true"),f.id=this.id;var d=n.cm.options.theme;f.className="CodeMirror-hints "+d,this.selectedHint=o.selectedHint||0;for(var p=o.list,m=0;m<p.length;++m){var g=f.appendChild(a.createElement("li")),v=p[m],y=e+(m!=this.selectedHint?"":" "+i);null!=v.className&&(y=v.className+" "+y),g.className=y,m==this.selectedHint&&g.setAttribute("aria-selected","true"),g.id=this.id+"-"+m,g.setAttribute("role","option"),v.render?v.render(g,o,v):g.appendChild(a.createTextNode(v.displayText||c(v))),g.hintId=m}var w=n.options.container||a.body,b=r.cursorCoords(n.options.alignWithWord?o.from:null),A=b.left,H=b.bottom,C=!0,k=0,x=0;if(w!==a.body){var S=-1!==["absolute","relative","fixed"].indexOf(u.getComputedStyle(w).position)?w:w.offsetParent,T=S.getBoundingClientRect(),F=a.body.getBoundingClientRect();k=T.left-F.left-S.scrollLeft,x=T.top-F.top-S.scrollTop}f.style.left=A-k+"px",f.style.top=H-x+"px";var M=u.innerWidth||Math.max(a.body.offsetWidth,a.documentElement.offsetWidth),O=u.innerHeight||Math.max(a.body.offsetHeight,a.documentElement.offsetHeight);w.appendChild(f),r.getInputField().setAttribute("aria-autocomplete","list"),r.getInputField().setAttribute("aria-owns",this.id),r.getInputField().setAttribute("aria-activedescendant",this.id+"-"+this.selectedHint);var N,P=n.options.moveOnOverlap?f.getBoundingClientRect():new DOMRect,I=!!n.options.paddingForScrollbar&&f.scrollHeight>f.clientHeight+1;if(setTimeout((function(){N=r.getScrollInfo()})),P.bottom-O>0){var E=P.bottom-P.top;if(b.top-(b.bottom-P.top)-E>0)f.style.top=(H=b.top-E-x)+"px",C=!1;else if(E>O){f.style.height=O-5+"px",f.style.top=(H=b.bottom-P.top-x)+"px";var R=r.getCursor();o.from.ch!=R.ch&&(b=r.cursorCoords(R),f.style.left=(A=b.left-k)+"px",P=f.getBoundingClientRect())}}var W,B=P.right-M;if(I&&(B+=r.display.nativeBarWidth),B>0&&(P.right-P.left>M&&(f.style.width=M-5+"px",B-=P.right-P.left-M),f.style.left=(A=b.left-B-k)+"px"),I)for(var K=f.firstChild;K;K=K.nextSibling)K.style.paddingRight=r.display.nativeBarWidth+"px";r.addKeyMap(this.keyMap=l(n,{moveFocus:function(t,e){s.changeActive(s.selectedHint+t,e)},setFocus:function(t){s.changeActive(t)},menuSize:function(){return s.screenAmount()},length:p.length,close:function(){n.close()},pick:function(){s.pick()},data:o})),n.options.closeOnUnfocus&&(r.on("blur",this.onBlur=function(){W=setTimeout((function(){n.close()}),100)}),r.on("focus",this.onFocus=function(){clearTimeout(W)})),r.on("scroll",this.onScroll=function(){var t=r.getScrollInfo(),e=r.getWrapperElement().getBoundingClientRect();N||(N=r.getScrollInfo());var i=H+N.top-t.top,o=i-(u.pageYOffset||(a.documentElement||a.body).scrollTop);if(C||(o+=f.offsetHeight),o<=e.top||o>=e.bottom)return n.close();f.style.top=i+"px",f.style.left=A+N.left-t.left+"px"}),t.on(f,"dblclick",(function(t){var e=h(f,t.target||t.srcElement);e&&null!=e.hintId&&(s.changeActive(e.hintId),s.pick())})),t.on(f,"click",(function(t){var e=h(f,t.target||t.srcElement);e&&null!=e.hintId&&(s.changeActive(e.hintId),n.options.completeOnSingleClick&&s.pick())})),t.on(f,"mousedown",(function(){setTimeout((function(){r.focus()}),20)}));var L=this.getSelectedHintRange();return 0===L.from&&0===L.to||this.scrollToActive(),t.signal(o,"select",p[this.selectedHint],f.childNodes[this.selectedHint]),!0}function u(t,e){if(!t.somethingSelected())return e;for(var i=[],n=0;n<e.length;n++)e[n].supportsSelection&&i.push(e[n]);return i}function f(t,e,i,n){if(t.async)t(e,n,i);else{var o=t(e,i);o&&o.then?o.then(n):n(o)}}function d(e,i){var n,o=e.getHelpers(i,"hint");if(o.length){var s=function(t,e,i){var n=u(t,o);function s(o){if(o==n.length)return e(null);f(n[o],t,i,(function(t){t&&t.list.length>0?e(t):s(o+1)}))}s(0)};return s.async=!0,s.supportsSelection=!0,s}return(n=e.getHelper(e.getCursor(),"hintWords"))?function(e){return t.hint.fromList(e,{words:n})}:t.hint.anyword?function(e,i){return t.hint.anyword(e,i)}:function(){}}n.prototype={close:function(){this.active()&&(this.cm.state.completionActive=null,this.tick=null,this.options.updateOnCursorActivity&&this.cm.off("cursorActivity",this.activityFunc),this.widget&&this.data&&t.signal(this.data,"close"),this.widget&&this.widget.close(),t.signal(this.cm,"endCompletion",this.cm))},active:function(){return this.cm.state.completionActive==this},pick:function(e,i){var n=e.list[i],o=this;this.cm.operation((function(){n.hint?n.hint(o.cm,e,n):o.cm.replaceRange(c(n),n.from||e.from,n.to||e.to,"complete"),t.signal(e,"pick",n),o.cm.scrollIntoView()})),this.options.closeOnPick&&this.close()},cursorActivity:function(){this.debounce&&(s(this.debounce),this.debounce=0);var t=this.startPos;this.data&&(t=this.data.from);var e=this.cm.getCursor(),i=this.cm.getLine(e.line);if(e.line!=this.startPos.line||i.length-e.ch!=this.startLen-this.startPos.ch||e.ch<t.ch||this.cm.somethingSelected()||!e.ch||this.options.closeCharacters.test(i.charAt(e.ch-1)))this.close();else{var n=this;this.debounce=o((function(){n.update()})),this.widget&&this.widget.disable()}},update:function(t){if(null!=this.tick){var e=this,i=++this.tick;f(this.options.hint,this.cm,this.options,(function(n){e.tick==i&&e.finishUpdate(n,t)}))}},finishUpdate:function(e,i){this.data&&t.signal(this.data,"update");var n=this.widget&&this.widget.picked||i&&this.options.completeSingle;this.widget&&this.widget.close(),this.data=e,e&&e.list.length&&(n&&1==e.list.length?this.pick(e,0):(this.widget=new a(this,e),t.signal(e,"shown")))}},a.prototype={close:function(){if(this.completion.widget==this){this.completion.widget=null,this.hints.parentNode&&this.hints.parentNode.removeChild(this.hints),this.completion.cm.removeKeyMap(this.keyMap);var t=this.completion.cm.getInputField();t.removeAttribute("aria-activedescendant"),t.removeAttribute("aria-owns");var e=this.completion.cm;this.completion.options.closeOnUnfocus&&(e.off("blur",this.onBlur),e.off("focus",this.onFocus)),e.off("scroll",this.onScroll)}},disable:function(){this.completion.cm.removeKeyMap(this.keyMap);var t=this;this.keyMap={Enter:function(){t.picked=!0}},this.completion.cm.addKeyMap(this.keyMap)},pick:function(){this.completion.pick(this.data,this.selectedHint)},changeActive:function(e,n){if(e>=this.data.list.length?e=n?this.data.list.length-1:0:e<0&&(e=n?0:this.data.list.length-1),this.selectedHint!=e){var o=this.hints.childNodes[this.selectedHint];o&&(o.className=o.className.replace(" "+i,""),o.removeAttribute("aria-selected")),(o=this.hints.childNodes[this.selectedHint=e]).className+=" "+i,o.setAttribute("aria-selected","true"),this.completion.cm.getInputField().setAttribute("aria-activedescendant",o.id),this.scrollToActive(),t.signal(this.data,"select",this.data.list[this.selectedHint],o)}},scrollToActive:function(){var t=this.getSelectedHintRange(),e=this.hints.childNodes[t.from],i=this.hints.childNodes[t.to],n=this.hints.firstChild;e.offsetTop<this.hints.scrollTop?this.hints.scrollTop=e.offsetTop-n.offsetTop:i.offsetTop+i.offsetHeight>this.hints.scrollTop+this.hints.clientHeight&&(this.hints.scrollTop=i.offsetTop+i.offsetHeight-this.hints.clientHeight+n.offsetTop)},screenAmount:function(){return Math.floor(this.hints.clientHeight/this.hints.firstChild.offsetHeight)||1},getSelectedHintRange:function(){var t=this.completion.options.scrollMargin||0;return{from:Math.max(0,this.selectedHint-t),to:Math.min(this.data.list.length-1,this.selectedHint+t)}}},t.registerHelper("hint","auto",{resolve:d}),t.registerHelper("hint","fromList",(function(e,i){var n,o=e.getCursor(),s=e.getTokenAt(o),r=t.Pos(o.line,s.start),c=o;s.start<o.ch&&/\w/.test(s.string.charAt(o.ch-s.start-1))?n=s.string.substr(0,o.ch-s.start):(n="",r=o);for(var l=[],h=0;h<i.words.length;h++){var a=i.words[h];a.slice(0,n.length)==n&&l.push(a)}if(l.length)return{list:l,from:r,to:c}})),t.commands.autocomplete=t.showHint;var p={hint:t.hint.auto,completeSingle:!0,alignWithWord:!0,closeCharacters:/[\s()\[\]{};:>,]/,closeOnPick:!0,closeOnUnfocus:!0,updateOnCursorActivity:!0,completeOnSingleClick:!0,container:null,customKeys:null,extraKeys:null,paddingForScrollbar:!0,moveOnOverlap:!0};t.defineOption("hintOptions",null)}(i(1300))}}]);
//# sourceMappingURL=190.1a5681ff.chunk.js.map