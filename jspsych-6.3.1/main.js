// 1. 各ブロックの教示文を生成する関数
function get_eem_instruction_html(right_self, right_partner, is_unequal) {
    var html = '<div style="text-align: left; line-height: 1.8; font-size: 20px; max-width: 800px; margin: auto; padding-bottom: 30px;">';
    if (!is_unequal) {
        html += '<div style="padding: 15px; background-color: #e2e3e5; border-left: 5px solid #007bff; margin-bottom: 20px;">' +
            '<p style="margin: 0; font-weight: bold; color: #0056b3;">新しいブロック（10問）が始まります。</p>' +
            '<p style="margin: 10px 0 0 0;">このブロックでは、<strong>右側の金額が以下の組み合わせで「固定」</strong>されます。</p>' +
            '<p style="font-size: 24px; text-align: center; margin: 15px 0 0 0;">あなた: <strong>' + right_self + '円</strong>　／　Aさん: <strong>' + right_partner + '円</strong></p>' +
            '</div>' +
            '<p>左側の金額は1問ごとに変化します。<br>左右の金額をよく見比べて、好ましいと思う方を選んでください。</p>';
    } else {
        html += '<div style="padding: 15px; background-color: #e2e3e5; border-left: 5px solid #28a745; margin-bottom: 20px;">' +
            '<p style="margin: 0; font-weight: bold; color: #155724;">新しいブロック（12問）が始まります。</p>' +
            '<p style="margin: 10px 0 0 0;">このブロックでは、金額の組み合わせのルールがこれまでとは異なります。<br>左右それぞれの金額が両方とも変化します。</p>' +
            '</div>' +
            '<p>左右の金額をよく見比べて、好ましいと思う方を選んでください。</p>';
    }
    html += '<p style="text-align: center; margin-top: 40px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して進んでください。</p>';
    html += '</div>';
    return html;
}

// 2. 共通のHTML生成関数
function create_eem_stimulus(l_self, l_other, r_self, r_other) {
    var left_box = '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid #333; border-radius: 8px;">あなた: ' + l_self + '円<br>Aさん: ' + l_other + '円<br><br><span style="font-size: 18px; color: #666;">[F キー]</span></div>';
    var right_box = '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid #333; border-radius: 8px;">あなた: ' + r_self + '円<br>Aさん: ' + r_other + '円<br><br><span style="font-size: 18px; color: #666;">[J キー]</span></div>';
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

// 3. EEMのタイムライン構築
var eem_timeline = [];

var initial_instruction = {
    type: 'html-button-response',
    stimulus: '<div style="text-align: left; line-height: 1.8; font-size: 20px; max-width: 800px; margin: auto; padding-bottom: 30px;">' +
        '<div style="padding: 15px; background-color: #e2e3e5; border-left: 5px solid #6c757d; margin-bottom: 20px;">' +
        '<p style="margin: 0; font-weight: bold; color: #383d41;">【回答にあたっての同意のお願い】</p>' +
        '<p style="margin: 10px 0 0 0; font-size: 16px; color: #383d41;">（中略：誠実な回答への同意文）</p>' +
        '</div>' +
        '<p>左なら Fキー、右なら Jキーを押してください。</p></div>',
    choices: ['誠実に回答することに同意して実験を始める']
};
eem_timeline.push(initial_instruction);

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
    }
};

var eem_iti = {
    type: 'html-keyboard-response',
    stimulus: '<div style="visibility: hidden;">（空の刺激）</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'iti' }
};

var right_options = [{ s: 900, o: 500 }, { s: 700, o: 500 }, { s: 300, o: 500 }, { s: 100, o: 500 }];
var eem_blocks = [];

right_options.forEach(function (opt) {
    var block_stimuli = [];
    for (var i = 900; i >= 0; i -= 100) {
        block_stimuli.push(create_eem_stimulus(i, i, opt.s, opt.o));
    }
    eem_blocks.push({
        timeline: [
            { type: 'html-keyboard-response', stimulus: get_eem_instruction_html(opt.s, opt.o, false), choices: [' '] },
            { timeline: [eem_trial, eem_iti], timeline_variables: block_stimuli, randomize_order: true }
        ]
    });
});

eem_timeline = eem_timeline.concat(jsPsych.randomization.shuffle(eem_blocks));

// --- SVOスライダー課題の定義 (svo_procedureまで) ---
var svo_instructions = {
    type: 'html-button-response',
    stimulus: '<div style="text-align: left; line-height: 1.8; font-size: 20px; max-width: 800px; margin: auto; padding-bottom: 30px;">' +
        '<p style="font-size: 24px; line-height: 1.5; font-weight: bold;">続いて、新しい形式の質問が始まります。</p>' +
        '<p style="font-size: 20px; line-height: 1.5;">今度は画面に <strong>9つの選択肢</strong> が横に並んで表示されます。<br>' +
        'その中から、最も好ましいと思う配分のボタンを1つクリックして選んでください。<br>' +
        '<span style="color: #666; font-size: 18px;">（ここからはキーボードではなく、マウスを使って回答します）</span></p>' +
        '</div>',
    choices: ['次へ進む']
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

        var btn_html = '<div style="padding: 10px; font-size: 18px; border: 2px solid #333; border-radius: 6px; text-align: center; background-color: #fff; width: 80px;">' +
            '<span style="font-size: 14px; font-weight: bold; color: #0056b3;">あなた</span><br><strong style="font-size: 22px;">' + self_amt + '</strong><hr style="margin: 8px 0; border: none; border-top: 2px dashed #ccc;">' +
            '<span style="font-size: 14px; font-weight: bold; color: #d9534f;">Aさん</span><br><strong style="font-size: 22px;">' + other_amt + '</strong>' +
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

var svo_trial = {
    type: 'html-button-response',
    stimulus: '<p style="margin-bottom: 40px; font-size: 24px; font-weight: bold;">どの配分が最も好ましいですか？</p>',
    choices: jsPsych.timelineVariable('choices_array'),
    // ボタン自体のデザインを無効化し、中の div をクリック領域にする
    button_html: '<button class="jspsych-btn" style="margin: 0 4px; padding: 0; border: none; background: none; cursor: pointer;">%choice%</button>',
    data: {
        task: 'svo',
        item_number: jsPsych.timelineVariable('item_number')
    },
    on_finish: function (data) {
        // 選んだボタンのインデックス (0〜8) を取得
        var selected_index = data.response;
        // 対応する金額を取得して保存
        var amounts = jsPsych.timelineVariable('amounts_array', true);
        data.self_amount = amounts[selected_index].self;
        data.other_amount = amounts[selected_index].other;
    },
    post_trial_gap: 500
};

var svo_procedure = {
    timeline: [svo_trial],
    timeline_variables: svo_stimuli,
    randomize_order: true // SVOはランダムに提示
};

// --- 完了コードの生成とデータ保存 ---
var completion_code = "EEM-" + jsPsych.randomization.randomID(6).toUpperCase();
jsPsych.data.addProperties({ completion_code: completion_code });

// Qualtricsに値を渡すために、グローバル変数（またはQualtricsがアクセスできる場所）に格納
// qualtrics.js側でこれを参照して、QualtricsのEmbedded Dataに保存します
var final_timeline = [].concat(eem_timeline, [svo_instructions, svo_procedure]);