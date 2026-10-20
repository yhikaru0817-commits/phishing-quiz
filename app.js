/* フィッシング見抜きトレーニング
 * ビルド不要のバニラJS。問題データは questions.json にあります。
 * 個人情報は集めず、外部への送信もしません。記録は localStorage（使えなければメモリ）だけに保存します。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'phishingQuiz.v1';
  var MAIN_COUNT = 5; // 本編の問題数
  var CHECK_BADGE_TARGET = 10; // 「送信元チェッカー」に必要な確認回数
  var CATEGORY_BADGE_TARGET = 2; // 「全カテゴリ制覇」：各カテゴリでこの数だけ正解

  /* ------------------------------------------------------------------
   * 画面の文言（ふつうの日本語 / やさしい日本語 / English）
   * ------------------------------------------------------------------ */
  var UI = {
    ja: {
      skipLink: '本文へ移動',
      banner: 'これは学習用の模擬画面です。実在の大学・企業とは関係なく、リンクはどこにも移動しません。',
      appTitle: 'フィッシング見抜きトレーニング',
      settings: '設定',
      loading: '読み込み中…',
      startHeading: '偽メールを見抜く力をつけよう',
      startBackground: '2026年10月、大阪公立大学はランサムウェア攻撃を受け、約13万人分の個人情報が流出した恐れがあると発表しました（大学が調査中で、流出は確定していません）。パスワードの一斉変更や個人メールの登録の案内が続くいまは、大学をかたる偽メールがまぎれこみやすい状況です。',
      howToHeading: '遊び方',
      howTo1: '事前テスト（3問）：いまの実力をはかります。',
      howTo2: '本編（5問）：メール・SMS・チャットの模擬画面を見て、「送信元」か「リンク先」を確認してから判定します。',
      howTo3: '事後テスト（3問）：練習のあとの実力をはかります。',
      howTo4: '結果をコピーして、班が案内するGoogleフォームに自分で貼り付けて提出します。',
      startTime: '所要時間：約3〜4分',
      settingsHeading: '表示の設定',
      privacy: 'このアプリは個人情報を集めず、どこにも送信しません。記録はこの端末のブラウザの中だけに保存されます。',
      start: '始める',
      language: '言語',
      langJa: 'ふつうの日本語',
      langEasy: 'やさしい日本語',
      langEn: 'English',
      fontSize: '文字の大きさ',
      fontS: '小',
      fontM: '中',
      fontL: '大',
      theme: '画面の色',
      themeAuto: '端末に合わせる',
      themeLight: 'ライト',
      themeDark: 'ダーク',
      close: '閉じる',
      reset: '記録を消去',
      resetConfirm: 'これまでのスコア・バッジなどの記録を消去します。よろしいですか？',
      resetDone: '記録を消去しました。',
      storageOff: 'この環境では記録を保存できません。今回のプレイ中だけ記録します（ページを閉じると消えます）。',
      enFallback: '',
      errorHeading: '問題を読み込めませんでした',
      loadError: '問題ファイル（questions.json）を読み込めませんでした。ファイルをダブルクリックで開いた場合はブラウザの制限で読み込めません。README の「ローカルでの開き方」を見て、サーバー経由で開いてください。',

      stagePre: '事前テスト',
      stageMain: '本編',
      stagePost: '事後テスト',
      introPreTitle: '事前テスト（3問）',
      introPreText: 'いまの実力をはかります。判定だけを行い、正解や解説は表示しません。直感で答えてかまいません。',
      introMainTitle: '本編（5問）',
      introMainText: '判定する前に、「送信元を確認」か「リンク先を確認」のどちらかを開いて中身を見てください。「あやしい」と思ったら、あやしい箇所も選びます。',
      introPostTitle: '事後テスト（3問）',
      introPostText: '練習のあとの実力をはかります。事前テストと同じく、判定だけを行います。',
      introGo: '始める',
      counter: '{n} / {total} 問目',
      scoreLabel: 'スコア',
      streakLabel: '連続正解',
      quizHeading: 'このメッセージを調べよう',
      mockLabel: '学習用の模擬画面',
      channel_email: 'メール',
      channel_sms: 'SMS（ショートメッセージ）',
      channel_line: 'チャットアプリ（LINE風）',
      fromLabel: '差出人',
      toLabel: '宛先',
      toYou: 'あなた',
      subjectLabel: '件名',
      chatUnknownNote: '友だち登録されていない相手からのメッセージです',
      checkTitle: 'まず確認しよう',
      checkHint: '判定する前に「送信元を確認」か「リンク先を確認」のどちらかを開いてください。',
      checkHintTest: '確認は自由です（事前・事後テストでは確認しなくても判定できます）。',
      checkSender: '送信元を確認',
      checkLinks: 'リンク先を確認',
      checkedMark: '確認済み',
      senderDisplay: '画面に表示されている名前',
      senderActual: '実際の送信元',
      linkDisplay: '表示されている文字',
      linkActual: '実際のリンク先',
      noLinks: 'このメッセージにはリンクがありません。',
      judgeTitle: 'このメッセージは？',
      judgeReal: '本物だと思う',
      judgeFake: 'あやしい',
      judgeLocked: '先に「送信元を確認」か「リンク先を確認」を開いてください。',
      pickTitle: 'あやしいと思う箇所を選ぼう',
      pickHint: '上の模擬画面の中で、あやしいと思う箇所（差出人・件名・リンク・点線で囲まれた文言）をタップして選び、「決定」を押してください。いくつ選んでもかまいません。',
      pickCount: '{n}か所を選択中',
      pickDone: '決定',
      pickGroup: 'あやしい箇所を選ぶ',
      partSender: '差出人',
      partSubject: '件名',
      partLink: 'リンク',
      correct: '正解',
      incorrect: '不正解',
      wasFake: 'これは「なりすまし・フィッシング」でした。',
      wasReal: 'これは「本物」の連絡でした。',
      pointsGained: '+{n}点',
      pointsTitle: '見抜くポイント',
      realPointsTitle: '本物だと分かるポイント',
      found: '見つけた',
      missed: '見落とし',
      extraTitle: '次の箇所は、決め手になる「あやしい箇所」ではありませんでした：',
      actionTitle: '実際に届いたら',
      suspiciousMarker: '（あやしい箇所）',
      next: '次へ',
      toPost: '事後テストへ',
      toResult: '結果を見る',
      answered: '回答しました。',
      linkToast: '学習用の模擬画面なので、リンクは開きません。リンク先は「リンク先を確認」で見られます。',

      resultHeading: '結果',
      totalScore: 'スコア',
      mainAccuracy: '本編の正答率',
      bestStreak: '最高連続正解',
      prePostTitle: '事前テスト → 事後テスト',
      prePostUp: '{n}問アップしました！',
      prePostSame: '変わりませんでした。',
      prePostDown: '{n}問ダウンしました。もう一度挑戦してみましょう。',
      catTitle: 'カテゴリ別の習熟度',
      catThisPlay: '今回',
      catOverall: 'これまでの累計',
      catNone: 'まだ出題なし',
      weakest: 'いちばん苦手なのは「{cat}」です。もう一度プレイして練習しましょう。',
      noWeak: '苦手なカテゴリはまだ見つかっていません。',
      badgesTitle: 'バッジ',
      badgeEarned: '獲得',
      badgeLocked: '未獲得',
      badgeNew: 'NEW',
      nudgeTitle: '迷ったときの3つの行動',
      nudge1: 'メールやSMSのリンクは押さず、公式サイトや公式アプリを自分で開いて確かめる。',
      nudge2: '一人で判断しない。大学の窓口・家族・友だちに相談する。',
      nudge3: '入力・返信・支払いをしてしまったら、すぐにパスワード変更やカード会社・警察（#9110）・消費者ホットライン（188）に連絡する。',
      copyTitle: '結果の提出',
      copyHelp: 'このアプリは結果を送信しません。「結果をコピー」を押して、班が案内するGoogleフォームに自分で貼り付けて提出してください。',
      copy: '結果をコピー',
      copied: 'コピーしました。Googleフォームに貼り付けて提出してください。',
      copyFail: 'コピーできませんでした。下の枠の文字を選んでコピーしてください。',
      copyBoxLabel: 'コピーする結果の文字',
      again: 'もう一度プレイ',
      home: 'スタートに戻る',

      txtTitle: '【フィッシング見抜きトレーニング 結果】',
      txtDate: '日付',
      txtPre: '事前テスト',
      txtPost: '事後テスト',
      txtChange: '変化',
      txtMain: '本編',
      txtScore: 'スコア',
      txtStreak: '最高連続正解',
      txtChecks: '確認ステップの使用',
      txtChecksUnit: '回',
      txtCategory: 'カテゴリ別（今回）',
      txtBadges: '獲得バッジ',
      txtNone: 'なし',
      txtLang: '表示言語',

      badge_first_name: 'はじめの一歩',
      badge_first_desc: '1回プレイを完了する',
      badge_checker_name: '送信元チェッカー',
      badge_checker_desc: '確認ステップを10回使う',
      badge_streak_name: '5連続正解',
      badge_streak_desc: '本編で5問続けて正解する',
      badge_real_name: '本物も見抜ける',
      badge_real_desc: '本物の連絡を「本物」と正しく判定する',
      badge_detective_name: '指摘の名人',
      badge_detective_desc: 'あやしい箇所を過不足なく指摘する（3回）',
      badge_perfect_name: 'パーフェクト',
      badge_perfect_desc: '本編5問すべてに正解する',
      badge_allcat_name: '全カテゴリ制覇',
      badge_allcat_desc: 'すべてのカテゴリでそれぞれ2問以上正解する'
    },

    easy: {
      skipLink: '本文へ 行く',
      banner: 'これは 勉強の ための にせものの 画面です。本当の 大学や 会社とは 関係 ありません。リンクを おしても どこにも 行きません。',
      appTitle: 'うそメールを 見ぬく 練習',
      settings: '設定',
      loading: '読みこみ中…',
      startHeading: 'うその メールを 見ぬく 力を つけよう',
      startBackground: '2026年10月、大阪公立大学は コンピューターの こうげき（ランサムウェア）を 受けました。約13万人の 個人の 情報が 外に 出た かも しれません（大学が 調べて います。まだ わかって いません）。いま 大学から パスワードを かえる おしらせなどが 来て いるので、大学の ふりを する うその メールに 気を つけましょう。',
      howToHeading: '遊び方',
      howTo1: '事前テスト（3問）：いまの 力を はかります。',
      howTo2: '本編（5問）：メール・SMS・チャットを 見て、「送った 人」か「リンク先」を たしかめてから、本物か あやしいかを えらびます。',
      howTo3: '事後テスト（3問）：練習の あとの 力を はかります。',
      howTo4: '結果を コピーして、班の Googleフォームに 自分で はりつけて 出します。',
      startTime: 'かかる 時間：3〜4分 ぐらい',
      settingsHeading: '画面の 設定',
      privacy: 'この アプリは 個人の 情報を 集めません。どこにも 送りません。記録は この スマホや パソコンの 中だけに のこります。',
      start: 'はじめる',
      language: 'ことば',
      langJa: 'ふつうの日本語',
      langEasy: 'やさしい日本語',
      langEn: 'English',
      fontSize: '文字の 大きさ',
      fontS: '小',
      fontM: '中',
      fontL: '大',
      theme: '画面の 色',
      themeAuto: 'スマホなどに 合わせる',
      themeLight: '明るい',
      themeDark: '暗い',
      close: 'とじる',
      reset: '記録を 消す',
      resetConfirm: 'スコアや バッジの 記録を 消します。いいですか？',
      resetDone: '記録を 消しました。',
      storageOff: 'ここでは 記録を のこせません。いまの プレイの 間だけ 記録します。',
      enFallback: '',
      errorHeading: '問題を 読みこめません でした',
      loadError: '問題の ファイル（questions.json）を 読みこめません でした。README の「ローカルでの開き方」を 見て ください。',

      stagePre: '事前テスト',
      stageMain: '本編',
      stagePost: '事後テスト',
      introPreTitle: '事前テスト（3問）',
      introPreText: 'いまの 力を はかります。本物か あやしいかを えらぶ だけです。答えと 説明は 出ません。',
      introMainTitle: '本編（5問）',
      introMainText: 'えらぶ 前に、「送った 人を 見る」か「リンク先を 見る」を おして ください。「あやしい」を えらんだら、あやしい ところも えらびます。',
      introPostTitle: '事後テスト（3問）',
      introPostText: '練習の あとの 力を はかります。えらぶ だけです。',
      introGo: 'はじめる',
      counter: '{n} / {total} 問目',
      scoreLabel: 'スコア',
      streakLabel: '連続 正解',
      quizHeading: 'この メッセージを 調べよう',
      mockLabel: '勉強用の にせもの 画面',
      channel_email: 'メール',
      channel_sms: 'SMS',
      channel_line: 'チャット アプリ（LINE風）',
      fromLabel: '送った 人',
      toLabel: 'あて先',
      toYou: 'あなた',
      subjectLabel: '件名',
      chatUnknownNote: '友だちでは ない 人からの メッセージです',
      checkTitle: 'まず たしかめよう',
      checkHint: 'えらぶ 前に「送った 人を 見る」か「リンク先を 見る」を おして ください。',
      checkHintTest: 'たしかめなくても えらべます。',
      checkSender: '送った 人を 見る',
      checkLinks: 'リンク先を 見る',
      checkedMark: '見た',
      senderDisplay: '画面に 出て いる 名前',
      senderActual: '本当に 送った ところ',
      linkDisplay: '見えて いる 文字',
      linkActual: '本当の 行き先',
      noLinks: 'この メッセージには リンクが ありません。',
      judgeTitle: 'この メッセージは？',
      judgeReal: '本物だと 思う',
      judgeFake: 'あやしい',
      judgeLocked: 'さきに「送った 人を 見る」か「リンク先を 見る」を おして ください。',
      pickTitle: 'あやしい ところを えらぼう',
      pickHint: '上の 画面で、あやしいと 思う ところ（送った 人・件名・リンク・点線の 文字）を おして、「決定」を おして ください。いくつ えらんでも いいです。',
      pickCount: '{n}か所 えらんで います',
      pickDone: '決定',
      pickGroup: 'あやしい ところを えらぶ',
      partSender: '送った 人',
      partSubject: '件名',
      partLink: 'リンク',
      correct: '正解',
      incorrect: 'まちがい',
      wasFake: 'これは「うその メッセージ」でした。',
      wasReal: 'これは「本物」の メッセージでした。',
      pointsGained: '+{n}点',
      pointsTitle: '見ぬく ポイント',
      realPointsTitle: '本物だと わかる ポイント',
      found: '見つけた',
      missed: '見のがした',
      extraTitle: 'つぎの ところは「あやしい ところ」では ありません でした：',
      actionTitle: '本当に 来たら どうする？',
      suspiciousMarker: '（あやしい ところ）',
      next: 'つぎへ',
      toPost: '事後テストへ',
      toResult: '結果を 見る',
      answered: '答えました。',
      linkToast: 'これは 勉強用の 画面なので、リンクは ひらきません。「リンク先を 見る」で 行き先を 見られます。',

      resultHeading: '結果',
      totalScore: 'スコア',
      mainAccuracy: '本編の 正解の 割合',
      bestStreak: 'いちばん 長い 連続 正解',
      prePostTitle: '事前テスト → 事後テスト',
      prePostUp: '{n}問 ふえました！',
      prePostSame: 'かわりません でした。',
      prePostDown: '{n}問 へりました。もう一度 やって みましょう。',
      catTitle: 'カテゴリ ごとの 力',
      catThisPlay: '今回',
      catOverall: 'これまで ぜんぶ',
      catNone: 'まだ 出て いない',
      weakest: 'いちばん にがてなのは「{cat}」です。もう一度 練習しましょう。',
      noWeak: 'にがての カテゴリは まだ ありません。',
      badgesTitle: 'バッジ',
      badgeEarned: 'もらった',
      badgeLocked: 'まだ',
      badgeNew: 'NEW',
      nudgeTitle: 'まよった ときの 3つの 行動',
      nudge1: 'メールや SMSの リンクは おさない。会社や 大学の サイト・アプリを 自分で ひらいて たしかめる。',
      nudge2: 'ひとりで きめない。大学の まどぐち・家族・友だちに 相談する。',
      nudge3: '入れて しまったら、すぐ パスワードを かえる。カード会社・けいさつ（#9110）・消費者ホットライン（188）に 連絡する。',
      copyTitle: '結果を 出す',
      copyHelp: 'この アプリは 結果を 送りません。「結果を コピー」を おして、班の Googleフォームに 自分で はりつけて 出して ください。',
      copy: '結果を コピー',
      copied: 'コピー しました。Googleフォームに はりつけて ください。',
      copyFail: 'コピー できません でした。下の 文字を えらんで コピーして ください。',
      copyBoxLabel: 'コピーする 結果の 文字',
      again: 'もう一度 遊ぶ',
      home: 'はじめの 画面に もどる',

      txtTitle: '【うそメールを 見ぬく 練習 結果】',
      txtDate: '日付',
      txtPre: '事前テスト',
      txtPost: '事後テスト',
      txtChange: '変化',
      txtMain: '本編',
      txtScore: 'スコア',
      txtStreak: '最高 連続 正解',
      txtChecks: 'たしかめた 回数',
      txtChecksUnit: '回',
      txtCategory: 'カテゴリ ごと（今回）',
      txtBadges: 'もらった バッジ',
      txtNone: 'なし',
      txtLang: 'ことば',

      badge_first_name: 'はじめの 一歩',
      badge_first_desc: '1回 さいごまで 遊ぶ',
      badge_checker_name: '送信元チェッカー',
      badge_checker_desc: '「たしかめる」を 10回 使う',
      badge_streak_name: '5連続 正解',
      badge_streak_desc: '本編で 5問 つづけて 正解する',
      badge_real_name: '本物も わかる',
      badge_real_desc: '本物の メッセージを「本物」と 正しく えらぶ',
      badge_detective_name: 'さがす 名人',
      badge_detective_desc: 'あやしい ところを ちょうど 全部 えらぶ（3回）',
      badge_perfect_name: 'パーフェクト',
      badge_perfect_desc: '本編の 5問 ぜんぶ 正解する',
      badge_allcat_name: '全カテゴリ制覇',
      badge_allcat_desc: 'ぜんぶの カテゴリで 2問 以上 正解する'
    },

    en: {
      skipLink: 'Skip to main content',
      banner: 'This is a simulated screen for learning. It is not related to any real university or company, and links go nowhere.',
      appTitle: 'Phishing Spotter Training',
      settings: 'Settings',
      loading: 'Loading…',
      startHeading: 'Learn to spot fake messages',
      startBackground: 'In October 2026, Osaka Metropolitan University was hit by a ransomware attack, and personal data of about 130,000 people may have been leaked (the university is still investigating; no leak has been confirmed). With notices about password resets and registering personal email addresses going out, fake messages pretending to be the university can easily slip in.',
      howToHeading: 'How to play',
      howTo1: 'Pre-test (3 questions): measures your current skill.',
      howTo2: 'Main game (5 questions): look at a simulated email, SMS or chat, check the sender or link destination, then decide.',
      howTo3: 'Post-test (3 questions): measures your skill after practice.',
      howTo4: 'Copy your results and paste them into the Google Form your group provides.',
      startTime: 'Time: about 3–4 minutes',
      settingsHeading: 'Display settings',
      privacy: 'This app collects no personal information and sends nothing anywhere. Records are stored only in this browser on this device.',
      start: 'Start',
      language: 'Language',
      langJa: 'ふつうの日本語',
      langEasy: 'やさしい日本語',
      langEn: 'English',
      fontSize: 'Text size',
      fontS: 'Small',
      fontM: 'Medium',
      fontL: 'Large',
      theme: 'Color theme',
      themeAuto: 'Match device',
      themeLight: 'Light',
      themeDark: 'Dark',
      close: 'Close',
      reset: 'Clear records',
      resetConfirm: 'This will clear your scores, badges and other records. Continue?',
      resetDone: 'Records cleared.',
      storageOff: 'Records cannot be saved in this environment. They are kept only during this session.',
      enFallback: 'Note: English versions of the messages are not ready yet, so the simulated messages and explanations are shown in Japanese.',
      errorHeading: 'Could not load the questions',
      loadError: 'questions.json could not be loaded. Browsers block this when the file is opened by double-clicking. See “Opening locally” in README.md and open it through a local server.',

      stagePre: 'Pre-test',
      stageMain: 'Main game',
      stagePost: 'Post-test',
      introPreTitle: 'Pre-test (3 questions)',
      introPreText: 'This measures your current skill. Just decide; no answers or explanations are shown.',
      introMainTitle: 'Main game (5 questions)',
      introMainText: 'Before deciding, open “Check sender” or “Check links”. If you choose “Suspicious”, also select the suspicious parts.',
      introPostTitle: 'Post-test (3 questions)',
      introPostText: 'This measures your skill after practice. Just decide, as in the pre-test.',
      introGo: 'Start',
      counter: 'Question {n} of {total}',
      scoreLabel: 'Score',
      streakLabel: 'Streak',
      quizHeading: 'Examine this message',
      mockLabel: 'Simulated screen for learning',
      channel_email: 'Email',
      channel_sms: 'SMS',
      channel_line: 'Chat app (LINE-style)',
      fromLabel: 'From',
      toLabel: 'To',
      toYou: 'You',
      subjectLabel: 'Subject',
      chatUnknownNote: 'This message is from someone not in your friends list',
      checkTitle: 'Check first',
      checkHint: 'Before deciding, open either “Check sender” or “Check links”.',
      checkHintTest: 'Checking is optional in the pre- and post-tests.',
      checkSender: 'Check sender',
      checkLinks: 'Check links',
      checkedMark: 'Checked',
      senderDisplay: 'Name shown on screen',
      senderActual: 'Actual sender',
      linkDisplay: 'Text shown',
      linkActual: 'Actual destination',
      noLinks: 'This message has no links.',
      judgeTitle: 'Is this message…',
      judgeReal: 'Genuine',
      judgeFake: 'Suspicious',
      judgeLocked: 'Open “Check sender” or “Check links” first.',
      pickTitle: 'Select the suspicious parts',
      pickHint: 'In the simulated screen above, tap the parts you find suspicious (sender, subject, links, dotted text), then press “Done”. You can select as many as you like.',
      pickCount: '{n} selected',
      pickDone: 'Done',
      pickGroup: 'Select suspicious parts',
      partSender: 'Sender',
      partSubject: 'Subject',
      partLink: 'Link',
      correct: 'Correct',
      incorrect: 'Incorrect',
      wasFake: 'This was a phishing / impersonation message.',
      wasReal: 'This was a genuine message.',
      pointsGained: '+{n} pts',
      pointsTitle: 'Red flags',
      realPointsTitle: 'Why it is genuine',
      found: 'Found',
      missed: 'Missed',
      extraTitle: 'These parts were not key red flags:',
      actionTitle: 'If you receive this for real',
      suspiciousMarker: '(suspicious part)',
      next: 'Next',
      toPost: 'Go to post-test',
      toResult: 'See results',
      answered: 'Answer recorded.',
      linkToast: 'This is a simulated screen, so links do not open. Use “Check links” to see where they go.',

      resultHeading: 'Results',
      totalScore: 'Score',
      mainAccuracy: 'Main game accuracy',
      bestStreak: 'Best streak',
      prePostTitle: 'Pre-test → Post-test',
      prePostUp: 'Up by {n}!',
      prePostSame: 'No change.',
      prePostDown: 'Down by {n}. Try again!',
      catTitle: 'Skill by category',
      catThisPlay: 'This time',
      catOverall: 'All time',
      catNone: 'Not yet played',
      weakest: 'Your weakest category is “{cat}”. Play again to practice.',
      noWeak: 'No weak category found yet.',
      badgesTitle: 'Badges',
      badgeEarned: 'Earned',
      badgeLocked: 'Locked',
      badgeNew: 'NEW',
      nudgeTitle: '3 things to do when unsure',
      nudge1: 'Don’t tap links in emails or texts. Open the official website or app yourself to check.',
      nudge2: 'Don’t decide alone. Ask the university office, family or friends.',
      nudge3: 'If you entered information, replied or paid, change your password right away and contact your card company, the police (#9110) or the consumer hotline (188).',
      copyTitle: 'Submit your results',
      copyHelp: 'This app does not send your results. Press “Copy results” and paste them into the Google Form your group provides.',
      copy: 'Copy results',
      copied: 'Copied. Paste it into the Google Form.',
      copyFail: 'Could not copy. Please select the text in the box below and copy it.',
      copyBoxLabel: 'Result text to copy',
      again: 'Play again',
      home: 'Back to start',

      txtTitle: '[Phishing Spotter Training – Results]',
      txtDate: 'Date',
      txtPre: 'Pre-test',
      txtPost: 'Post-test',
      txtChange: 'Change',
      txtMain: 'Main game',
      txtScore: 'Score',
      txtStreak: 'Best streak',
      txtChecks: 'Checks used',
      txtChecksUnit: '',
      txtCategory: 'By category (this time)',
      txtBadges: 'Badges',
      txtNone: 'none',
      txtLang: 'Language',

      badge_first_name: 'First Step',
      badge_first_desc: 'Finish one play',
      badge_checker_name: 'Sender Checker',
      badge_checker_desc: 'Use the check step 10 times',
      badge_streak_name: '5 in a Row',
      badge_streak_desc: 'Answer 5 main questions correctly in a row',
      badge_real_name: 'Real Deal',
      badge_real_desc: 'Correctly identify a genuine message',
      badge_detective_name: 'Detective',
      badge_detective_desc: 'Select exactly the right suspicious parts (3 times)',
      badge_perfect_name: 'Perfect',
      badge_perfect_desc: 'Get all 5 main questions right',
      badge_allcat_name: 'All Categories',
      badge_allcat_desc: 'Get at least 2 correct in every category'
    }
  };

  var BADGES = [
    { id: 'first', icon: '🎓', test: function (s) { return s.plays >= 1; } },
    { id: 'checker', icon: '🔍', test: function (s) { return s.checks >= CHECK_BADGE_TARGET; } },
    { id: 'streak', icon: '🔥', test: function (s) { return s.bestStreak >= 5; } },
    { id: 'real', icon: '✅', test: function (s) { return s.realCorrect >= 1; } },
    { id: 'detective', icon: '🕵', test: function (s) { return s.perfectPicks >= 3; } },
    { id: 'perfect', icon: '🏆', test: function (s) { return s.perfectPlays >= 1; } },
    {
      id: 'allcat', icon: '🌐', test: function (s) {
        var cats = Object.keys(data.categories);
        return cats.length > 0 && cats.every(function (c) {
          return s.category[c] && s.category[c].correct >= CATEGORY_BADGE_TARGET;
        });
      }
    }
  ];

  /* ------------------------------------------------------------------
   * 保存（localStorage が使えなくても動くように try/catch で包む）
   * ------------------------------------------------------------------ */
  var storageAvailable = true;

  function defaultSaved() {
    return {
      settings: { lang: 'ja', font: 'm', theme: 'auto' },
      stats: {
        plays: 0, checks: 0, bestStreak: 0, realCorrect: 0,
        perfectPicks: 0, perfectPlays: 0, seen: [], category: {}
      },
      badges: []
    };
  }

  function loadSaved() {
    var base = defaultSaved();
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      // 書き込みもできるか確認（容量ゼロの環境などを検出）
      window.localStorage.setItem(STORAGE_KEY + '.probe', '1');
      window.localStorage.removeItem(STORAGE_KEY + '.probe');
      if (!raw) return base;
      var d = JSON.parse(raw);
      return {
        settings: Object.assign(base.settings, d.settings || {}),
        stats: Object.assign(base.stats, d.stats || {}),
        badges: Array.isArray(d.badges) ? d.badges : []
      };
    } catch (e) {
      storageAvailable = false;
      return base;
    }
  }

  function persist() {
    if (!storageAvailable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      storageAvailable = false;
      updateStorageNotice();
    }
  }

  /* ------------------------------------------------------------------
   * 状態
   * ------------------------------------------------------------------ */
  var data = { categories: {}, questions: [], preTest: [], postTest: [] };
  var byId = {};
  var saved = loadSaved();
  var session = null; // 1回のプレイ
  var qs = null; // 表示中の1問の状態
  var currentScreen = 'loading';

  function lang() { return saved.settings.lang; }

  function t(key, vars) {
    var table = UI[lang()] || UI.ja;
    var s = table[key];
    if (s === undefined) s = UI.ja[key];
    if (s === undefined) s = key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
    }
    return s;
  }

  // 問題データの文：{ ja, easy, en } のうち表示中の言語。なければ ja を使う。
  function L(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    return v[lang()] || v.ja || '';
  }

  /* ------------------------------------------------------------------
   * 小さなDOMヘルパー（文字は textContent で入れるので安全）
   * ------------------------------------------------------------------ */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function $(sel) { return document.querySelector(sel); }

  var toastTimer = null;
  function toast(message) {
    var box = $('#toast');
    box.textContent = message;
    box.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.classList.remove('is-visible'); }, 3500);
  }

  function announce(message) {
    var live = $('#sr-live');
    live.textContent = '';
    setTimeout(function () { live.textContent = message; }, 50);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* ------------------------------------------------------------------
   * 設定（言語・文字サイズ・テーマ）
   * ------------------------------------------------------------------ */
  function applySettings() {
    var root = document.documentElement;
    root.lang = lang() === 'en' ? 'en' : 'ja';
    root.setAttribute('data-font', saved.settings.font);
    if (saved.settings.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', saved.settings.theme);
    document.title = t('appTitle');

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-en-only]').forEach(function (node) {
      node.hidden = lang() !== 'en';
    });
    document.querySelectorAll('.settings-slot').forEach(renderSettings);
    updateStorageNotice();
  }

  function updateStorageNotice() {
    document.querySelectorAll('[data-storage-notice]').forEach(function (node) {
      node.hidden = storageAvailable;
      node.textContent = t('storageOff');
    });
  }

  function renderSettings(slot) {
    var prefix = slot.getAttribute('data-settings-prefix');
    slot.textContent = '';
    var groups = [
      { key: 'lang', legend: 'language', options: [['ja', 'langJa'], ['easy', 'langEasy'], ['en', 'langEn']] },
      { key: 'font', legend: 'fontSize', options: [['s', 'fontS'], ['m', 'fontM'], ['l', 'fontL']] },
      { key: 'theme', legend: 'theme', options: [['auto', 'themeAuto'], ['light', 'themeLight'], ['dark', 'themeDark']] }
    ];
    groups.forEach(function (g) {
      var fs = el('fieldset', { class: 'segmented' }, [el('legend', { text: t(g.legend) })]);
      var row = el('div', { class: 'segmented__options' });
      g.options.forEach(function (opt) {
        var id = prefix + '-' + g.key + '-' + opt[0];
        var input = el('input', {
          type: 'radio', name: prefix + '-' + g.key, id: id, value: opt[0],
          checked: saved.settings[g.key] === opt[0],
          lang: g.key === 'lang' ? (opt[0] === 'en' ? 'en' : 'ja') : null
        });
        input.addEventListener('change', function () {
          saved.settings[g.key] = opt[0];
          persist();
          applySettings();
          rerenderCurrent();
          var again = document.getElementById(id);
          if (again) again.focus();
        });
        row.appendChild(el('div', { class: 'segmented__item' }, [
          input,
          el('label', { for: id, text: t(opt[1]) })
        ]));
      });
      fs.appendChild(row);
      slot.appendChild(fs);
    });
  }

  /* ------------------------------------------------------------------
   * 画面の切り替え
   * ------------------------------------------------------------------ */
  function showScreen(name, focusSelector) {
    currentScreen = name;
    document.querySelectorAll('.screen').forEach(function (s) {
      s.hidden = s.id !== 'screen-' + name;
    });
    var target = focusSelector === false ? null : (focusSelector ? $(focusSelector) : $('#screen-' + name + ' h1'));
    if (target) target.focus();
    window.scrollTo(0, 0);
  }

  function rerenderCurrent() {
    if (currentScreen === 'quiz') renderQuiz(null);
    else if (currentScreen === 'result') renderResult(false);
  }

  /* ------------------------------------------------------------------
   * プレイの開始と出題順
   * ------------------------------------------------------------------ */
  function idsExisting(ids) {
    return (ids || []).filter(function (id) { return byId[id]; });
  }

  function categoryAccuracy(cat) {
    var c = saved.stats.category[cat];
    if (!c || !c.total) return null;
    return c.correct / c.total;
  }

  // 本編：まだ解いていない問題・苦手なカテゴリを優先し、本物と偽物を両方混ぜる
  function pickMainQuestions() {
    var testIds = data.preTest.concat(data.postTest);
    var pool = data.questions.filter(function (q) { return testIds.indexOf(q.id) === -1; });
    if (pool.length < MAIN_COUNT) pool = data.questions.slice();
    var seen = saved.stats.seen;
    var ranked = shuffle(pool).map(function (q) {
      var acc = categoryAccuracy(q.category);
      var w = Math.random();
      if (seen.indexOf(q.id) === -1) w += 2;
      if (acc !== null) w += (1 - acc) * 2;
      return { q: q, w: w };
    }).sort(function (a, b) { return b.w - a.w; }).map(function (x) { return x.q; });

    var chosen = ranked.slice(0, MAIN_COUNT);
    var rest = ranked.slice(MAIN_COUNT);
    [false, true].forEach(function (phishing) {
      var has = chosen.some(function (q) { return q.isPhishing === phishing; });
      if (has) return;
      var swapIn = rest.filter(function (q) { return q.isPhishing === phishing; })[0];
      if (!swapIn) return;
      for (var i = chosen.length - 1; i >= 0; i--) {
        var count = chosen.filter(function (q) { return q.isPhishing === chosen[i].isPhishing; }).length;
        if (count > 1) { chosen[i] = swapIn; break; }
      }
    });
    return shuffle(chosen).map(function (q) { return q.id; });
  }

  function startPlay() {
    session = {
      stages: [
        { key: 'pre', ids: idsExisting(data.preTest) },
        { key: 'main', ids: pickMainQuestions() },
        { key: 'post', ids: idsExisting(data.postTest) }
      ].filter(function (s) { return s.ids.length > 0; }),
      stageIndex: 0,
      index: -1, // -1 = ステージの説明画面
      results: { pre: [], main: [], post: [] },
      score: 0,
      streak: 0,
      bestStreak: 0,
      checks: 0,
      newBadges: []
    };
    qs = null;
    renderQuiz('#quiz-heading');
    showScreen('quiz', '#quiz-heading');
  }

  function stage() { return session.stages[session.stageIndex]; }

  function startQuestion() {
    var id = stage().ids[session.index];
    qs = {
      q: byId[id],
      checked: { sender: false, links: false },
      open: null,
      judgment: null,
      picks: [],
      phase: 'inspect',
      outcome: null
    };
  }

  function goNext() {
    var st = stage();
    if (session.index < st.ids.length - 1) {
      session.index++;
      startQuestion();
    } else if (session.stageIndex < session.stages.length - 1) {
      session.stageIndex++;
      session.index = -1;
      qs = null;
    } else {
      finishPlay();
      return;
    }
    renderQuiz('#quiz-heading');
  }

  /* ------------------------------------------------------------------
   * 模擬画面の描画
   * ------------------------------------------------------------------ */
  function parseRich(text) {
    var re = /\{\{([\w-]+)\|([^}]*)\}\}|\[\[([\w-]+)\]\]/g;
    var parts = [];
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ type: 'text', text: text.slice(last, m.index) });
      if (m[1]) parts.push({ type: 'mark', id: m[1], text: m[2] });
      else parts.push({ type: 'link', id: m[3] });
      last = re.lastIndex;
    }
    if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
    return parts;
  }

  function findLink(q, id) {
    return (q.links || []).filter(function (l) { return l.id === id; })[0];
  }

  // 指摘できる箇所の一覧（id → 表示用ラベル）
  function targetLabels(q) {
    var labels = {};
    labels.sender = t('partSender') + '：' + L(q.sender.name);
    if (q.channel === 'email' && q.subject) labels.subject = t('partSubject') + '：' + L(q.subject);
    (q.links || []).forEach(function (l) { labels[l.id] = t('partLink') + '：' + L(l.text); });
    parseRich(L(q.body)).forEach(function (p) {
      if (p.type === 'mark') labels[p.id] = '「' + p.text + '」';
    });
    return labels;
  }

  // mode: 'view'（見るだけ）/ 'pick'（箇所を選ぶ）/ 'feedback'（答え合わせ）
  function makeTarget(id, content, mode, extraClass) {
    var cls = 'target ' + (extraClass || '');
    if (mode === 'pick') {
      var pressed = qs.picks.indexOf(id) !== -1;
      return el('button', {
        type: 'button', class: cls + ' target--pickable', 'aria-pressed': pressed ? 'true' : 'false',
        'data-target': id, onclick: function () { togglePick(id); }
      }, [el('span', { class: 'target__check', 'aria-hidden': 'true', text: pressed ? '✓' : '' }), content]);
    }
    var suspicious = mode === 'feedback' && qs.q.suspiciousParts.some(function (p) { return p.id === id; });
    var span = el('span', { class: cls + (suspicious ? ' target--suspicious' : '') }, [
      suspicious ? el('span', { class: 'target__flag', 'aria-hidden': 'true', text: '!' }) : null,
      content,
      suspicious ? el('span', { class: 'visually-hidden', text: t('suspiciousMarker') }) : null
    ]);
    return span;
  }

  function renderRich(text, mode) {
    var frag = document.createDocumentFragment();
    parseRich(text).forEach(function (p) {
      if (p.type === 'text') {
        frag.appendChild(document.createTextNode(p.text));
      } else if (p.type === 'mark') {
        frag.appendChild(makeTarget(p.id, document.createTextNode(p.text), mode, 'target--text'));
      } else {
        var link = findLink(qs.q, p.id);
        if (!link) return;
        if (mode === 'view') {
          // 本物のリンクにはせず、押しても移動しないボタンにする
          frag.appendChild(el('button', {
            type: 'button', class: 'mock-link',
            onclick: function () { toast(t('linkToast')); }
          }, [L(link.text)]));
        } else {
          frag.appendChild(makeTarget(p.id, el('span', { class: 'mock-link-text', text: L(link.text) }), mode, 'target--link'));
        }
      }
    });
    return frag;
  }

  function renderMock(mode) {
    var q = qs.q;
    var channel = q.channel;
    var wrap = el('figure', {
      class: 'mock mock--' + channel,
      'aria-label': t('mockLabel') + '（' + t('channel_' + channel) + '）'
    });
    wrap.appendChild(el('figcaption', { class: 'mock__bar' }, [
      el('span', { class: 'mock__badge', text: t('mockLabel') }),
      el('span', { class: 'mock__channel', text: t('channel_' + channel) })
    ]));

    var screen = el('div', { class: 'mock__screen' });
    if (mode === 'pick') {
      screen.setAttribute('role', 'group');
      screen.setAttribute('aria-label', t('pickGroup'));
    }
    var senderName = L(q.sender.name);

    if (channel === 'email') {
      var head = el('div', { class: 'mail__head' });
      if (q.subject) {
        head.appendChild(el('p', { class: 'mail__subject' }, [
          el('span', { class: 'visually-hidden', text: t('subjectLabel') + '：' }),
          makeTarget('subject', document.createTextNode(L(q.subject)), mode, 'target--subject')
        ]));
      }
      head.appendChild(el('div', { class: 'mail__from' }, [
        el('span', { class: 'mail__avatar', 'aria-hidden': 'true', text: senderName.replace(/^[○\s]+/, '').charAt(0) || '?' }),
        el('div', { class: 'mail__meta' }, [
          el('p', {}, [
            el('span', { class: 'mail__label', text: t('fromLabel') + '：' }),
            makeTarget('sender', el('strong', { text: senderName }), mode, 'target--sender')
          ]),
          el('p', { class: 'mail__to' }, [t('toLabel') + '：' + t('toYou') + (q.time ? '　' + q.time : '')])
        ])
      ]));
      screen.appendChild(head);
      screen.appendChild(el('div', { class: 'mail__body' }, [renderRich(L(q.body), mode)]));
    } else {
      var chatHead = el('div', { class: 'chat__head' }, [
        el('span', { class: 'chat__avatar', 'aria-hidden': 'true', text: channel === 'sms' ? '✉' : senderName.charAt(0) }),
        makeTarget('sender', el('strong', { text: senderName }), mode, 'target--sender')
      ]);
      screen.appendChild(chatHead);
      var list = el('div', { class: 'chat__list' });
      if (q.time) list.appendChild(el('p', { class: 'chat__time', text: q.time }));
      L(q.body).split(/\n{2,}/).forEach(function (para) {
        list.appendChild(el('p', { class: 'chat__bubble' }, [renderRich(para, mode)]));
      });
      screen.appendChild(list);
    }
    wrap.appendChild(screen);
    return wrap;
  }

  /* ------------------------------------------------------------------
   * 出題画面
   * ------------------------------------------------------------------ */
  function renderQuiz(focusSelector) {
    var root = $('#screen-quiz');
    var activeId = document.activeElement && document.activeElement.id;
    root.textContent = '';
    var st = stage();
    var stageName = t('stage' + st.key.charAt(0).toUpperCase() + st.key.slice(1));

    // ステージの説明
    if (session.index === -1) {
      var key = 'intro' + st.key.charAt(0).toUpperCase() + st.key.slice(1);
      root.appendChild(el('p', { class: 'stage-label', text: stageName }));
      root.appendChild(el('h1', { id: 'quiz-heading', tabindex: '-1', text: t(key + 'Title') }));
      root.appendChild(el('p', { text: t(key + 'Text') }));
      root.appendChild(el('button', {
        type: 'button', class: 'btn btn--primary btn--large', id: 'stage-go',
        onclick: function () { session.index = 0; startQuestion(); renderQuiz('#quiz-heading'); }
      }, [t('introGo')]));
      restoreFocus(focusSelector, activeId);
      return;
    }

    var q = qs.q;
    var isTest = st.key !== 'main';

    // 上部：ステージ・問題数・スコア
    var top = el('div', { class: 'quiz-top' }, [
      el('p', { class: 'stage-label', text: stageName }),
      el('p', { class: 'quiz-counter', text: t('counter', { n: session.index + 1, total: st.ids.length }) })
    ]);
    if (!isTest) {
      top.appendChild(el('p', { class: 'quiz-stats' }, [
        el('span', { class: 'chip' }, [t('scoreLabel') + ' ', el('strong', { text: String(session.score) })]),
        el('span', { class: 'chip' }, [el('span', { 'aria-hidden': 'true', text: '🔥 ' }), t('streakLabel') + ' ', el('strong', { text: String(session.streak) })])
      ]));
    }
    root.appendChild(top);
    root.appendChild(el('div', { class: 'progress', 'aria-hidden': 'true' }, [
      el('div', { class: 'progress__bar', style: 'width:' + Math.round(((session.index + (qs.phase === 'feedback' ? 1 : 0)) / st.ids.length) * 100) + '%' })
    ]));
    root.appendChild(el('h1', { id: 'quiz-heading', class: 'h2', tabindex: '-1', text: t('quizHeading') }));
    if (lang() === 'en') root.appendChild(el('p', { class: 'notice notice--en', text: t('enFallback') }));

    root.appendChild(renderMock(qs.phase === 'pick' ? 'pick' : (qs.phase === 'feedback' ? 'feedback' : 'view')));

    if (qs.phase === 'inspect') {
      root.appendChild(renderCheckPanel(isTest));
      root.appendChild(renderJudgePanel(isTest));
    } else if (qs.phase === 'pick') {
      root.appendChild(renderPickPanel());
    } else if (qs.phase === 'feedback') {
      root.appendChild(renderFeedback());
    }
    restoreFocus(focusSelector, activeId);
  }

  function restoreFocus(selector, activeId) {
    var target = selector ? $(selector) : (activeId ? document.getElementById(activeId) : null);
    if (target) target.focus();
  }

  function renderCheckPanel(isTest) {
    var q = qs.q;
    var panel = el('section', { class: 'card check-panel', 'aria-labelledby': 'check-title' }, [
      el('h2', { id: 'check-title', class: 'h3' }, [el('span', { 'aria-hidden': 'true', text: '🔎 ' }), t('checkTitle')]),
      el('p', { id: 'check-hint', class: 'muted', text: isTest ? t('checkHintTest') : t('checkHint') })
    ]);

    var buttons = el('div', { class: 'check-buttons' });
    [['sender', 'checkSender'], ['links', 'checkLinks']].forEach(function (pair) {
      var kind = pair[0];
      var open = qs.open === kind;
      buttons.appendChild(el('button', {
        type: 'button', id: 'check-' + kind,
        class: 'btn btn--check' + (open ? ' is-open' : ''),
        'aria-expanded': open ? 'true' : 'false',
        'aria-controls': 'reveal-' + kind,
        onclick: function () { toggleCheck(kind); }
      }, [
        t(pair[1]),
        qs.checked[kind] ? el('span', { class: 'check-done' }, [el('span', { 'aria-hidden': 'true', text: ' ✓' }), el('span', { class: 'visually-hidden', text: '（' + t('checkedMark') + '）' })]) : null
      ]));
    });
    panel.appendChild(buttons);

    var senderBox = el('div', { id: 'reveal-sender', class: 'reveal', hidden: qs.open !== 'sender' }, [
      el('dl', { class: 'reveal__list' }, [
        el('dt', { text: t('senderDisplay') }), el('dd', { text: L(q.sender.name) }),
        el('dt', { text: t('senderActual') }), el('dd', { class: 'mono', text: L(q.sender.address) })
      ])
    ]);
    var linkChildren = [];
    if (!q.links || q.links.length === 0) {
      linkChildren.push(el('p', { text: t('noLinks') }));
    } else {
      q.links.forEach(function (l) {
        linkChildren.push(el('dl', { class: 'reveal__list' }, [
          el('dt', { text: t('linkDisplay') }), el('dd', { text: L(l.text) }),
          el('dt', { text: t('linkActual') }), el('dd', { class: 'mono', text: l.url })
        ]));
      });
    }
    var linksBox = el('div', { id: 'reveal-links', class: 'reveal', hidden: qs.open !== 'links' }, linkChildren);
    panel.appendChild(senderBox);
    panel.appendChild(linksBox);
    return panel;
  }

  function toggleCheck(kind) {
    qs.open = qs.open === kind ? null : kind;
    if (qs.open && !qs.checked[kind]) {
      qs.checked[kind] = true;
      session.checks++;
      saved.stats.checks++;
      persist();
    }
    renderQuiz('#check-' + kind);
  }

  function judgeUnlocked(isTest) {
    return isTest || qs.checked.sender || qs.checked.links;
  }

  function renderJudgePanel(isTest) {
    var unlocked = judgeUnlocked(isTest);
    var panel = el('section', { class: 'card judge-panel', 'aria-labelledby': 'judge-title' }, [
      el('h2', { id: 'judge-title', class: 'h3', text: t('judgeTitle') })
    ]);
    if (!unlocked) {
      panel.appendChild(el('p', { id: 'judge-locked', class: 'lock-note' }, [
        el('span', { 'aria-hidden': 'true', text: '🔒 ' }), t('judgeLocked')
      ]));
    }
    var row = el('div', { class: 'judge-buttons' });
    [['real', 'judgeReal', '✔'], ['fake', 'judgeFake', '⚠']].forEach(function (j) {
      row.appendChild(el('button', {
        type: 'button', id: 'judge-' + j[0],
        class: 'btn btn--judge btn--judge-' + j[0],
        'aria-disabled': unlocked ? null : 'true',
        'aria-describedby': unlocked ? null : 'judge-locked',
        onclick: function () { judge(j[0]); }
      }, [el('span', { 'aria-hidden': 'true', text: j[2] + ' ' }), t(j[1])]));
    });
    panel.appendChild(row);
    return panel;
  }

  function judge(choice) {
    var st = stage();
    var isTest = st.key !== 'main';
    if (!judgeUnlocked(isTest)) {
      toast(t('judgeLocked'));
      announce(t('judgeLocked'));
      var btn = $('#check-sender');
      if (btn) btn.focus();
      return;
    }
    qs.judgment = choice;
    if (isTest) {
      session.results[st.key].push({
        id: qs.q.id, category: qs.q.category,
        correct: (choice === 'fake') === qs.q.isPhishing
      });
      announce(t('answered'));
      goNext();
      return;
    }
    if (choice === 'fake') {
      qs.phase = 'pick';
      renderQuiz('#pick-title');
    } else {
      finalizeMain();
    }
  }

  function renderPickPanel() {
    return el('section', { class: 'card pick-panel', 'aria-labelledby': 'pick-title' }, [
      el('h2', { id: 'pick-title', class: 'h3', tabindex: '-1' }, [el('span', { 'aria-hidden': 'true', text: '👆 ' }), t('pickTitle')]),
      el('p', { class: 'muted', text: t('pickHint') }),
      el('p', { class: 'pick-count', 'aria-live': 'polite', text: t('pickCount', { n: qs.picks.length }) }),
      el('button', { type: 'button', id: 'pick-done', class: 'btn btn--primary btn--large', onclick: finalizeMain }, [t('pickDone')])
    ]);
  }

  function togglePick(id) {
    var i = qs.picks.indexOf(id);
    if (i === -1) qs.picks.push(id); else qs.picks.splice(i, 1);
    var focusId = id;
    renderQuiz('[data-target="' + focusId + '"]');
  }

  function finalizeMain() {
    var q = qs.q;
    var correct = (qs.judgment === 'fake') === q.isPhishing;
    var suspiciousIds = q.suspiciousParts.map(function (p) { return p.id; });
    var hits = qs.picks.filter(function (id) { return suspiciousIds.indexOf(id) !== -1; });
    var extras = qs.picks.filter(function (id) { return suspiciousIds.indexOf(id) === -1; });
    var points = 0;
    if (correct) {
      points = 10;
      if (q.isPhishing) points += Math.max(0, hits.length * 2 - extras.length);
    }
    session.score += points;
    if (correct) {
      session.streak++;
      session.bestStreak = Math.max(session.bestStreak, session.streak);
    } else {
      session.streak = 0;
    }

    var s = saved.stats;
    s.bestStreak = Math.max(s.bestStreak, session.bestStreak);
    if (!s.category[q.category]) s.category[q.category] = { correct: 0, total: 0 };
    s.category[q.category].total++;
    if (correct) s.category[q.category].correct++;
    if (s.seen.indexOf(q.id) === -1) s.seen.push(q.id);
    if (correct && !q.isPhishing) s.realCorrect++;
    if (correct && q.isPhishing && hits.length === suspiciousIds.length && extras.length === 0) s.perfectPicks++;

    session.results.main.push({ id: q.id, category: q.category, correct: correct });
    qs.outcome = { correct: correct, hits: hits, extras: extras, points: points };
    qs.phase = 'feedback';
    awardBadges();
    persist();
    renderQuiz('#verdict');
  }

  function renderFeedback() {
    var q = qs.q;
    var o = qs.outcome;
    var labels = targetLabels(q);
    var box = el('section', { class: 'card feedback ' + (o.correct ? 'feedback--ok' : 'feedback--ng'), 'aria-labelledby': 'verdict' });

    box.appendChild(el('h2', { id: 'verdict', class: 'verdict', tabindex: '-1' }, [
      el('span', { class: 'verdict__icon', 'aria-hidden': 'true', text: o.correct ? '✔' : '✖' }),
      o.correct ? t('correct') : t('incorrect'),
      o.points > 0 ? el('span', { class: 'verdict__points', text: t('pointsGained', { n: o.points }) }) : null
    ]));
    box.appendChild(el('p', { class: 'verdict__truth' }, [
      el('span', { 'aria-hidden': 'true', text: q.isPhishing ? '⚠ ' : '✔ ' }),
      q.isPhishing ? t('wasFake') : t('wasReal')
    ]));

    if (q.isPhishing) {
      box.appendChild(el('h3', { class: 'h4', text: t('pointsTitle') }));
      var list = el('ul', { class: 'points' });
      var picked = qs.judgment === 'fake';
      q.suspiciousParts.forEach(function (p) {
        var found = o.hits.indexOf(p.id) !== -1;
        list.appendChild(el('li', { class: 'point' + (picked ? (found ? ' point--found' : ' point--missed') : '') }, [
          picked ? el('span', { class: 'point__tag' }, [
            el('span', { 'aria-hidden': 'true', text: found ? '✔ ' : '○ ' }), found ? t('found') : t('missed')
          ]) : null,
          el('strong', { class: 'point__label', text: labels[p.id] || p.id }),
          el('span', { class: 'point__reason', text: L(p.reason) })
        ]));
      });
      box.appendChild(list);
      box.appendChild(el('p', { text: L(q.explanation) }));
    } else {
      box.appendChild(el('h3', { class: 'h4', text: t('realPointsTitle') }));
      box.appendChild(el('p', { text: L(q.explanation) }));
    }
    if (o.extras.length) {
      box.appendChild(el('p', { class: 'muted' }, [
        t('extraTitle') + ' ' + o.extras.map(function (id) { return labels[id] || id; }).join('、')
      ]));
    }

    box.appendChild(el('div', { class: 'action-box' }, [
      el('h3', { class: 'h4' }, [el('span', { 'aria-hidden': 'true', text: '🛡 ' }), t('actionTitle')]),
      el('p', { text: L(q.action) })
    ]));

    var st = stage();
    var lastInStage = session.index >= st.ids.length - 1;
    var hasNextStage = session.stageIndex < session.stages.length - 1;
    var label = !lastInStage ? t('next') : (hasNextStage ? t('toPost') : t('toResult'));
    box.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--large', id: 'next-button', onclick: goNext }, [label]));
    return box;
  }

  /* ------------------------------------------------------------------
   * バッジ
   * ------------------------------------------------------------------ */
  function awardBadges() {
    BADGES.forEach(function (b) {
      if (saved.badges.indexOf(b.id) === -1 && b.test(saved.stats)) {
        saved.badges.push(b.id);
        session.newBadges.push(b.id);
        toast(b.icon + ' ' + t('badge_' + b.id + '_name'));
      }
    });
  }

  /* ------------------------------------------------------------------
   * 結果画面
   * ------------------------------------------------------------------ */
  function finishPlay() {
    saved.stats.plays++;
    var main = session.results.main;
    if (main.length >= MAIN_COUNT && main.every(function (r) { return r.correct; })) saved.stats.perfectPlays++;
    awardBadges();
    persist();
    renderResult(true);
    showScreen('result', '#result-heading');
  }

  function countCorrect(list) {
    return list.filter(function (r) { return r.correct; }).length;
  }

  function categoryThisPlay() {
    var out = {};
    session.results.main.forEach(function (r) {
      if (!out[r.category]) out[r.category] = { correct: 0, total: 0 };
      out[r.category].total++;
      if (r.correct) out[r.category].correct++;
    });
    return out;
  }

  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  function buildResultText() {
    var r = session.results;
    var pre = countCorrect(r.pre), post = countCorrect(r.post);
    var diff = post - pre;
    var main = countCorrect(r.main);
    var cats = categoryThisPlay();
    var d = new Date();
    var date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    var catText = Object.keys(data.categories).filter(function (c) { return cats[c]; }).map(function (c) {
      return L(data.categories[c]) + ' ' + cats[c].correct + '/' + cats[c].total;
    }).join(', ') || t('txtNone');
    var badgeText = saved.badges.map(function (id) { return t('badge_' + id + '_name'); }).join(', ') || t('txtNone');
    return [
      t('txtTitle'),
      t('txtDate') + ': ' + date,
      t('txtPre') + ': ' + pre + '/' + r.pre.length,
      t('txtPost') + ': ' + post + '/' + r.post.length,
      t('txtChange') + ': ' + (diff > 0 ? '+' : '') + diff,
      t('txtMain') + ': ' + main + '/' + r.main.length + ' (' + pct(main, r.main.length) + '%)',
      t('txtScore') + ': ' + session.score,
      t('txtStreak') + ': ' + session.bestStreak,
      t('txtChecks') + ': ' + session.checks + t('txtChecksUnit'),
      t('txtCategory') + ': ' + catText,
      t('txtBadges') + ': ' + badgeText,
      t('txtLang') + ': ' + t({ ja: 'langJa', easy: 'langEasy', en: 'langEn' }[lang()])
    ].join('\n');
  }

  function renderResult() {
    var root = $('#screen-result');
    var activeId = document.activeElement && document.activeElement.id;
    root.textContent = '';
    var r = session.results;
    var pre = countCorrect(r.pre), post = countCorrect(r.post);
    var main = countCorrect(r.main);
    var diff = post - pre;

    root.appendChild(el('h1', { id: 'result-heading', tabindex: '-1', text: t('resultHeading') }));
    if (lang() === 'en') root.appendChild(el('p', { class: 'notice notice--en', text: t('enFallback') }));

    root.appendChild(el('div', { class: 'stat-grid' }, [
      statTile(t('totalScore'), String(session.score)),
      statTile(t('mainAccuracy'), pct(main, r.main.length) + '%', main + ' / ' + r.main.length),
      statTile(t('bestStreak'), String(session.bestStreak))
    ]));

    // 事前 → 事後
    if (r.pre.length && r.post.length) {
      var arrow = diff > 0 ? '▲' : (diff < 0 ? '▼' : '＝');
      var msg = diff > 0 ? t('prePostUp', { n: diff }) : (diff < 0 ? t('prePostDown', { n: -diff }) : t('prePostSame'));
      root.appendChild(el('section', { class: 'card prepost', 'aria-labelledby': 'prepost-title' }, [
        el('h2', { id: 'prepost-title', class: 'h3', text: t('prePostTitle') }),
        el('p', { class: 'prepost__scores' }, [
          el('span', { class: 'prepost__num', text: pre + ' / ' + r.pre.length }),
          el('span', { class: 'prepost__arrow', 'aria-hidden': 'true', text: '→' }),
          el('span', { class: 'prepost__num', text: post + ' / ' + r.post.length })
        ]),
        el('p', { class: 'prepost__diff' + (diff > 0 ? ' is-up' : diff < 0 ? ' is-down' : '') }, [
          el('span', { 'aria-hidden': 'true', text: arrow + ' ' }), msg
        ])
      ]));
    }

    // カテゴリ別
    var cats = categoryThisPlay();
    var catSection = el('section', { class: 'card', 'aria-labelledby': 'cat-title' }, [
      el('h2', { id: 'cat-title', class: 'h3', text: t('catTitle') })
    ]);
    var weakest = null;
    Object.keys(data.categories).forEach(function (c) {
      var name = L(data.categories[c]);
      var overall = saved.stats.category[c];
      var acc = overall && overall.total ? pct(overall.correct, overall.total) : null;
      if (acc !== null && acc < 100 && (weakest === null || acc < weakest.acc)) weakest = { name: name, acc: acc };
      var thisText = cats[c] ? cats[c].correct + ' / ' + cats[c].total : '—';
      catSection.appendChild(el('div', { class: 'mastery' }, [
        el('div', { class: 'mastery__head' }, [
          el('strong', { text: name }),
          el('span', { class: 'muted small', text: t('catThisPlay') + ' ' + thisText })
        ]),
        el('div', { class: 'mastery__row' }, [
          el('div', { class: 'meter', role: 'img', 'aria-label': t('catOverall') + ' ' + (acc === null ? t('catNone') : acc + '%') }, [
            el('div', { class: 'meter__fill', style: 'width:' + (acc || 0) + '%' })
          ]),
          el('span', { class: 'mastery__pct', 'aria-hidden': 'true', text: acc === null ? t('catNone') : acc + '%' })
        ])
      ]));
    });
    catSection.appendChild(el('p', { class: 'muted small', text: t('catOverall') + '：' + (weakest ? t('weakest', { cat: weakest.name }) : t('noWeak')) }));
    root.appendChild(catSection);

    // バッジ
    var badgeList = el('ul', { class: 'badges' });
    BADGES.forEach(function (b) {
      var earned = saved.badges.indexOf(b.id) !== -1;
      var isNew = session.newBadges.indexOf(b.id) !== -1;
      badgeList.appendChild(el('li', { class: 'badge' + (earned ? ' is-earned' : ' is-locked') }, [
        el('span', { class: 'badge__icon', 'aria-hidden': 'true', text: earned ? b.icon : '🔒' }),
        el('span', { class: 'badge__text' }, [
          el('strong', { text: t('badge_' + b.id + '_name') }),
          el('span', { class: 'small', text: t('badge_' + b.id + '_desc') })
        ]),
        el('span', { class: 'badge__state' }, [
          isNew ? el('span', { class: 'badge__new', text: t('badgeNew') }) : null,
          earned ? t('badgeEarned') : t('badgeLocked')
        ])
      ]));
    });
    root.appendChild(el('section', { class: 'card', 'aria-labelledby': 'badges-title' }, [
      el('h2', { id: 'badges-title', class: 'h3', text: t('badgesTitle') }), badgeList
    ]));

    // 迷ったときの3つの行動（ナッジ）
    root.appendChild(el('section', { class: 'card nudge', 'aria-labelledby': 'nudge-title' }, [
      el('h2', { id: 'nudge-title', class: 'h3' }, [el('span', { 'aria-hidden': 'true', text: '💡 ' }), t('nudgeTitle')]),
      el('ol', { class: 'nudge__list' }, [
        el('li', { text: t('nudge1') }), el('li', { text: t('nudge2') }), el('li', { text: t('nudge3') })
      ])
    ]));

    // 結果のコピー
    var text = buildResultText();
    var textarea = el('textarea', { id: 'result-text', class: 'result-text', readonly: true, rows: '12', 'aria-label': t('copyBoxLabel') });
    textarea.value = text;
    root.appendChild(el('section', { class: 'card', 'aria-labelledby': 'copy-title' }, [
      el('h2', { id: 'copy-title', class: 'h3', text: t('copyTitle') }),
      el('p', { class: 'muted', text: t('copyHelp') }),
      el('button', { type: 'button', id: 'copy-button', class: 'btn btn--primary btn--large', onclick: copyResult }, [
        el('span', { 'aria-hidden': 'true', text: '📋 ' }), t('copy')
      ]),
      textarea
    ]));

    var notice = el('p', { class: 'notice', 'data-storage-notice': true, hidden: storageAvailable, text: t('storageOff') });
    root.appendChild(notice);

    root.appendChild(el('div', { class: 'result-actions' }, [
      el('button', { type: 'button', id: 'again-button', class: 'btn btn--primary', onclick: startPlay }, [t('again')]),
      el('button', { type: 'button', id: 'home-button', class: 'btn btn--ghost', onclick: function () { showScreen('start'); } }, [t('home')])
    ]));

    restoreFocus(null, activeId);
  }

  function statTile(label, value, sub) {
    return el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: label }),
      el('span', { class: 'stat__value', text: value }),
      sub ? el('span', { class: 'stat__sub', text: sub }) : null
    ]);
  }

  function copyResult() {
    var area = $('#result-text');
    var text = area.value;
    var fallback = function () {
      try {
        area.focus();
        area.select();
        var ok = document.execCommand && document.execCommand('copy');
        if (!ok) throw new Error('execCommand failed');
        toast(t('copied')); announce(t('copied'));
      } catch (e) {
        toast(t('copyFail')); announce(t('copyFail'));
      }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        toast(t('copied')); announce(t('copied'));
      }, fallback);
    } else {
      fallback();
    }
  }

  /* ------------------------------------------------------------------
   * 起動
   * ------------------------------------------------------------------ */
  function setupDialog() {
    var dialog = $('#settings-dialog');
    var opener = $('#open-settings');
    opener.addEventListener('click', function () {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      var first = dialog.querySelector('input:checked');
      if (first) first.focus();
    });
    var close = function () {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      opener.focus();
    };
    $('#close-settings').addEventListener('click', close);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    $('#reset-records').addEventListener('click', function () {
      if (!window.confirm(t('resetConfirm'))) return;
      var settings = saved.settings;
      saved = defaultSaved();
      saved.settings = settings;
      persist();
      toast(t('resetDone'));
      announce(t('resetDone'));
    });
  }

  function init(json) {
    data.categories = json.categories || {};
    data.questions = Array.isArray(json.questions) ? json.questions : [];
    data.preTest = json.preTest || [];
    data.postTest = json.postTest || [];
    data.questions.forEach(function (q) {
      q.links = q.links || [];
      q.suspiciousParts = q.suspiciousParts || [];
      byId[q.id] = q;
    });
    if (data.questions.length === 0) throw new Error('questions.json に問題がありません');
    $('#start-button').addEventListener('click', startPlay);
    showScreen('start', false); // 最初の表示ではフォーカスを動かさない
  }

  function showLoadError(err) {
    $('#error-detail').textContent = String(err && err.message ? err.message : err);
    showScreen('error');
  }

  applySettings();
  setupDialog();
  fetch('questions.json', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(init)
    .catch(showLoadError);
})();
