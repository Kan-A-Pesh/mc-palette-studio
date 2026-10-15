export function formatMemberCount(count: number | undefined | null): string {
  const total = count || 0;
  if (total === 0) {
    return "No members";
  }
  if (total === 1) {
    return "1 member";
  }
  return `${total} members`;
}
