# diet-dashboard v10（入力修正版）

v9 からの修正:
1. 未入力データの `null` を 0 や既存記録と誤判定しないよう修正。
   新規入力時は体重・体脂肪率とも空欄から始まります。
2. 「目標日が不正です」エラーを修正。
   Web設定シートで日付がGoogle SheetsのDate型へ自動変換されてもISO日付へ正規化します。

## 更新するファイル
GitHub:
- `index.html` を上書き
（manifest/icon類はv9のままでOK）

Apps Script:
- `apps-script/Code.gs` を丸ごと上書き
- 保存
- 「デプロイ」→「デプロイを管理」→鉛筆→「新しいバージョン」→デプロイ

Apps ScriptのURLは変わりません。
8桁PINも resetWritePin() を実行しない限り変わりません。
