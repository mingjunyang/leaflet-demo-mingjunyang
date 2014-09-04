/*搜索功能*/

function search1(text, GeoJSON, all) { //Filter this._recordsCache case insensitive and much more..
    console.log(text, GeoJSON, all)
    var regFilter = new RegExp("^[.]$|[\[\]|()*]", 'g'), //remove . * | ( ) ] [
        I, regSearch,
        frecords = {},
        b = []

    text = text.replace(regFilter, ''); //sanitize text
    I = all ? '^' : ''; //search only initial text
    //TODO add option for case sesitive search, also showLocation
    regSearch = new RegExp(I + text, 'i');
    for (var i = 0; i < GeoJSON.features.length; i++) {
        var temp = GeoJSON.features[i]
        var flag = false
        for (var key in temp.properties) {
            if (regSearch.test(temp.properties[key])) {
                frecords[key] = temp.properties[key];
                flag = true
            }
        }
        var tempa = calCenter(temp.geometry.coordinates[0])
        if (flag && tempa) {
            b.push(tempa)
        }
    }


    //TODO use .filter or .map

    console.log(frecords, b)
    return frecords;
}

function calCenter(array) {
    var a0 = 0,
        b0 = 0,
        len = array.length
    for (var i = 0; i < len; i++) {
        if (array[i]) {
            try {
                a0 += array[i][0]
                b0 += array[i][1]
            } catch (exceeption) {

            }
        }
    };


    return len > 0 ? [a0 / len, b0 / len] : null

}
