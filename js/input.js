const ERR_CHECKED_VAL = 100;
const REQUIRED_BATTLE3 = 3;

$('#regist_form').ready(function () {
    changeHeader(GAME_SELECTOR);
    $('input[name="date"]').val(
        (new Date()).toLocaleDateString(
            "ja-JP",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).replaceAll('/', '-'));
    createTrunRadioBox();
    createWLRadioBox();
    setupInputFrom();
});

$('input[name="rule"]').on('click', function () {
    switch (RULES[$(this).val()]) {
        case RULE_NORMAL:
            // 通常ルールなのでBO3用フォームは非表示
            $('.onlyBO3').addClass('nreq_input');
            $('.onlyBO3').removeClass('req_input');
            break;
        case RULE_BO3:
            // BO3なので2戦目用フォームは表示
            // 3戦目用フォームは1,2戦目の結果によるので非表示のまま
            $('[data-nresult="2"]').addClass('req_input');
            $('[data-nresult="2"]').removeClass('nreq_input');
            break;
        default:
            break;
    }
    changeRequired();
});

$('.winlose').change( function () {
    if (RULES[getCheckedVal('rule')] == RULE_NORMAL) {
        return;
    }
    changeResult3Form();
});

$('#regist_form').submit( function (event) {
    var idx, matchId, data;
    displayLoading();
    event.preventDefault();
    matchId = $('input[name="match_id"]').val();
    data = {
        [MATCHES_TABLES]: [{
            'id': matchId,
            'game_code': $('#game_selector').val(),
            'rule': getCheckedVal('rule'),
            'date': $('input[name="date"]').val(),
            'tag': $('input[name="tag"]').val(),
            'note':$('input[name="note"]').val(),
        },],
        [RESULTS_TABLES]:[],
    };
    $('.req_input').each(function () {
        idx = $(this).data('nresult');
        data[RESULTS_TABLES].push({
            'id': $(`input[name="result_id${idx}"]`).val(),
            'match_id': matchId,
            'winlose': getCheckedVal(`winlose${idx}`),
            'turn': getCheckedVal(`turn${idx}`),
            'mydeck': $(`input[name="mydeck${idx}"]`).val(),
            'enemydeck':$(`input[name="enemydeck${idx}"]`).val(),
        });
    });
    insertData(
        DB_NAME,
        data,
        () => {
            $('.radioDef').prop('checked', true);
            $('input[type="text"]').not('input[name="tag"]').val('');
            changeResult3Form();
            setupInputFrom();
        }
    );
    return false;
});


const CANDIDACY_TAG = 'candidacy_tag';
const CANDIDACY_DECK = 'candidacy_deck';
$('.triangle').on('click', function () {
    console.log($(this).siblings('input'));
    var putInput = $(this).siblings('input');
    var putTri = $(putInput).attr('name');
    console.log(`putTri:${putTri}`);
    $('.candidacy').hide();
    if (putTri == 'tag') {
        $(`.${CANDIDACY_TAG}`).show();
    } else if (putTri.includes('deck')) {
        $(`.${CANDIDACY_DECK}`).show();
    }
    $('.candidacy').off('click');
    $('.candidacy').on('click', function () {
        $(putInput).val($(this).text());
        closeCandidacyFrom();
    });
    $('#candidacy_form').show();
    $('#candidacy_area').slideToggle();
});

$('.door_bar').on('click', function () {
    closeCandidacyFrom();
})

function closeCandidacyFrom() {
    $('#candidacy_area').slideToggle(
        callback = () => { $('#candidacy_form').hide(); }
    );
}

