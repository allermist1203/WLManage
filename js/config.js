const GAMES = {
    'ba': 'バトスピ'
};

const DL_JSON_NAME = 'wlmapp.json'

const RULE_NORMAL = 'BO1';
const RULE_BO3 = 'BO3';
const RULES = {
    '1': RULE_NORMAL,
    '2': RULE_BO3,
}

const TURN = {
    '1': { 'list': '先', 'display': '先攻', 'radioDef':true },
    '2': { 'list': '後', 'display': '後攻', 'radioDef':false },
    '3': { 'list': '不', 'display': '不明', 'radioDef':false },
}
const WINLOSE = {
    '1': { 'list': '勝', 'display': '勝ち', 'radioDef':true },
    '2': { 'list': '負', 'display': '負け', 'radioDef':false },
}
const NOTE = {
    [true] : '有',
    [false] : '無',
}

const HTMLS = {
    'input': './html/input.html',
    'statistics':'./html/statistics.html',
    'list':'./html/list.html',
}

const MESSGES = {
    'error': '予期せぬエラーが発生しました。',
    'data_out': 'データを出力しますか?',
    'data_in': 'データを復元しますか?<br>※データは上書きされます',
    'deal_OK': '処理が完了しました',
}

const WAIT_SECOND = 1;
const MAX_WAIT_SECOND = 60;
const MAX_WAIT = MAX_WAIT_SECOND/WAIT_SECOND;