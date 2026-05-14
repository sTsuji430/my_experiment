var repo_site = "https://sTsuji430.github.io/my_experiment/";

// 1. 各ブロックの教示文を生成する関数（全体の教示は分離）
function get_eem_instruction_html(right_self, right_partner, is_unequal) {
    var html = '<div style="text-align: left; line-height: 1.6; font-size: 18px; max-width: 800px; margin: 0 auto; padding-bottom: 20px;">';
    if (!is_unequal) {
        html += '<div style="padding: 15px; background-color: #e9ecef; border-left: 5px solid #007bff; margin-bottom: 20px;">' +
            '<p style="font-size: 20px; margin: 0; font-weight: bold; color: #0056b3;">新しいブロック（10問）が始まります。</p>' +
            '<p style="margin: 10px 0 0 0;">このブロックでは、<strong>右側の金額が以下の組み合わせで「固定」</strong>されます。</p>' +
            '<p style="font-size: 24px; margin: 15px 0 0 0;">あなた: <strong>' + right_self + '円</strong>　／　Aさん: <strong>' + right_partner + '円</strong></p>' +
            '</div>' +
            '<p>左側の金額は1問ごとに変化します。<br>左右の金額をよく見比べて、好ましいと思う方を選んでください。</p>';
    } else {
        html += '<div style="padding: 15px; background-color: #e9ecef; border-left: 5px solid #28a745; margin-bottom: 20px;">' +
            '<p style="font-size: 20px; margin: 0; font-weight: bold; color: #155724;">新しいブロック（12問）が始まります。</p>' +
            '<p style="margin: 10px 0 0 0;">このブロックでは、金額の組み合わせのルールがこれまでとは異なります。<br>左右それぞれの金額が両方とも変化します。</p>' +
            '</div>' +
            '<p>左右の金額をよく見比べて、好ましいと思う方を選んでください。</p>';
    }
    html += '<p style="margin-top: 40px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して進んでください。</p>';
    html += '</div>';
    return html;
}

// 2. 共通のHTML生成関数
function create_eem_stimulus(l_self, l_other, r_self, r_other) {
    var left_box = '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid #333; border-radius: 8px; text-align: center;">' +
        '<div style="display: inline-block; text-align: left;">' +
        '<span style="display: inline-block; width: 80px;">あなた</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + l_self + '</span>円<br>' +
        '<span style="display: inline-block; width: 80px;">Aさん</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + l_other + '</span>円' +
        '</div><br><br><span style="font-size: 18px; color: #666;">[F キー]</span></div>';
    var right_box = '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid #333; border-radius: 8px; text-align: center;">' +
        '<div style="display: inline-block; text-align: left;">' +
        '<span style="display: inline-block; width: 80px;">あなた</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + r_self + '</span>円<br>' +
        '<span style="display: inline-block; width: 80px;">Aさん</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + r_other + '</span>円' +
        '</div><br><br><span style="font-size: 18px; color: #666;">[J キー]</span></div>';

    var combined_html = '<p style="margin-bottom: 50px; font-size: 28px; font-weight: bold;">どちらの配分を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' +
        '<div style="display: flex; justify-content: center; gap: 50px;">' + left_box + right_box + '</div>';

    return {
        stimulus_html: combined_html,
        left_self: l_self,
        left_partner: l_other,
        right_self: r_self,
        right_partner: r_other
    };
}

var eem_timeline = [];

// =========================================================
// ★各試行間の注視点（フィードバック後の画面リセット・連打防止用）
// =========================================================
var fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div style="font-size: 60px; color: #333; margin-top: 100px;">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500, // 500ミリ秒間注視点を表示
    post_trial_gap: 0,
    data: { task: 'fixation' }
};

// =========================================================
// ★最重要修正：eem_trial と eem_feedback を一番最初に定義しておく
// =========================================================
var eem_trial = {
    type: 'html-keyboard-response',
    stimulus: jsPsych.timelineVariable('stimulus_html'),
    choices: ['f', 'j'],
    data: {
        task: 'eem',
        left_self: jsPsych.timelineVariable('left_self'),
        left_partner: jsPsych.timelineVariable('left_partner'),
        right_self: jsPsych.timelineVariable('right_self'),
        right_partner: jsPsych.timelineVariable('right_partner')
    },
    post_trial_gap: 0
};

