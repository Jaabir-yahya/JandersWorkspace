"use strict";exports.id=245,exports.ids=[245],exports.modules={7862:(e,t,r)=>{r.d(t,{z:()=>s});var a=r(326),o=r(7577),i=r(7863);let s=o.forwardRef(({className:e,variant:t="primary",size:r="md",loading:o=!1,shortcut:s,disabled:n,children:l,...d},c)=>(0,a.jsxs)("button",{ref:c,disabled:n||o,className:(0,i.cn)("inline-flex items-center justify-center gap-2 rounded-lg font-medium","transition-colors duration-200","focus:outline-none focus:ring-2 focus:ring-offset-2","disabled:opacity-50 disabled:pointer-events-none",{primary:"bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500",secondary:"bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400 focus:ring-neutral-500",danger:"bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 focus:ring-danger-500",ghost:"bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-500",link:"bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500"}[t],{sm:"h-9 px-3 text-sm",md:"h-11 px-4 text-base",lg:"h-12 px-6 text-lg"}[r],e),...d,children:[o&&(0,a.jsxs)("svg",{className:"animate-spin h-4 w-4",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[a.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),a.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),l,s&&a.jsx("kbd",{className:"ml-auto text-xs opacity-60 font-mono bg-black/10 px-1.5 py-0.5 rounded",children:s})]}));s.displayName="Button"},2262:(e,t,r)=>{r.d(t,{Ol:()=>i,Zb:()=>o,eW:()=>s});var a=r(326);function o({children:e,interactive:t=!1,className:r="",...o}){return a.jsx("div",{className:`
        bg-white rounded-xl border border-baobab-200 shadow-sm
        ${t?"cursor-pointer hover:shadow-md hover:border-acacia-300 hover:-translate-y-0.5 transition-all duration-200":""}
        ${r}
      `,...o,children:e})}function i({children:e,className:t="",...r}){return a.jsx("div",{className:`px-6 py-4 border-b border-baobab-200 ${t}`,...r,children:e})}function s({children:e,className:t="",...r}){return a.jsx("div",{className:`px-6 py-4 ${t}`,...r,children:e})}},7320:(e,t,r)=>{r.d(t,{I:()=>s});var a=r(326),o=r(7577),i=r(7863);let s=o.forwardRef(({className:e,type:t,label:r,error:o,helperText:s,icon:n,rightIcon:l,disabled:d,...c},u)=>(0,a.jsxs)("div",{className:"w-full",children:[r&&(0,a.jsxs)("label",{className:"block text-sm font-medium text-neutral-700 mb-1.5",children:[r,c.required&&a.jsx("span",{className:"text-danger-500 ml-1",children:"*"})]}),(0,a.jsxs)("div",{className:"relative",children:[n&&a.jsx("div",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400",children:n}),a.jsx("input",{type:t,className:(0,i.cn)("flex h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base","placeholder:text-neutral-400","focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent","disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100","transition-colors duration-200",n&&"pl-10",l&&"pr-10",o&&"border-danger-500 focus:ring-danger-500","number"===t&&"currency-input",e),ref:u,disabled:d,...c}),l&&a.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400",children:l})]}),o&&a.jsx("p",{className:"mt-1.5 text-sm text-danger-600",children:o}),s&&!o&&a.jsx("p",{className:"mt-1.5 text-sm text-neutral-500",children:s})]}));s.displayName="Input"},3536:(e,t,r)=>{r.d(t,{P:()=>o});var a=r(326);let o=(0,r(7577).forwardRef)(({label:e,error:t,hint:r,options:o,className:i="",...s},n)=>(0,a.jsxs)("div",{className:"w-full",children:[e&&(0,a.jsxs)("label",{className:"block text-sm font-medium text-baobab-700 mb-2",children:[e,s.required&&a.jsx("span",{className:"text-clay-600 ml-1",children:"*"})]}),a.jsx("select",{ref:n,className:`
            w-full px-4 py-3 bg-white border rounded-lg text-baobab-900 
            transition-all duration-200
            hover:border-baobab-300 
            focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 focus:outline-none
            disabled:bg-baobab-50 disabled:cursor-not-allowed
            ${t?"border-clay-500 focus:border-clay-500 focus:ring-clay-200":"border-baobab-200"}
            ${i}
          `,...s,children:o.map(e=>a.jsx("option",{value:e.value,children:e.label},e.value))}),t&&a.jsx("p",{className:"mt-1.5 text-sm text-clay-600",children:t}),r&&!t&&a.jsx("p",{className:"mt-1.5 text-sm text-baobab-500",children:r})]}));o.displayName="Select"},7863:(e,t,r)=>{r.d(t,{BD:()=>x,X$:()=>b,_$:()=>f,cn:()=>l,p6:()=>u,rl:()=>m,uf:()=>p,xG:()=>c,zX:()=>g});var a=r(2592),o=r(1009),i=r(4629),s=r(8206),n=r(5911);function l(...e){return(0,o.m6)((0,a.W)(e))}let d={KES:{code:"KES",symbol:"KSh",name:"Kenyan Shilling",decimals:2},USD:{code:"USD",symbol:"$",name:"US Dollar",decimals:2},EUR:{code:"EUR",symbol:"€",name:"Euro",decimals:2},GBP:{code:"GBP",symbol:"\xa3",name:"British Pound",decimals:2},UGX:{code:"UGX",symbol:"USh",name:"Ugandan Shilling",decimals:0},TZS:{code:"TZS",symbol:"TSh",name:"Tanzanian Shilling",decimals:0},RWF:{code:"RWF",symbol:"RF",name:"Rwandan Franc",decimals:0}};function c(e,t="KES",r={}){let{showSymbol:a=!0,showCode:o=!1}=r,i=d[t],s=new Intl.NumberFormat("en-KE",{minimumFractionDigits:i.decimals,maximumFractionDigits:i.decimals}).format(e);return a&&o?`${i.symbol} ${s} ${i.code}`:a?`${i.symbol} ${s}`:o?`${s} ${i.code}`:s}function u(e,t="dd MMM yyyy"){let r="string"==typeof e?(0,i.D)(e):e;return(0,s.J)(r)?(0,n.WU)(r,t):"Invalid date"}function m(e,t=1){return isNaN(e)?"0%":`${e.toFixed(t)}%`}function p(e,t=0){return isNaN(e)?"0":e.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})}function b(){return(0,n.WU)(new Date,"yyyy-MM-dd")}function f(e){let t=Date.now().toString().slice(-6),r=Math.random().toString(36).substr(2,4).toUpperCase();return`${e}-${t}-${r}`}function g(e){return e.reduce((e,t)=>e+t.quantity*(t.unitPrice??t.unitCost??0),0)}function x(e,t="export"){if(0===e.length){alert("No data to export");return}let r=Object.keys(e[0]);!function(e,t){let r=URL.createObjectURL(e),a=document.createElement("a");a.href=r,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(r)}(new Blob([[r.join(","),...e.map(e=>r.map(t=>{let r=e[t];return"string"==typeof r&&(r.includes(",")||r.includes('"'))?`"${r.replace(/"/g,'""')}"`:r??""}).join(","))].join("\n")],{type:"text/csv;charset=utf-8;"}),`${t}.csv`)}},1215:(e,t,r)=>{r.d(t,{Z:()=>a});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(6557).Z)("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]])},2725:(e,t,r)=>{r.d(t,{ZP:()=>K});var a,o=r(7577);let i={data:""},s=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,c=(e,t)=>{let r="",a="",o="";for(let i in e){let s=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+s+";":a+="f"==i[1]?c(s,i):i+"{"+c(s,"k"==i[1]?"":t)+"}":"object"==typeof s?a+=c(s,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=s&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=c.p?c.p(i,s):i+":"+s+";")}return r+(t&&o?t+"{"+o+"}":o)+a},u={},m=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+m(e[r]);return t}return e},p=(e,t,r,a,o)=>{let i=m(e),s=u[i]||(u[i]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(i));if(!u[s]){let t=i!==e?e:(e=>{let t,r,a=[{}];for(;t=n.exec(e.replace(l,""));)t[4]?a.shift():t[3]?(r=t[3].replace(d," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(d," ").trim();return a[0]})(e);u[s]=c(o?{["@keyframes "+s]:t}:t,r?"":"."+s)}let p=r&&u.g?u.g:null;return r&&(u.g=u[s]),((e,t,r,a)=>{a?t.data=t.data.replace(a,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(u[s],t,a,p),s},b=(e,t,r)=>e.reduce((e,a,o)=>{let i=t[o];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function f(e){let t=this||{},r=e.call?e(t.p):e;return p(r.unshift?r.raw?b(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,s(t.target),t.g,t.o,t.k)}f.bind({g:1});let g,x,h,y=f.bind({k:1});function v(e,t){let r=this||{};return function(){let a=arguments;function o(i,s){let n=Object.assign({},i),l=n.className||o.className;r.p=Object.assign({theme:x&&x()},n),r.o=/ *go\d+/.test(l),n.className=f.apply(r,a)+(l?" "+l:""),t&&(n.ref=s);let d=e;return e[0]&&(d=n.as||e,delete n.as),h&&d[0]&&h(n),g(d,n)}return t?t(o):o}}var w=e=>"function"==typeof e,j=(e,t)=>w(e)?e(t):e,N=(()=>{let e=0;return()=>(++e).toString()})(),$=((()=>{let e;return()=>e})(),"default"),k=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return k(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},S=[],U={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},D={},F=(e,t=$)=>{D[t]=k(D[t]||U,e),S.forEach(([e,r])=>{e===t&&r(D[t])})},z=e=>Object.keys(D).forEach(t=>F(e,t)),R=e=>Object.keys(D).find(t=>D[t].toasts.some(t=>t.id===e)),E=(e=$)=>t=>{F(t,e)},C={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},O=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||N()}),A=e=>(t,r)=>{let a=O(t,e,r);return E(a.toasterId||R(a.id))({type:2,toast:a}),a.id},I=(e,t)=>A("blank")(e,t);I.error=A("error"),I.success=A("success"),I.loading=A("loading"),I.custom=A("custom"),I.dismiss=(e,t)=>{let r={type:3,toastId:e};t?E(t)(r):z(r)},I.dismissAll=e=>I.dismiss(void 0,e),I.remove=(e,t)=>{let r={type:4,toastId:e};t?E(t)(r):z(r)},I.removeAll=e=>I.remove(void 0,e),I.promise=(e,t,r)=>{let a=I.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?j(t.success,e):void 0;return o?I.success(o,{id:a,...r,...null==r?void 0:r.success}):I.dismiss(a),e}).catch(e=>{let o=t.error?j(t.error,e):void 0;o?I.error(o,{id:a,...r,...null==r?void 0:r.error}):I.dismiss(a)}),e};var L=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,M=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,_=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,B=(v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${L} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${M} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${_} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`),P=(v("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${B} 1s linear infinite;
`,y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),W=y`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Z=(v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${P} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${W} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,v("div")`
  position: absolute;
`,v("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,y`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`);v("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Z} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,v("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,v("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,a=o.createElement,c.p=void 0,g=a,x=void 0,h=void 0,f`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var K=I}};