
$('#settings').ready(function () {
    changeHeader(OTHER_HEADER,'設定');
    undisplayLoading();
});

$('#data_out').on('click', function () {
    var dlData = {
        [MATCHES_TABLES]: [],
        [RESULTS_TABLES]: [],
    };
    var matchesFilter = (cursor) => {
        dlData[MATCHES_TABLES].push(cursor.value);
    }
    var resultsFilter = (cursor) => {
        dlData[RESULTS_TABLES].push(cursor.value);
    }
    var download = async () => {
        var blob = new Blob(
            [JSON.stringify(dlData, null, '  ')],
            { type: 'application/json' }
        );
        var downLoadLink = document.createElement("a");
        downLoadLink.download = DL_JSON_NAME;
        downLoadLink.href = URL.createObjectURL(blob);
        downLoadLink.click();
        URL.revokeObjectURL(downLoadLink.href);
    }
    const dataDownload = () => {
        getFilteredData(
            MATCHES_TABLES,
            matchesFilter,
            () => {
                getFilteredData(
                    RESULTS_TABLES,
                    resultsFilter,
                    download
                );
            }
        );
    };
    confirm(MESSGES['data_out'],dataDownload);
});

$('#data_in').on('click', function () {
    const dataRecovery = (jsonData) => {
        clearData(
            DB_NAME,
            Object.keys(TABLES),
            () => {
                insertData(
                    DB_NAME,
                    jsonData,
                    () => {
                        dialog(
                            MESSGES['deal_OK'],
                            () => { undisplayLoading();}
                        );
                    }
                );
            }
        );
    };
    confirm(
        MESSGES['data_in'],
        () => {
            displayLoading();
            jsonUpload(dataRecovery);
        }
    );
});

$('.setting_label').on('click', function () {
    var clickedSetting = $(this).siblings('.setting_area');
    clickedSetting.slideToggle();
    $('.setting_area').not(clickedSetting).slideUp();
});