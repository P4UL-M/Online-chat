var inderdit = [":", "/", "+", "*", ",", ";", "!", "?", "£", "$", "¤", "µ", "%", "}", "{", "[", "]", "&", "=", "#", "§", '"'];
var Txt_pseudo = document.getElementById("pseudo");;

document.addEventListener('keypress', function (e) {
    value = String.fromCharCode(e.keyCode);
    if (inderdit.includes(value)) {
        e.preventDefault()
    }
});

var inderdit = [":","/","+","*",",",";","!","?","£","$","¤","µ","%","}","{","[","]","&","=","#","§",'"',"'"];

function setCookie(cName, cValue, expDays) {
        let date = new Date();
        date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = cName + "=" + cValue + "; " + expires + "; secure=True;";
}

document.addEventListener('submit',function (e){
    e.preventDefault()

    var pseudo = Txt_pseudo.value;
    pseudo = pseudo.replace(" ","_");
    pseudo = pseudo.replace(inderdit,"");
    pseudo = pseudo.substring(0,23)
    
    if (pseudo.length==0) {
        Txt_pseudo.value = "";
    }
    else {
        setCookie("pseudo",pseudo,365)
        document.location.href="channel";
    }
});