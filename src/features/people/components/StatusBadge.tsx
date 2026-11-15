export function StatusBadge({
  ativo
}: {
  ativo: boolean;
}) {
  return <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${ativo ? "bg-green-100 text-green-700" : "bg-gray-100 peract-font-color-muted"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ativo ? "bg-green-500" : "bg-gray-400"}`} />
      {ativo ? "Ativo" : "Inativo"}
    </span>;
}
