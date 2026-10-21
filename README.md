# diet-dashboard single v6

スマホでデータ取得できなかった原因を修正した版です。

原因:
- v5 の index.html が `http://127.0.0.1:8765/api` を参照していました。
- 127.0.0.1 は「その端末自身」を意味するため、PCではローカル環境に接続できても、iPhoneではiPhone自身を探して失敗します。

修正:
- 公開済み Google Apps Script の HTTPS URLを直接指定
- データ取得タイムアウトを15秒→45秒へ延長
- 1ファイル構成なので GitHub では index.html だけ上書きすればOK

GitHub Pages反映後、iPhone Safariで再読み込みしてください。
