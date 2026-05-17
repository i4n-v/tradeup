export class HistoryQueryKeys {
  list(page: number, limit: number) {
    return ['history', 'list', page, limit] as const;
  }
}
