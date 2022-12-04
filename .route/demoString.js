const input = [2,2,2,2,4,4,4,4,3,3];
const sumDuplicate = arr => {
   const map = arr.reduce((acc, val) => {
      if(acc.has(val)){
         acc.set(val, acc.get(val) + 1);
      }else{
         acc.set(val, 1);
      };
      return acc;
   }, new Map());
   return Array.from(map, el => el[0] * el[1]);
};

console.log(sumDuplicate(input));