var eem_feedback = {
    type: 'html-keyboard-response',
    stimulus: function () {
        var last_trial_data = jsPsych.data.get().last(1).values()[0];
        var response = last_trial_data.response;
        var l_self = jsPsych.timelineVariable('left_self', true);
        var l_partner = jsPsych.timelineVariable('left_partner', true);
        var r_self = jsPsych.timelineVariable('right_self', true);
        var r_partner = jsPsych.timelineVariable('right_partner', true);

        // 選ばれた方を緑色に強調し、選ばれなかった方を少し薄くする
        var left_bg = (response === 'f') ? '#d4edda' : '#f8f9fa';
        var left_border = (response === 'f') ? '#28a745' : '#ccc';
        var left_shadow = (response === 'f') ? 'box-shadow: 0 0 15px rgba(40,167,69,0.6);' : '';
        var left_opacity = (response === 'f') ? '1' : '0.4';

        var right_bg = (response === 'j') ? '#d4edda' : '#f8f9fa';
        var right_border = (response === 'j') ? '#28a745' : '#ccc';
        var right_shadow = (response === 'j') ? 'box-shadow: 0 0 15px rgba(40,167,69,0.6);' : '';
        var right_opacity = (response === 'j') ? '1' : '0.4';

        var left_box = '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid ' + left_border + '; border-radius: 8px; background-color: ' + left_bg + '; ' + left_shadow + ' opacity: ' + left_opacity + '; text-align: center;">' +
            '<div style="display: inline-block; text-align: left;">' +
            '<span style="display: inline-block; width: 80px;">あなた</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + l_self + '</span>円<br>' +
            '<span style="display: inline-block; width: 80px;">Aさん</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + l_partner + '</span>円' +
            '</div><br><br><span style="font-size: 18px; color: #666;">[F キー]</span></div>';
        var right_box = '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid ' + right_border + '; border-radius: 8px; background-color: ' + right_bg + '; ' + right_shadow + ' opacity: ' + right_opacity + '; text-align: center;">' +
            '<div style="display: inline-block; text-align: left;">' +
            '<span style="display: inline-block; width: 80px;">あなた</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + r_self + '</span>円<br>' +
            '<span style="display: inline-block; width: 80px;">Aさん</span>: <span style="display: inline-block; width: 60px; text-align: right;">' + r_partner + '</span>円' +
            '</div><br><br><span style="font-size: 18px; color: #666;">[J キー]</span></div>';

        return '<p style="margin-bottom: 50px; font-size: 28px; font-weight: bold;">どちらの配分を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' +
            '<div style="display: flex; justify-content: center; gap: 50px;">' + left_box + right_box + '</div>';
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500, // 500ミリ秒間フィードバックを表示
    post_trial_gap: 0,
    data: { task: 'eem_feedback' }
};

// =========================================================
// 1. 理解度チェック（IMC）ブロック（マウスで回答）
// =========================================================
var imc_fail_count = 0;
var imc_passed = false;

// ★PC用に大きめのボタンデザインを定義（使い回し用）
var large_quiz_btn = '<button class="jspsych-btn" style="font-size: 22px; padding: 15px 40px; margin: 10px 20px; cursor: pointer; min-width: 250px;">%choice%</button>';
var large_next_btn = '<button class="jspsych-btn" style="font-size: 20px; padding: 15px 50px; margin: 20px; cursor: pointer;">%choice%</button>';

var imc_quiz_combined = {
    type: 'html-button-response',
    stimulus: function () {
        // ★冒頭で定義した repo_site と、画像フォルダのパスを結合してURLを作る
        var img_url = repo_site + "image/y_o.png";

        var html = '<div style="text-align: left; line-height: 1.6; font-size: 18px; max-width: 800px; margin: 0 auto; padding-bottom: 20px;">';

        html += '<p style="font-size: 24px; font-weight: bold; text-align: left; border-bottom: 2px solid currentColor; padding-bottom: 10px; margin-bottom: 20px; color: #333;">【課題の状況について】</p>';
        html += '<p style="margin-bottom: 10px;">課題では、次のような場面を思い浮かべて回答をして下さい。<br>あなたが見知らぬ相手と二人組になった場面を思い浮かべてください。お互いに匿名です。</p>';

        // ★画像の上下余白を減らし、縦に大きくなりすぎないよう max-height を追加
        html += '<div style="text-align: center; margin: 15px 0;">';
        html += '<img src="' + img_url + '" style="max-width: 40%; max-height: 160px; width: auto; height: auto;">';
        html += '</div>';

        html += '<p style="margin-bottom: 10px;">この相手とのお金の分配についての決定を、あなたが行います。</p>';
        html += '<p style="margin-bottom: 10px;">課題の状況を想像できた方は、下の確認クイズに回答してください。<br><strong style="color: #d9534f;">※クイズへの回答は2回までです。</strong></p>';

        // 区切り線の上下余白を 40px から 15px に縮小
        html += '<hr style="margin: 20px 0; border: 0; border-top: 2px dashed #ccc;">';

        html += '<div style="text-align: left; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">';
        html += '<p style="font-weight: bold; color: #d9534f; margin-bottom: 5px;">【2回以上不正解だった場合、報酬をお支払いすることはできません】</p>';
        html += '<p style="margin-bottom: 10px;">（' + (imc_fail_count + 1) + '回目）</p>';
        html += '<p style="font-size: 22px; font-weight: bold; margin: 0; color: #333;">課題で想像する相手は、____である。</p>';
        html += '</div></div>';

        return html;
    },

    choices: ['よく知っている人', '見知らぬ人'],
    button_html: large_quiz_btn, // ★大きなボタンを適用
    data: { task: 'imc_quiz' },
    on_finish: function (data) {
        if (data.response === 1) {
            imc_passed = true;
        } else {
            imc_passed = false;
            imc_fail_count++;
        }
    }
};

var imc_feedback = {
    type: 'html-button-response',
    stimulus: function () {
        var html = '<div style="text-align: left; line-height: 1.6; font-size: 18px; max-width: 800px; margin: 0 auto; padding-bottom: 20px;">';

        if (imc_passed) {
            html += '<p style="font-size: 24px; font-weight: bold; text-align: left; border-bottom: 2px solid currentColor; padding-bottom: 10px; margin-bottom: 20px; color: #28a745;">正解です！</p>' +
                '<p>この課題で想像する場面は、<strong>見知らぬ人と2人組になった場面</strong>です。</p>';
        } else {
            if (imc_fail_count >= 2) {
                html += '<p style="font-size: 24px; font-weight: bold; text-align: left; border-bottom: 2px solid currentColor; padding-bottom: 10px; margin-bottom: 20px; color: #d9534f;">不正解です！</p>' +
                    '<p>この課題で想像する場面は、<strong>見知らぬ人と2人組になった場面</strong>です。</p>' +
                    '<p style="color: #d9534f; font-weight: bold; margin-top: 20px;">2回不正解であったため、報酬をお支払いすることはできません。<br>次のページに進んでください。</p>';
            } else {
                html += '<p style="font-size: 24px; font-weight: bold; text-align: left; border-bottom: 2px solid currentColor; padding-bottom: 10px; margin-bottom: 20px; color: #d9534f;">不正解です！</p>' +
                    '<p>この課題で想像する場面は、<strong>見知らぬ人と2人組になった場面</strong>です。</p>' +
                    '<p style="margin-top: 20px;">再度確認テストに回答してください。</p>';
            }
        }
        html += '</div>';
        return html;
    },
    choices: ['次のページに進む'],
    button_html: large_next_btn, // ★大きな「次へ」ボタンを適用
    on_finish: function () {
        if (!imc_passed && imc_fail_count >= 2) {
            try {
                Qualtrics.SurveyEngine.setEmbeddedData('imc_failed', '1');
                document.getElementById('NextButton').click();
            } catch (e) { console.log('Qualtrics連携エラー'); }
            jsPsych.endExperiment(' ');
        }
    }
};

var imc_loop = {
    timeline: [imc_quiz_combined, imc_feedback],
    loop_function: function () {
        if (imc_passed || imc_fail_count >= 2) { return false; }
        else { return true; }
    }
};

// =========================================================
// 2. キーボード操作の教示
// =========================================================
var eem_keyboard_instruction = {
    type: 'html-keyboard-response',
    stimulus: function () {
        // 画像のURLを指定
        var img_url = repo_site + "image/key_instruction.png";

        var html = '<div style="text-align: left; line-height: 1.6; font-size: 18px; max-width: 800px; margin: 0 auto; padding-bottom: 20px;">' +
            '<p style="font-size: 24px; font-weight: bold; text-align: left; border-bottom: 2px solid currentColor; padding-bottom: 10px; margin-bottom: 20px; color: #333;">ここからはキーボードを使います</p>' +
            '<p style="margin-bottom: 10px;">課題は、あなたの報酬分配の好みについて尋ねています。<br>' +
            'どちらの分配が好ましいと思うかを、2択から選んでください。</p>';

        // ★画像の上下余白を減らし、縦幅の制限 (max-height: 200px) を追加
        html += '<div style="text-align: center; margin: 10px 0;">';
        html += '<img src="' + img_url + '" style="max-width: 50%; max-height: 200px; width: auto; height: auto; border: 1px solid #ddd; border-radius: 8px; padding: 5px; background-color: #fff;">';
        html += '</div>';

        // 枠内の余白（padding）や、上部の空白（margin-top）を縮小
        html += '<div style="text-align: left; margin-top: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">' +
            '<strong style="font-size: 20px;">【回答方法】</strong><br>' +
            '<span style="display: inline-block; margin-top: 5px;">左の分配が好ましい場合は <strong>Fキー</strong> を、右の分配が好ましい場合は <strong>Jキー</strong> を押してください。</span>' +
            '</div>' +
            '<p style="margin-top: 20px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して、練習課題へ進んでください。</p>' +
            '</div>';

        return html;
    },
    choices: [' ']
};

// =========================================================
// 3. EEM練習課題ブロック
// =========================================================
var practice_trial = {
    type: 'html-keyboard-response',
    stimulus: jsPsych.timelineVariable('stimulus_html'),
    choices: ['f', 'j'],
    data: {
        task: 'eem_practice',
        left_self: jsPsych.timelineVariable('left_self'),
        left_partner: jsPsych.timelineVariable('left_partner'),
        right_self: jsPsych.timelineVariable('right_self'),
        right_partner: jsPsych.timelineVariable('right_partner')
    },
    post_trial_gap: 0
};

// ★練習課題を4パターンに増加
var practice_stimuli = [
    create_eem_stimulus(500, 500, 600, 400), // パターン1：平等 vs 利己的
    create_eem_stimulus(800, 200, 400, 600), // パターン2：極端なトレードオフ
    create_eem_stimulus(300, 700, 400, 400), // パターン3：自分が損をする状況
    create_eem_stimulus(700, 300, 700, 300)  // パターン4：左右が全く同じ
];

var practice_procedure = {
    timeline: [practice_trial, eem_feedback, fixation],
    timeline_variables: practice_stimuli
};

var practice_end = {
    type: 'html-keyboard-response',
    stimulus: '<div style="text-align: left; line-height: 1.6; font-size: 18px; max-width: 800px; margin: 0 auto; padding-bottom: 20px;">' +
        '<p style="font-size: 24px; font-weight: bold; text-align: left; border-bottom: 2px solid currentColor; padding-bottom: 10px; margin-bottom: 20px; color: #333;">練習が終わりました</p>' +
        '<p>これより本番が始まります。<br>本番はいくつかのブロックに分かれており、ブロックごとにルールの説明が表示されます。</p>' +
        '<p style="margin-top: 40px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して本番を開始してください。</p>' +
        '</div>',
    choices: [' ']
};

// タイムラインへの追加
eem_timeline.push(imc_loop);
eem_timeline.push(eem_keyboard_instruction);
eem_timeline.push(practice_procedure);
eem_timeline.push(practice_end);

// =========================================================
// 4. 本番ブロック（パターン1〜4）
// =========================================================
var eem_blocks = [];

// --- パターン1〜4 (10段階 × 4パターン = 40項目) ---
var right_options = [
    { s: 900, o: 500 },
    { s: 700, o: 500 },
    { s: 300, o: 500 },
    { s: 100, o: 500 }
];

right_options.forEach(function (opt) {
    var block_stimuli = [];
    for (var i = 900; i >= 0; i -= 100) {
        block_stimuli.push(create_eem_stimulus(i, i, opt.s, opt.o));
    }

    eem_blocks.push({
        timeline: [
            {
                type: 'html-keyboard-response',
                stimulus: get_eem_instruction_html(opt.s, opt.o, false),
                choices: [' ']
            },
            {
                timeline: [eem_trial, eem_feedback, fixation],
                timeline_variables: block_stimuli,
                randomize_order: true // ★ ブロック内の試行をランダム化
            }
        ]
    });
});

// --- パターン5 (不平等同士、合計が等しい項目 = 12項目) ---
var unequal_options = [
    { ls: 500, lo: 500, rs: 700, ro: 300 },
    { ls: 400, lo: 600, rs: 700, ro: 300 },
    { ls: 300, lo: 700, rs: 700, ro: 300 },
    { ls: 200, lo: 800, rs: 700, ro: 300 },
    { ls: 100, lo: 900, rs: 700, ro: 300 },
    { ls: 0, lo: 1000, rs: 700, ro: 300 },
    { ls: 500, lo: 500, rs: 300, ro: 700 },
    { ls: 600, lo: 400, rs: 300, ro: 700 },
    { ls: 700, lo: 300, rs: 300, ro: 700 },
    { ls: 800, lo: 200, rs: 300, ro: 700 },
    { ls: 900, lo: 100, rs: 300, ro: 700 },
    { ls: 1000, lo: 0, rs: 300, ro: 700 }
];

var unequal_stimuli = [];
unequal_options.forEach(function (opt) {
    unequal_stimuli.push(create_eem_stimulus(opt.ls, opt.lo, opt.rs, opt.ro));
});

// ★ 最初の4ブロックの順序をランダム化して eem_timeline に追加
eem_blocks = jsPsych.randomization.shuffle(eem_blocks);
eem_timeline = eem_timeline.concat(eem_blocks);

// ★ パターン5（不平等同士）はランダム化に含めず、常に4ブロックの後（SVOの前）に固定で配置する
eem_timeline.push({
    timeline: [
        {
            type: 'html-keyboard-response',
            stimulus: get_eem_instruction_html(0, 0, true),
            choices: [' ']
        },
        {
            timeline: [eem_trial, eem_feedback, fixation],
            timeline_variables: unequal_stimuli,
            randomize_order: true // ★ ブロック内の試行はランダム化する
        }
    ]
});

// --- SVOスライダー課題の追加 ---

// SVOの教示画面
var svo_instructions = {
    type: 'html-button-response',
    stimulus: function () {
        // ★冒頭で定義した repo_site を使用
        var img_url = repo_site + "image/y_o.png";

        var html = '<style>.jspsych-display-element { overflow-y: auto !important; }</style>' +
            '<div style="text-align: left; line-height: 1.6; font-size: 18px; max-width: 800px; margin: 0 auto; padding-bottom: 20px; max-height: 400px; overflow-y: auto; padding-right: 15px;">';

        html += '<p style="font-size: 24px; font-weight: bold; text-align: left; border-bottom: 2px solid currentColor; padding-bottom: 10px; margin-bottom: 20px; color: #333;">【課題３：ポイントの分配】</p>';
        html += '<p style="margin-bottom: 10px; font-weight: bold; color: #d9534f;">（ここからはキーボードではなく、マウスを使って回答します）</p>';
        html += '<p style="margin-bottom: 5px;">この課題も、<strong>あなたが見知らぬ相手と二人組になった状況</strong>を思い浮かべてください。お互いに匿名です。</p>';

        // SVOの選択肢の例をHTMLで生成
        var example_buttons = '<div style="display: flex; justify-content: center; gap: 6px; margin: 10px 0;">';
        var ex_s = [50, 52, 53, 54, 56, 57, 58, 59, 60];
        var ex_o = [45, 44, 42, 41, 40, 39, 37, 36, 35];
        for (var i = 0; i < 9; i++) {
            var is_active = (i === 4);
            var bg_color = is_active ? '#d4edda' : '#f8f9fa';
            var border_color = is_active ? '#28a745' : '#ccc';
            var shadow = is_active ? 'box-shadow: 0 0 8px rgba(40,167,69,0.5);' : '';
            var opacity = is_active ? '1' : '0.4';
            example_buttons += '<div style="padding: 5px; border: 2px solid ' + border_color + '; border-radius: 6px; text-align: center; background-color: ' + bg_color + '; width: 65px; opacity: ' + opacity + '; ' + shadow + '; pointer-events: none;">' +
                '<span style="font-size: 12px; font-weight: bold; color: #0056b3;">あなた</span><br><strong style="font-size: 18px;">' + ex_s[i] + '</strong><hr style="margin: 4px 0; border: none; border-top: 2px dashed #ccc;">' +
                '<span style="font-size: 12px; font-weight: bold; color: #E65F00;">Aさん</span><br><strong style="font-size: 18px;">' + ex_o[i] + '</strong>' +
                '</div>';
        }
        example_buttons += '</div>';

        html += '<p style="margin-bottom: 5px;">この相手とのポイントの配分についての決定を、あなたが行います。<br>' +
            '画面には <strong>9つの選択肢</strong> が横に並んで表示されますので、その中から、<strong>あなたにとって好ましい分配</strong>のボタンを1つクリックして選んでください。</p>';

        // 画像の復活（少し小さめ）
        html += '<div style="text-align: center; margin: 5px 0;">';
        html += '<img src="' + img_url + '" style="max-width: 50%; max-height: 80px; width: auto; height: auto;">';
        html += '</div>';

        // 例示の部分
        html += '<div style="background-color: #f8f9fa; border: 1px solid #ddd; padding: 10px; border-radius: 8px; margin-top: 5px; text-align: center;">' +
            '<p style="margin-bottom: 5px; font-size: 16px; font-weight: bold; text-align: left;">【選択肢の例】</p>' +
            example_buttons +
            '<p style="font-size: 14px; margin: 0; text-align: left;">上の例では、<strong>あなたが56ポイントを受け取り、相手が40ポイントを受け取るような配分</strong>を選択しています。</p>' +
            '</div>' +
            '</div>';

        return html;
    },
    choices: ['次へ進む'],
    button_html: large_next_btn // ※定義済みの大きめのボタンを使用
};

// SVOの座標データ
var svo_endpoints = [
    { item: 1, ep1: { s: 85, o: 85 }, ep2: { s: 85, o: 15 } },
    { item: 2, ep1: { s: 85, o: 15 }, ep2: { s: 100, o: 50 } },
    { item: 3, ep1: { s: 50, o: 100 }, ep2: { s: 85, o: 85 } },
    { item: 4, ep1: { s: 50, o: 100 }, ep2: { s: 85, o: 15 } },
    { item: 5, ep1: { s: 100, o: 50 }, ep2: { s: 50, o: 100 } },
    { item: 6, ep1: { s: 100, o: 50 }, ep2: { s: 85, o: 85 } },
    { item: 7, ep1: { s: 100, o: 50 }, ep2: { s: 70, o: 100 } },
    { item: 8, ep1: { s: 90, o: 100 }, ep2: { s: 100, o: 90 } },
    { item: 9, ep1: { s: 100, o: 70 }, ep2: { s: 50, o: 100 } },
    { item: 10, ep1: { s: 100, o: 70 }, ep2: { s: 70, o: 100 } },
    { item: 11, ep1: { s: 70, o: 100 }, ep2: { s: 100, o: 70 } },
    { item: 12, ep1: { s: 50, o: 100 }, ep2: { s: 100, o: 90 } },
    { item: 13, ep1: { s: 50, o: 100 }, ep2: { s: 100, o: 50 } },
    { item: 14, ep1: { s: 100, o: 90 }, ep2: { s: 70, o: 100 } },
    { item: 15, ep1: { s: 90, o: 100 }, ep2: { s: 100, o: 50 } }
];

var svo_stimuli = [];
for (var j = 0; j < svo_endpoints.length; j++) {
    var ep1 = svo_endpoints[j].ep1;
    var ep2 = svo_endpoints[j].ep2;
    var choices_html = [];
    var amounts = [];

    // 9段階に分割 (線形補間)
    for (var k = 0; k < 9; k++) {
        var t = k / 8; // 0 から 1 までの比率
        var self_amt = Math.round(ep1.s + t * (ep2.s - ep1.s));
        var other_amt = Math.round(ep1.o + t * (ep2.o - ep1.o));

        var btn_html = '<div style="padding: 5px; border: 2px solid #333; border-radius: 6px; text-align: center; background-color: #fff; width: 65px;">' +
            '<span style="font-size: 12px; font-weight: bold; color: #0056b3;">あなた</span><br><strong style="font-size: 18px;">' + self_amt + '</strong><hr style="margin: 4px 0; border: none; border-top: 2px dashed #ccc;">' +
            '<span style="font-size: 12px; font-weight: bold; color: #E65F00;">Aさん</span><br><strong style="font-size: 18px;">' + other_amt + '</strong>' +
            '</div>';
        choices_html.push(btn_html);
        amounts.push({ self: self_amt, other: other_amt });
    }

    svo_stimuli.push({
        item_number: svo_endpoints[j].item,
        choices_array: choices_html,
        amounts_array: amounts
    });
}

// =========================================================
// SVO試行とITI（ダミー試行）の定義
// =========================================================

var svo_trial = {
    type: 'html-button-response',
    stimulus: '<div style="text-align: center; margin-bottom: 30px;">' +
        '<p style="font-size: 16px; color: #666; margin-bottom: 5px; font-weight: bold;">【あなた と 見知らぬ相手（Aさん） とのポイント分配】</p>' +
        '<p style="font-size: 24px; font-weight: bold; margin: 0;">あなたにとって最も好ましい配分を1つ選んでください。</p>' +
        '</div>',
    choices: jsPsych.timelineVariable('choices_array'),
    button_html: '<button class="jspsych-btn" style="margin: 0 4px; padding: 0; border: none; background: none; cursor: pointer;">%choice%</button>',
    data: {
        task: 'svo',
        item_number: jsPsych.timelineVariable('item_number')
    },
    on_finish: function (data) {
        var selected_index = data.response;
        var amounts = jsPsych.timelineVariable('amounts_array', true);
        data.self_amount = amounts[selected_index].self;
        data.other_amount = amounts[selected_index].other;
    },
    // ★ダミー試行をすぐ後に繋げるため、デフォルトの空白時間（真っ白になる時間）を0にします
    post_trial_gap: 0
};

// ★新設：SVO専用のフィードバック試行
var svo_feedback = {
    type: 'html-button-response',
    stimulus: function () {
        return '<div style="text-align: center; margin-bottom: 30px;">' +
            '<p style="font-size: 16px; color: #666; margin-bottom: 5px; font-weight: bold;">【あなた と 見知らぬ相手（Aさん） とのポイント分配】</p>' +
            '<p style="font-size: 24px; font-weight: bold; margin: 0;">あなたにとって最も好ましい配分を1つ選んでください。</p>' +
            '</div>';
    },
    choices: jsPsych.timelineVariable('choices_array'),
    button_html: '<button class="jspsych-btn" style="margin: 0 4px; padding: 0; border: none; background: none; cursor: default;">%choice%</button>',
    trial_duration: 500,
    response_ends_trial: false,
    on_load: function () {
        var last_trial_data = jsPsych.data.get().last(1).values()[0];
        var selected_index = parseInt(last_trial_data.response);
        var buttons = document.getElementsByClassName('jspsych-html-button-response-button');

        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i].querySelector('button');
            var choice_inner = btn.querySelector('div');

            if (i === selected_index) {
                btn.style.opacity = '1';
                if (choice_inner) {
                    choice_inner.style.backgroundColor = '#d4edda';
                    choice_inner.style.border = '2px solid #28a745';
                    choice_inner.style.boxShadow = '0 0 10px rgba(40,167,69,0.5)';
                }
            } else {
                btn.style.opacity = '0.4';
                if (choice_inner) {
                    choice_inner.style.backgroundColor = '#f8f9fa';
                    choice_inner.style.border = '2px solid #ccc';
                }
            }
        }
    },
    post_trial_gap: 500, // 試行間にブランク（真っ白な画面）を設ける
    data: { task: 'svo_feedback' }
};

// =========================================================
// 手順のタイムライン組み立て
// =========================================================
var svo_procedure = {
    timeline: [svo_trial, svo_feedback], // ★試行の直後にフィードバックを表示して次へ進む
    timeline_variables: svo_stimuli,
    randomize_order: true // SVOはランダムに提示
};

var timeline = [].concat(eem_timeline, [svo_instructions, svo_procedure]);
