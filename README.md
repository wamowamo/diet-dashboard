# diet-dashboard layout v3

添付イラストに合わせてレイアウトを作り直した版です。

## 表示順
1. 現在の体重＋第1/第2目標までの差
2. 直近7日の体重
3. 第1・第2目標の進捗
4. 体脂肪率 / 減量済み / 第1目標まで残り / 残り日数
5. 一番下に「体重の推移と目標ライン」

`config.js` には現在の Apps Script `/exec` URLを設定済みです。
GitHub Pagesへは `index.html`, `style.css`, `script.js`, `config.js` をアップロードしてください。

※ `apps-script/Code.gs` は既存APIのバックアップです。今回のレイアウト変更だけなら再デプロイ不要です。
