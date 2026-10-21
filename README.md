# diet-dashboard v8 - 全記録ページ追加

追加内容:
- `index.html`: 「直近7日の体重」に「全記録を見る →」リンクを追加
- `history.html`: 日付 / 予定体重 / 朝体重 / 朝体脂肪率 / 夜体重 / 夜体脂肪率 を全期間表示
- `Code.gs`: `?view=history` で履歴データを返すように拡張

## GitHub
`index.html` と `history.html` をリポジトリ直下へアップロードしてください。

## Apps Script
`Code.gs` を既存Apps Scriptへ丸ごと上書きして保存し、既存ウェブアプリのデプロイを「新しいバージョン」に更新してください。URLは同じままで構いません。
