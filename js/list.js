

function getDataByEvent(game_code) {
    var matches = {};
    var matchesFilter = (cursor) => {
        if ( cursor.value.game_code == game_code ) {
            matches[cursor.value.id] = {
                'rule': cursor.value.rule,
                'date': cursor.value.date,
                'tag': cursor.value.tag,
                'note': cursor.value.note != '',
                'results': {},
            };
        }
    }
    var resultsFilter = (cursor) => {
        var mid = cursor.value.match_id;
        if ( mid in matches) {
            matches[mid]['results'][cursor.value.id] = {
                'winlose': cursor.value.winlose,
                'turn': cursor.value.turn,
                'mydeck': cursor.value.mydeck,
                'enemydeck': cursor.value.enemydeck,
            };
        }
    }
    var setupList = () => {
        var events, eventName, event, match, result;
        var hEvent, hMatch, hResult;
        var hMatchId, hResultId, rNo, matchId, resultId;
        events = {};
        // matchデータをイベントごとに振り分け
        for (matchId in matches) {
            match = matches[matchId];
            eventName = `${match['date']} ${RULES[match['rule']]} ${match['tag']}`;
            if (!(eventName in events)) events[eventName] = {};
            events[eventName][matchId] = {
                'note':match['note'],
                'results':match['results'],
            }
        }
        // HTML作成
        for (eventName of dictKeyDecSort(events)) {
            event = events[eventName];
            // イベント毎にテンプレートをコピー
            hEvent = $('#template_event').clone(true).removeAttr('id');
            // イベント名は挿入したいのでmatchのみ削除
            hEvent.find('#template_match').remove();
            // イベント名挿入
            hEvent.children('.event_info').text(eventName);
            hMatchId = Object.keys(event).length+1;;
            for ( matchId of dictKeyDecSort(event)) {
                match = event[matchId];
                hMatchId -= 1;
                // マッチ毎にテンプレートをコピー
                hMatch = $('#template_match').clone(true).removeAttr('id');
                // resultのみ削除
                hMatch.find('#template_result').remove();
                hResultId = Object.keys(match['results']).length+1;
                for ( resultId of dictKeyDecSort(match['results'])) {
                    // result毎にテンプレートコピー&データ挿入
                    result = match['results'][resultId];
                    hResultId -= 1;
                    rNo = `${hMatchId}-${hResultId}`
                    hResult = $('#template_result').clone(true).removeAttr('id');
                    hResult.find('.rNo').text(rNo);
                    hResult.find('.mydeck').text(result['mydeck']);
                    hResult.find('.enemydeck').text(result['enemydeck']);
                    hResult.find('.turn').text(TURN[result['turn']]['list']);
                    hResult.find('.winlose').text(WINLOSE[result['winlose']]['list']);
                    hResult.attr('data-rid', resultId);
                    // マッチ>resultsへ追加
                    hResult.appendTo(hMatch.children('.results'));
                }
                // note挿入&mid挿入
                hMatch.attr('data-mid', matchId);
                hMatch.children('.note').text(NOTE[match['note']]);
                // イベントへ追加
                hMatch.appendTo(hEvent);
            }
            // 表示ON&最後尾へ追加
            hEvent.removeAttr('style');
            hEvent.appendTo('#list');
        }
        
        undisplayLoading();
    }
    // matchesテーブルから取得し、取得したデータをもとにresultsからも取得
    getFilteredData(
        DB_NAME,
        MATCHES_TABLES,
        matchesFilter,
        () => {
            getFilteredData(
                DB_NAME,
                RESULTS_TABLES,
                resultsFilter,
                setupList
            )
        }
    );
}

$('#list').ready(function () {
    changeHeader(GAME_SELECTOR);
    getDataByEvent($('#game_selector').val());
});