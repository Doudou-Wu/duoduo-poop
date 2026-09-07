export function errorMessage(error: unknown, fallback = "操作失败，请重试。") {
  return error instanceof Error && /[\u4e00-\u9fff]/.test(error.message)
    ? error.message
    : fallback;
}
