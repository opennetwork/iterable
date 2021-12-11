type WithoutFirst<T extends unknown[]> = ((...test: T) => void) extends ((away: unknown, ...rest: infer R) => void) ? R : never;
type GetLength<original extends unknown[]> = original extends { length: infer L } ? L : never;
export type LastIndex<T extends unknown[]> = GetLength<T> extends 1 ? 0 : GetLength<WithoutFirst<T>>;
type UnshiftOne<A extends unknown[]> = [1, ...A];
type Make<A extends unknown[], L extends number> = A["length"] extends L ? A : A["length"] extends 200 ? never : Make<UnshiftOne<A>, L>;

export type MinusOne<T extends number> = LastIndex<Make<[], T>>;
export type PlusOne<T extends number> = GetLength<UnshiftOne<Make<[], T>>>;

const z: MinusOne<4> = 3;
const a: PlusOne<5> = 6;

const Zero: MinusOne<1> = 0;
const FiftyFour: MinusOne<55> = 54;

const One: PlusOne<MinusOne<1>> = 1;
const FiftyFive: PlusOne<MinusOne<55>> = 55;

const TwoHundred: PlusOne<MinusOne<200>> = 200;
