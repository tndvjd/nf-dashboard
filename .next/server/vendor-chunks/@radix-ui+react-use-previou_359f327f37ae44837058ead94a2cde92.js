"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-use-previou_359f327f37ae44837058ead94a2cde92";
exports.ids = ["vendor-chunks/@radix-ui+react-use-previou_359f327f37ae44837058ead94a2cde92"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previou_359f327f37ae44837058ead94a2cde92/node_modules/@radix-ui/react-use-previous/dist/index.mjs":
/*!**************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@radix-ui+react-use-previou_359f327f37ae44837058ead94a2cde92/node_modules/@radix-ui/react-use-previous/dist/index.mjs ***!
  \**************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   usePrevious: () => (/* binding */ usePrevious)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@15.2.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js\");\n// packages/react/use-previous/src/usePrevious.tsx\n\nfunction usePrevious(value) {\n  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef({ value, previous: value });\n  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {\n    if (ref.current.value !== value) {\n      ref.current.previous = ref.current.value;\n      ref.current.value = value;\n    }\n    return ref.current.previous;\n  }, [value]);\n}\n\n//# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LXVzZS1wcmV2aW91XzM1OWYzMjdmMzdhZTQ0ODM3MDU4ZWFkOTRhMmNkZTkyL25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtdXNlLXByZXZpb3VzL2Rpc3QvaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDK0I7QUFDL0I7QUFDQSxjQUFjLHlDQUFZLEdBQUcsd0JBQXdCO0FBQ3JELFNBQVMsMENBQWE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUdFO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcdG5kdmpcXERvd25sb2Fkc1xccmVhbC1lc3RhdGUtZGFzaGJvYXJkICgyKVxcbm9kZV9tb2R1bGVzXFwucG5wbVxcQHJhZGl4LXVpK3JlYWN0LXVzZS1wcmV2aW91XzM1OWYzMjdmMzdhZTQ0ODM3MDU4ZWFkOTRhMmNkZTkyXFxub2RlX21vZHVsZXNcXEByYWRpeC11aVxccmVhY3QtdXNlLXByZXZpb3VzXFxkaXN0XFxpbmRleC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFja2FnZXMvcmVhY3QvdXNlLXByZXZpb3VzL3NyYy91c2VQcmV2aW91cy50c3hcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuZnVuY3Rpb24gdXNlUHJldmlvdXModmFsdWUpIHtcbiAgY29uc3QgcmVmID0gUmVhY3QudXNlUmVmKHsgdmFsdWUsIHByZXZpb3VzOiB2YWx1ZSB9KTtcbiAgcmV0dXJuIFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIGlmIChyZWYuY3VycmVudC52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgIHJlZi5jdXJyZW50LnByZXZpb3VzID0gcmVmLmN1cnJlbnQudmFsdWU7XG4gICAgICByZWYuY3VycmVudC52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVmLmN1cnJlbnQucHJldmlvdXM7XG4gIH0sIFt2YWx1ZV0pO1xufVxuZXhwb3J0IHtcbiAgdXNlUHJldmlvdXNcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previou_359f327f37ae44837058ead94a2cde92/node_modules/@radix-ui/react-use-previous/dist/index.mjs\n");

/***/ })

};
;