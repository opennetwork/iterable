// import { WeakList } from "../dist/core";
// import { ok } from "assert";
//
// const a1 = {};
// const a2 = {};
// const a3 = {};
// const a4 = {};
// const a5 = {};
// const a6 = {};
// const a7 = {};
// const a8 = {};
//
// const list = WeakList.from([a1, a2, a3]);
//
// // Will contain a1 - a2, a3 is final index and is no included
// const slice = list.slice(a1, a3);
//
// ok(slice.next(a1).value === a2);
// ok(slice.next(a2).done === true);
// // Anything outside of the range will always return done
// ok(slice.next(a3).done === true);
//
// const splicedList1 = WeakList.from([a1, a2, a3, a4, a5]);
//
// const removed1 = splicedList1.splice(a2, 2);
//
// console.log(removed1[0] === a2, removed1[0] === a1, removed1[0] === a3);
// // Removed will be a2 and a3
// ok(removed1[0] === a2);
// ok(removed1[1] === a3);
// ok(removed1.length === 2);
//
// console.log(splicedList1.next(a1).value === a5);
//
// // The next element after a1 will be a4
// ok(splicedList1.next(a1).value === a4);
// ok(splicedList1.next(a4).value === a5);
// ok(splicedList1.next(a5).done === true);
//
// const splicedList2 = WeakList.from([a1, a2, a3, a4, a5]);
//
// const removed2 = splicedList2.splice(a2, 2, a6, a7, a8);
//
// // Removed will be a2 and a3
// ok(removed2[0] === a2);
// ok(removed2[1] === a3);
// ok(removed2.length === 2);
//
// // The next element after a1 will be a6, a7, a8, then a4
// ok(splicedList2.next(a1).value === a6);
// ok(splicedList2.next(a6).value === a7);
// ok(splicedList2.next(a7).value === a8);
// ok(splicedList2.next(a8).value === a4);
// ok(splicedList2.next(a4).value === a5);
// ok(splicedList2.next(a5).done === true);
//
// console.log("Complete");
