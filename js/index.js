
$('#game_selector').ready(function () {
    var option;
    for (var key in GAMES) {
        option = '<option value="' + key + '">'+GAMES[key]+'</option>';
        $('#game_selector').append(option);
    }
});

$('#content').ready(function () {
    loadPage('input');
    createTables(DB_NAME);
});

$('.changemode').on('click', function () {
    loadPage($(this).attr('data-mode'));
});