function setupInputFrom() {
    var matchInfos = { 'ids': [], 'tags': [] };
    var resultInfos = { 'ids': [], 'decks': [] };
    var finGetMatchInfos = false;
    var finGetResulInfos = false;
    const setDisplay = () => {
        var hCandidacy;
        var newMatchId = aryMax(matchInfos['ids']) + 1;
        var newNResult = aryMax(resultInfos['ids']) + 1;
        $('input[name="match_id"]').val(newMatchId);
        $('input[name="result_id1"]').val(newNResult);
        $('input[name="result_id2"]').val(newNResult + 1);
        $('input[name="result_id3"]').val(newNResult + 2);
        changeRequired();

        for (var tag of matchInfos['tags']) {
            hCandidacy = $('#candidacy_template').clone(false).removeAttr('id');
            hCandidacy.text(tag);
            hCandidacy.addClass(CANDIDACY_TAG);
            hCandidacy.insertBefore('#candidacy_template');
        }
        for (var tag of resultInfos['decks']) {
            hCandidacy = $('#candidacy_template').clone(false).removeAttr('id');
            hCandidacy.text(tag);
            hCandidacy.addClass(CANDIDACY_DECK);
            hCandidacy.insertBefore('#candidacy_template');
        }
        undisplayLoading();
    };
    const getMatchInfos = (cursor) => {
        var tag = cursor.value.tag;
        matchInfos['ids'].push(cursor.value.id);
        if (!matchInfos['tags'].includes(tag)) matchInfos['tags'].push(tag);
    }
    const getResulInfos = (cursor) => {
        var deck;
        resultInfos['ids'].push(cursor.value.id);
        deck = cursor.value.mydeck;
        if (!resultInfos['decks'].includes(deck)) resultInfos['decks'].push(deck);
        deck = cursor.value.enemydeck;
        if (!resultInfos['decks'].includes(deck)) resultInfos['decks'].push(deck);
    }
    getFilteredData(DB_NAME, MATCHES_TABLES, getMatchInfos, () => { finGetMatchInfos = true; });
    getFilteredData(DB_NAME, RESULTS_TABLES, getResulInfos, () => { finGetResulInfos = true; });
    wait(() => { return finGetMatchInfos&&finGetResulInfos}, setDisplay);
}

function changeRequired() {
    $('.req_input input[type="text"]').prop('required', true);
    $('.nreq_input input[type="text"]').prop('required', false);
    switch (RULES[getCheckedVal('rule')]) {
        case RULE_NORMAL:
            $('.onlyBO3').hide();
            break;
        case RULE_BO3:
            $('.onlyBO3:not(.nreq_input)').show();
        default:
            break;
    }
}

function getCheckedVal(name) {
    var val = ERR_CHECKED_VAL;
    $(`input[name="${name}"]`).each(function () {
        if ($(this).prop('checked')) {
            val = parseInt($(this).val());
            return;
        }
    });
    return val;
}

function changeResult3Form() {
    var totalWinLose = 0;
    totalWinLose += getCheckedVal('winlose1');
    totalWinLose += getCheckedVal('winlose2');
    switch (totalWinLose) {
        case REQUIRED_BATTLE3:
            $('[data-nresult="3"]').addClass('req_input');
            $('[data-nresult="3"]').removeClass('nreq_input');
            break;
        default:
            $('[data-nresult="3"]').addClass('nreq_input');
            $('[data-nresult="3"]').removeClass('req_input');
            break;
    }
    changeRequired();
}

function createRadioBox( toClass, name, content) {
    /*
    最終系イメージ
    <label class="label">
        <input type="radio" name="turn1" value="1" class="radioDef" checked />
        <span>先攻</span>
    </label>
    */
    // 追加先は以下の要素は削除
    $(`.${toClass}`).empty();
    const label = $('<label>', { 'class': 'label' });
    var hLabel, hInput, hSpan;
    for (var val in content) {
        hLabel = $('<label>', { 'class': 'label' });
        hInput = $('<input>', {
            'type': 'radio',
            'name': name,
            'value':val,
        });
        if (content[val]['radioDef']) {
            hInput.addClass('radioDef');
            hInput.prop('checked',true)
        }
        hSpan = $('<span>').text(content[val]['display']);
        hInput.appendTo(hLabel);
        hSpan.appendTo(hLabel);
        hLabel.appendTo(`.${toClass}`);
    }
}

function createTrunRadioBox() {
    for (var i = 1; i < 4; i++){
        createRadioBox(`turn_area${i}`, `turn${i}`, TURN);
    }
}

function createWLRadioBox() {
    for (var i = 1; i < 4; i++){
        createRadioBox(`winlose_area${i}`, `winlose${i}`, TURN);
    }
}