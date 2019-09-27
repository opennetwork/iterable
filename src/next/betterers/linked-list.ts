import { Betterer } from "@betterer/betterer/dist/types";
import { isLinkedListLike as isLinkedListLikeFn } from "../goal/linked-list";

const isLinkedListLike: Betterer<boolean> = {
  test() {
    return isLinkedListLikeFn({
      delete() {},
      get() {},
      splice() {},
      clear() {}
    });
  },
  constraint(value) {
    return value;
  },
  goal: true
};

export default {
  "isLinkedListLike": isLinkedListLike
};
