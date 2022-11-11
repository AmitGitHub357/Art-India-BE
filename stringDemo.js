function dis(str) {
    let cnt = [];
    let check = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    for (var i = 0; i < check.length; i++) {
        for(var j = 0; j < str.length; j++) {
            if (str[i] === check[j]) {
                cnt.push(check[j]);
            }
        }
    }
    console.log(cnt)
}
var str = 'loremipsumdolorsitametconsecteturadipisicingelitminusrepudiandaenisiofficiatemporibusmollitiaveroquaeratnostrumdoloresautdictaconsequunturmodiilloasperioresnequesintmagnamreprehenderitautemlaboriosam'
console.log(dis(str));