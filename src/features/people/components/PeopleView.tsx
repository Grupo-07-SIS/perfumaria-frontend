import type { usePeopleFacade } from "../facade/usePeopleFacade";
import { ClienteModal } from "./ClienteModal";
import { FornecedorModal } from "./FornecedorModal";
import { FuncionarioModal } from "./FuncionarioModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { ReativarConfirm } from "./ReativarConfirm";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { Plus, Search, UserCheck, UserX, Users, User, Pencil, UserMinus, Phone, Mail, MapPin, Truck, Trash2 } from "lucide-react";
import { ACC, DARK } from "../config/people.config";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractInputControl } from "../../../shared/components/peract-input";
import type { StatusFiltro } from "../models/people.models";
import { StatusBadge } from "./StatusBadge";
import { formatEndereco } from "../services/people.service";
import { formatCnpj, formatTelefone } from "../../../shared/utils/masks";
import { CardActions } from "./CardActions";
import { PeractTableRoot, PeractTableHeader, PeractTableRow, PeractTableHead, PeractTableBody, PeractTableCell } from "../../../shared/components/peract-table";
export function PeopleView({
  clientes,
  isLoading,
  error,
  requestClientDeletion,
  requestSupplierDeletion,
  requestEmployeeDeletion,
  reactivateTarget,
  requestClientReactivation,
  cancelClientReactivation,
  confirmClientReactivation,
  aba,
  selectTab,
  search,
  setSearch,
  submitSearch,
  statusFiltro,
  setStatusFiltro,
  modal,
  setModal,
  deleteTarget,
  setDeleteTarget,
  clientesAtivos,
  clientesInativos,
  tabs,
  saveCliente,
  saveFornecedor,
  saveFuncionario,
  filtClientes,
  filtFornecedores,
  filtFuncionarios,
  openNew,
  newLabel
}: ReturnType<typeof usePeopleFacade>) {
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {modal?.type === "cliente" && <ClienteModal data={modal.data} onClose={() => setModal(null)} onSave={saveCliente} />}
      {modal?.type === "fornecedor" && <FornecedorModal data={modal.data} onClose={() => setModal(null)} onSave={saveFornecedor} />}
      {modal?.type === "funcionario" && <FuncionarioModal data={modal.data} onClose={() => setModal(null)} onSave={saveFuncionario} />}
      {deleteTarget && <DeleteConfirm nome={deleteTarget.nome} onClose={() => setDeleteTarget(null)} onConfirm={async () => {
      await deleteTarget.fn();
      setDeleteTarget(null);
    }} />}
      {reactivateTarget && <ReativarConfirm nome={reactivateTarget.nome} onClose={cancelClientReactivation} onConfirm={confirmClientReactivation} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="peract-font-color-default">Gestão de Pessoas</h1>
          <p className="text-xs peract-font-color-muted mt-0.5">Clientes, fornecedores e equipe</p>
        </div>
        <PeractButtonPrimitive onClick={openNew} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 self-start peract-bg-accent" variant="plain" size="plain">
          <Plus size={16} /> {newLabel}
        </PeractButtonPrimitive>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}
      {isLoading && <p className="text-sm peract-font-color-muted mb-4">Carregando pessoas...</p>}

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b peract-border-color mb-4">
        {tabs.map(t => <PeractButtonPrimitive key={t.key} onClick={() => selectTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-all ${aba === t.key ? "font-medium" : "border-transparent peract-font-color-muted hover:text-gray-700"}`} style={aba === t.key ? {
        borderColor: ACC,
        color: ACC
      } : {}} variant="plain" size="plain">
            {t.icon} {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 ${aba === t.key ? "text-white" : "bg-gray-100 peract-font-color-muted"}`} style={aba === t.key ? {
          background: ACC
        } : {}}>
              {t.count}
            </span>
          </PeractButtonPrimitive>)}
      </div>

      {/* Search + filter row */}
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 border peract-border-color rounded-lg px-3 py-2">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="text" placeholder={`Buscar ${aba === "clientes" ? "cliente" : aba === "fornecedores" ? "fornecedor" : "funcionário"}...`} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={event => {
          if (event.key === "Enter") void submitSearch();
        }} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
        </div>

        {/* Status filter — só para a aba de clientes */}
        {aba === "clientes" && <div className="flex rounded-lg overflow-hidden border peract-border-color shrink-0">
            {(["ativos", "todos", "inativos"] as StatusFiltro[]).map(s => {
          const label = s === "ativos" ? "Ativos" : s === "inativos" ? "Inativos" : "Todos";
          const count = s === "ativos" ? clientesAtivos.length : s === "inativos" ? clientesInativos.length : clientes.length;
          return <PeractButtonPrimitive key={s} onClick={() => setStatusFiltro(s)} className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all whitespace-nowrap" style={statusFiltro === s ? {
            background: DARK,
            color: "white"
          } : {
            background: "white",
            color: "#6b7280"
          }} variant="plain" size="plain">
                  {s === "ativos" && <UserCheck size={12} />}
                  {s === "inativos" && <UserX size={12} />}
                  {s === "todos" && <Users size={12} />}
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFiltro === s ? "bg-white/20 text-white" : "bg-gray-100 peract-font-color-muted"}`}>
                    {count}
                  </span>
                </PeractButtonPrimitive>;
        })}
          </div>}

        <PeractButtonPrimitive onClick={openNew} className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
          <Plus size={16} /> {newLabel}
        </PeractButtonPrimitive>
      </PeractCard>

      {/* ─── CLIENTES ─── */}
      {aba === "clientes" && <>
          {/* Banner informativo quando exibindo inativos */}
          {statusFiltro === "inativos" && filtClientes.length > 0 && <div className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 text-sm" style={{
        background: "#FFFBEB",
        borderColor: "#FDE68A",
        color: "#92400E"
      }}>
              <UserX size={16} className="shrink-0" />
              <span>Mostrando <strong>{filtClientes.length}</strong> cliente(s) inativo(s). Clique em <strong>"Reativar"</strong> para restaurar um cliente.</span>
            </div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtClientes.length === 0 ? <PeractCard className="col-span-full text-center py-16 peract-font-color-muted text-sm peract-bg-card rounded-xl border peract-border-color">
                <div className="flex flex-col items-center gap-2">
                  {statusFiltro === "inativos" ? <><UserX size={32} className="text-gray-200" /><p>Nenhum cliente inativo.</p></> : <><Users size={32} className="text-gray-200" /><p>Nenhum cliente encontrado.</p><PeractButtonPrimitive onClick={openNew} className="mt-2 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">Cadastrar cliente</PeractButtonPrimitive></>}
                </div>
              </PeractCard> : filtClientes.map(c => {
          const isAtivo = c.ativo !== false;
          return <div key={c.id} className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${!isAtivo ? "opacity-70 border-dashed" : "peract-border-color"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{
                background: isAtivo ? ACC : "#9ca3af"
              }}>
                      <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium peract-font-color-default truncate">{c.nome}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs peract-font-color-muted">{c.totalPedidos} pedido(s)</p>
                        <StatusBadge ativo={isAtivo} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <PeractButtonPrimitive onClick={() => setModal({
                  type: "cliente",
                  data: c
                })} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-gray-100" title="Editar" variant="plain" size="plain" aria-label="Editar">
                        <Pencil size={14} />
                      </PeractButtonPrimitive>
                      {isAtivo ? <PeractButtonPrimitive onClick={() => requestClientDeletion(c)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Excluir cliente" variant="plain" size="plain" aria-label="Excluir cliente">
                        <UserMinus size={14} />
                      </PeractButtonPrimitive> : <PeractButtonPrimitive onClick={() => requestClientReactivation(c)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-green-700 transition-colors hover:bg-green-50" title="Reativar cliente" variant="plain" size="plain" aria-label="Reativar cliente">
                        <UserCheck size={14} /> Reativar
                      </PeractButtonPrimitive>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Phone size={12} className="shrink-0" />{formatTelefone(c.telefone)}</div>
                    {c.email && <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Mail size={12} className="shrink-0" /><span className="truncate">{c.email}</span></div>}
                    {(c.endereco.logradouro || c.endereco.cidade) && <div className="flex items-start gap-2 text-xs peract-font-color-muted">
                        <MapPin size={12} className="shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{formatEndereco(c.endereco)}</span>
                      </div>}
                  </div>
                </div>;
        })}
          </div>
        </>}

      {/* ─── FORNECEDORES ─── */}
      {aba === "fornecedores" && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtFornecedores.map(f => <PeractCard key={f.id} className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 peract-bg-primary">
                  <Truck size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium peract-font-color-default truncate">{f.razaoSocial}</p>
                  <p className="text-xs peract-font-color-muted font-mono">{formatCnpj(f.cnpj)}</p>
                </div>
                <CardActions onEdit={() => setModal({
            type: "fornecedor",
            data: f
          })} onDelete={() => requestSupplierDeletion(f)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Phone size={12} className="shrink-0" />{f.telefone ? formatTelefone(f.telefone) : "—"}</div>
                <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Mail size={12} className="shrink-0" /><span className="truncate">{f.email}</span></div>
                {(f.endereco.logradouro || f.endereco.cidade) && <div className="flex items-start gap-2 text-xs peract-font-color-muted">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{formatEndereco(f.endereco)}</span>
                  </div>}
              </div>
            </PeractCard>)}
          {filtFornecedores.length === 0 && <PeractCard className="col-span-full text-center py-12 peract-font-color-muted text-sm peract-bg-card rounded-xl border peract-border-color">Nenhum fornecedor encontrado.</PeractCard>}
        </div>}

      {/* ─── FUNCIONÁRIOS ─── */}
      {aba === "funcionarios" && <>
          <PeractCard className="hidden md:block peract-bg-card rounded-xl border peract-border-color shadow-sm">
            <div className="overflow-auto max-h-[520px]">
              <PeractTableRoot className="w-full">
                <PeractTableHeader className="sticky top-0 z-10">
                  <PeractTableRow style={{
                background: "#fafaf9"
              }}>
                    {["Nome", "Cargo", "E-mail de acesso", "Senha", "Ações"].map(h => <PeractTableHead key={h} className="text-left px-4 py-3 text-xs font-medium peract-font-color-muted">{h}</PeractTableHead>)}
                  </PeractTableRow>
                </PeractTableHeader>
                <PeractTableBody className="divide-y divide-gray-50">
                  {filtFuncionarios.map(f => <PeractTableRow key={f.id} className="hover:bg-gray-50/50 transition-colors">
                      <PeractTableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white peract-bg-accent">
                            <User size={13} />
                          </div>
                          <span className="text-sm font-medium peract-font-color-default">{f.nome}</span>
                        </div>
                      </PeractTableCell>
                      <PeractTableCell className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${f.cargo === "Administrador" ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"}`}>
                          {f.cargo}
                        </span>
                      </PeractTableCell>
                      <PeractTableCell className="px-4 py-3 text-sm text-gray-600">{f.email}</PeractTableCell>
                      <PeractTableCell className="px-4 py-3">
                        <span aria-label="Senha protegida" className="text-xs peract-font-color-muted font-mono bg-gray-50 px-2 py-0.5 rounded">••••••</span>
                      </PeractTableCell>
                      <PeractTableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <PeractButtonPrimitive onClick={() => setModal({
                      type: "funcionario",
                      data: f
                    })} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100 transition-colors" title="Editar" variant="plain" size="plain" aria-label="Editar"><Pencil size={14} /></PeractButtonPrimitive>
                          <PeractButtonPrimitive onClick={() => requestEmployeeDeletion(f)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-red-50 hover:text-red-600 transition-colors" title="Excluir" variant="plain" size="plain" aria-label="Excluir"><Trash2 size={14} /></PeractButtonPrimitive>
                        </div>
                      </PeractTableCell>
                    </PeractTableRow>)}
                </PeractTableBody>
              </PeractTableRoot>
            </div>
            <div className="px-4 py-3 border-t border-gray-50">
              <p className="text-xs peract-font-color-muted">{filtFuncionarios.length} funcionário(s)</p>
            </div>
          </PeractCard>

          {/* Mobile funcionários */}
          <div className="md:hidden flex flex-col gap-3">
            {filtFuncionarios.map(f => <PeractCard key={f.id} className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 peract-bg-accent">
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium peract-font-color-default">{f.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.cargo === "Administrador" ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"}`}>{f.cargo}</span>
                  </div>
                  <CardActions onEdit={() => setModal({
              type: "funcionario",
              data: f
            })} onDelete={() => requestEmployeeDeletion(f)} />
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Mail size={12} className="shrink-0" />{f.email}</div>
                </div>
              </PeractCard>)}
          </div>
        </>}
    </div>;
}
