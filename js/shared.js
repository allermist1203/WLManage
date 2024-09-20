async function wait(second) {
    return new Promise(resolve => setTimeout(resolve, 1000 * second));
}

function undisplayLoading() {
    $('#loading').css('display', 'none');
}

function displayLoading() {
    $('#loading').css('display', 'flex');
}

function aryMin( ary) {
    return ary.reduce((a, b) => { return Math.min(a, b) });
}

function dictKeyDecSort(dictAry) {
    var dictKeys = Object.keys(dictAry);
    if (dictKeys.every(v => isFinite(v))) {
        return dictKeys.sort((a,b) => (b-a));
    } else {
        return dictKeys.sort((a,b) => (a > b ? -1 : 1));
    }
}

const GAME_SELECTOR = 1
const OTHER_HEADER = 2
function changeHeader( mode, headerTitle='') {
    switch (mode) {
        case GAME_SELECTOR:
            $('#game_selector').css('display', '');
            $('#non_selector').css('display', 'none');
            break;
        case OTHER_HEADER:
            $('#game_selector').css('display', 'none');
            $('#non_selector').css('display', '');
            break;
        default:
            break;
    }
    $('#non_selector').text(headerTitle);
}

async function confirm(msg,callbackFunc) {
    Swal.fire({
        html: msg,
        showCancelButton: true,
        width: '80%',
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then((result) => {
        if (result.isConfirmed) callbackFunc();
    });
}

async function dialog(msg, callbackFunc = () => { }) {
    Swal.fire({
        html: msg,
        width: '80%',
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then((result) => {
        if (result.isConfirmed) callbackFunc();
    });
}

async function jsonUpload( callbackFunc){
    const { value: file } = await Swal.fire({
        width: '80%',
        input: "file",
        inputAttributes: {
            "accept": "application/json",
        }
    });
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            callbackFunc(JSON.parse(e.target.result));
        };
        reader.readAsText(file);
    }
}