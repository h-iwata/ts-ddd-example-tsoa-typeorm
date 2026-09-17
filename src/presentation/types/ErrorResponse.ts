/**
 * APIエラーレスポンスの共通型
 */
export interface ErrorResponse {
  message: string;
  code: string;
  /**
   * サーバー内部エラー(5xx)のときだけ付与される追跡ID。問い合わせの際にサーバーログと突き合わせる
   */
  incidentId?: string;
}
