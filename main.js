    // 1. 各ブロックの教示文を生成する関数（全体の教示は分離）
    function get_eem_instruction_html(right_self, right_partner, is_unequal) {
        var html = '<div style="text-align: left; line-height: 1.8; font-size: 20px; max-width: 800px; margin: auto; padding-bottom: 30px;">';

        if (!is_unequal) {
            html += '<div style="padding: 15px; background-color: #e9ecef; border-left: 5px solid #007bff; margin-bottom: 20px;">' +
                '<p style="margin: 0; font-weight: bold; color: #0056b3;">新しいブロック（10問）が始まります。</p>' +
                '<p style="margin: 10px 0 0 0;">このブロックでは、<strong>右側の金額が以下の組み合わせで「固定」</strong>されます。</p>' +
                '<p style="font-size: 24px; text-align: center; margin: 15px 0 0 0;">あなた: <strong>' + right_self + '円</strong>　／　Aさん: <strong>' + right_partner + '円</strong></p>' +
                '</div>' +
                '<p>左側の金額は1問ごとに変化します。<br>左右の金額をよく見比べて、好ましいと思う方を選んでください。</p>';
        } else {
            html += '<div style="padding: 15px; background-color: #e9ecef; border-left: 5px solid #28a745; margin-bottom: 20px;">' +
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

    // 3. EEMのタイムライン（教示＋各試行ブロック）を構築
    var eem_timeline = [];

    // --- 全体の最初の教示 ---
    var initial_instruction = {
        type: 'html-button-response',
        stimulus: '<div style="text-align: left; line-height: 1.8; font-size: 20px; max-width: 800px; margin: auto; padding-bottom: 30px;">' +
            '<div style="padding: 15px; background-color: #e2e3e5; border-left: 5px solid #6c757d; margin-bottom: 20px;">' +
            '<p style="margin: 0; font-weight: bold; color: #383d41;">【回答にあたっての同意のお願い】</p>' +
            '<p style="margin: 10px 0 0 0; font-size: 16px; color: #383d41;">近年、オンライン調査において、画面を読まずに適当なキーを連打するなどの「不誠実な回答」が学術研究上の大きな問題となっています。<br>本研究が価値あるものとなるよう、<strong>すべての質問内容をよく読み、あなた自身の考えに基づいて誠実に回答すること</strong>に同意をお願いいたします。</p>' +
            '</div>' +
            '<p>以下の質問は、あなたの報酬分配の好みについて尋ねています。<br>' +
            'あなたが見知らぬ相手（Aさん）と二人組になった状況を思い浮かべてください。<br>' +
            'お互いに匿名です。</p>' +
            '<p>この相手とのお金の分配についての決定を、あなたが行います。<br>' +
            'どちらの分配が好ましいと思うかを、2択から選んでください。</p>' +
            '<div style="text-align: center; margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">' +
            '<strong>【回答方法】</strong><br><br>' +
            '左の分配が好ましい場合は <strong>Fキー</strong> を押してください。<br>' +
            '右の分配が好ましい場合は <strong>Jキー</strong> を押してください。' +
            '</div>' +
            '</div>',
        choices: ['誠実に回答することに同意して実験を始める']
    };
    eem_timeline.push(initial_instruction);

    // 各ブロックを格納する配列（後でシャッフルするため）
    var eem_blocks = [];

    // 試行（画面の見た目や動き）の定義
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

    var eem_iti = {
        type: 'html-keyboard-response',
        stimulus: '<p style="margin-bottom: 50px; font-size: 28px; font-weight: bold;">どちらの配分を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' +
            '<div style="display: flex; justify-content: center; gap: 50px; visibility: hidden;">' +
            '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid #333; border-radius: 8px;">あなた: 0円<br>Aさん: 0円<br><br><span style="font-size: 18px; color: #666;">[F キー]</span></div>' +
            '<div style="padding: 20px; font-size: 24px; line-height: 1.5; width: 250px; border: 2px solid #333; border-radius: 8px;">あなた: 0円<br>Aさん: 0円<br><br><span style="font-size: 18px; color: #666;">[J キー]</span></div>' +
            '</div>',
        choices: jsPsych.NO_KEYS,
        trial_duration: 500,
        post_trial_gap: 0,
        data: {
            task: 'iti'
        }
    };

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
                    timeline: [eem_trial, eem_iti],
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
                timeline: [eem_trial, eem_iti],
                timeline_variables: unequal_stimuli,
                randomize_order: true // ★ ブロック内の試行はランダム化する
            }
        ]
    });

    // --- SVOスライダー課題の追加 ---

    // SVOの教示画面
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

var timeline = [].concat(eem_timeline, [svo_instructions, svo_procedure]);
