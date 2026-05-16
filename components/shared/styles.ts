// Shared modal/form CSS class strings

export const inputCls =
  "mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400";

export const inputErrorCls =
  "mt-1 w-full rounded-2xl border border-rose-400 px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500";

export const selectCls =
  "mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 bg-white";

export const labelCls = "block text-sm font-medium text-slate-700";

export function fieldError(msg: string | undefined) {
  if (!msg) return null;
  // Returns plain string so callers can render as JSX
  return msg;
}
