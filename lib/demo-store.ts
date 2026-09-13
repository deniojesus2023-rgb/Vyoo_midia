import {seed, type State} from "@/lib/model";

type Store={state:State;version:number};
const root=globalThis as typeof globalThis&{__vyooStore?:Store;__vyooMedia?:Map<string,{bytes:ArrayBuffer;type:string}>};

export const demoStore=()=>root.__vyooStore??=(
  {state:structuredClone(seed),version:0}
);

export const mediaStore=()=>root.__vyooMedia??=new Map();
