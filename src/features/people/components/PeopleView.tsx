import type { usePeopleFacade } from "../facade/usePeopleFacade";
import { ClienteModal } from "./ClienteModal";
import { FornecedorModal } from "./FornecedorModal";
import { FuncionarioModal } from "./FuncionarioModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { ReativarConfirm } from "./ReativarConfirm";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { Plus, Search, UserCheck, UserX, Users, User, Pencil, UserMinus, Mail, Truck, Trash2 } from "lucide-react";
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
          <h1 data-tour="tour-people-heading" className="peract-font-color-default">Gestão de Pessoas</h1>
          <p className="text-xs peract-font-color-muted mt-0.5">Clientes, fornecedores e equipe</p>
        </div>
        <PeractButtonPrimitive onClick={openNew} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 self-start peract-bg-accent" variant="plain" size="plain">
          <Plus size={16} /> {newLabel}
        </PeractButtonPrimitive>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}
      {isLoading && <p className="text-sm peract-font-color-muted mb-4">Carregando pessoas...</p>}

      {/* Tabs */}
      <div data-tour="tour-people-tabs" className="flex overflow-x-auto border-b peract-border-color mb-4">
        {tabs.map(t => <PeractButtonPrimitive key={t.key} data-tour={t.key === "fornecedores" ? "tour-people-tab-suppliers" : t.key === "funcionarios" ? "tour-people-tab-employees" : undefined} onClick={() => selectTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-all ${aba === t.key ? "font-medium" : "border-transparent peract-font-color-muted hover:text-gray-700"}`} style={aba === t.key ? {
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
      <PeractCard data-tour="tour-people-search" className="peract-bg-card rounded-xl border peract-border-color p-2 mb-4 flex flex-col sm:flex-row gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-1 border peract-border-color rounded-lg px-3 py-1">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="text" placeholder={`Buscar ${aba === "clientes" ? "cliente" : aba === "fornecedores" ? "fornecedor" : "funcionário"}...`} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={event => {
          if (event.key === "Enter") void submitSearch();
        }} className="h-8 py-1 text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
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

          <div data-tour="tour-people-results">
            <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm">
              <div className="overflow-auto max-h-[520px]">
                <PeractTableRoot className="w-full min-w-[960px]" aria-label="Clientes">
                  <PeractTableHeader className="sticky top-0 z-10 peract-bg-page">
                    <PeractTableRow>
                      {["Nome", "Status", "Telefone", "E-mail", "Endereço", "Pedidos", "Ações"].map(heading => <PeractTableHead key={heading} className="text-left px-4 py-3 text-xs font-medium peract-font-color-muted">{heading}</PeractTableHead>)}
                    </PeractTableRow>
                  </PeractTableHeader>
                  <PeractTableBody className="divide-y divide-gray-50">
                    {filtClientes.map(cliente => {
                      const isAtivo = cliente.ativo !== false;
                      const endereco = formatEndereco(cliente.endereco);
                      return <PeractTableRow key={cliente.id} className={`hover:bg-gray-50/50 transition-colors ${!isAtivo ? "opacity-70" : ""}`}>
                        <PeractTableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white ${isAtivo ? "peract-bg-accent" : "bg-gray-400"}`}><User size={13} /></div>
                            <span className="max-w-[16rem] truncate text-sm font-medium peract-font-color-default" title={cliente.nome}>{cliente.nome}</span>
                          </div>
                        </PeractTableCell>
                        <PeractTableCell className="px-4 py-3"><StatusBadge ativo={isAtivo} /></PeractTableCell>
                        <PeractTableCell className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{cliente.telefone ? formatTelefone(cliente.telefone) : "—"}</PeractTableCell>
                        <PeractTableCell className="max-w-[16rem] truncate px-4 py-3 text-sm text-gray-600" title={cliente.email}>{cliente.email || "—"}</PeractTableCell>
                        <PeractTableCell className="max-w-[18rem] px-4 py-3 text-xs text-gray-600 whitespace-normal" title={endereco}>{endereco || "—"}</PeractTableCell>
                        <PeractTableCell className="px-4 py-3 text-sm text-gray-600 tabular-nums">{cliente.totalPedidos}</PeractTableCell>
                        <PeractTableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <PeractButtonPrimitive onClick={() => setModal({ type: "cliente", data: cliente })} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100 transition-colors" title="Editar" variant="plain" size="plain" aria-label="Editar"><Pencil size={14} /></PeractButtonPrimitive>
                            {isAtivo ? <PeractButtonPrimitive onClick={() => requestClientDeletion(cliente)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-red-50 hover:text-red-600 transition-colors" title="Excluir cliente" variant="plain" size="plain" aria-label="Excluir cliente"><UserMinus size={14} /></PeractButtonPrimitive> : <PeractButtonPrimitive onClick={() => requestClientReactivation(cliente)} className="p-1.5 rounded-lg text-green-700 hover:bg-green-50 transition-colors" title="Reativar cliente" variant="plain" size="plain" aria-label="Reativar cliente"><UserCheck size={14} /></PeractButtonPrimitive>}
                          </div>
                        </PeractTableCell>
                      </PeractTableRow>;
                    })}
                    {filtClientes.length === 0 && <PeractTableRow><PeractTableCell colSpan={7} className="text-center py-12 peract-font-color-muted text-sm">
                      <div className="flex flex-col items-center gap-2">
                        {statusFiltro === "inativos" ? <><UserX size={32} className="text-gray-200" /><p>Nenhum cliente inativo.</p></> : <><Users size={32} className="text-gray-200" /><p>Nenhum cliente encontrado.</p><PeractButtonPrimitive onClick={openNew} className="mt-2 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">Cadastrar cliente</PeractButtonPrimitive></>}
                      </div>
                    </PeractTableCell></PeractTableRow>}
                  </PeractTableBody>
                </PeractTableRoot>
              </div>
              <div className="px-4 py-3 border-t border-gray-50"><p className="text-xs peract-font-color-muted">{filtClientes.length} cliente(s)</p></div>
            </PeractCard>
          </div>
        </>}

      {/* ─── FORNECEDORES ─── */}
      {aba === "fornecedores" && <div data-tour="tour-people-supplier-results">
          <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm">
            <div className="overflow-auto max-h-[520px]">
              <PeractTableRoot className="w-full min-w-[960px]" aria-label="Fornecedores">
                <PeractTableHeader className="sticky top-0 z-10 peract-bg-page">
                  <PeractTableRow>
                    {["Razão social", "CNPJ", "Telefone", "E-mail", "Endereço", "Ações"].map(heading => <PeractTableHead key={heading} className="text-left px-4 py-3 text-xs font-medium peract-font-color-muted">{heading}</PeractTableHead>)}
                  </PeractTableRow>
                </PeractTableHeader>
                <PeractTableBody className="divide-y divide-gray-50">
                  {filtFornecedores.map(fornecedor => {
                    const endereco = formatEndereco(fornecedor.endereco);
                    return <PeractTableRow key={fornecedor.id} className="hover:bg-gray-50/50 transition-colors">
                      <PeractTableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white peract-bg-accent"><Truck size={13} /></div>
                          <span className="max-w-[16rem] truncate text-sm font-medium peract-font-color-default" title={fornecedor.razaoSocial}>{fornecedor.razaoSocial}</span>
                        </div>
                      </PeractTableCell>
                      <PeractTableCell className="px-4 py-3 text-xs text-gray-600 font-mono whitespace-nowrap">{formatCnpj(fornecedor.cnpj)}</PeractTableCell>
                      <PeractTableCell className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fornecedor.telefone ? formatTelefone(fornecedor.telefone) : "—"}</PeractTableCell>
                      <PeractTableCell className="max-w-[16rem] truncate px-4 py-3 text-sm text-gray-600" title={fornecedor.email}>{fornecedor.email || "—"}</PeractTableCell>
                      <PeractTableCell className="max-w-[18rem] px-4 py-3 text-xs text-gray-600 whitespace-normal" title={endereco}>{endereco || "—"}</PeractTableCell>
                      <PeractTableCell className="px-4 py-3"><CardActions onEdit={() => setModal({ type: "fornecedor", data: fornecedor })} onDelete={() => requestSupplierDeletion(fornecedor)} /></PeractTableCell>
                    </PeractTableRow>;
                  })}
                  {filtFornecedores.length === 0 && <PeractTableRow><PeractTableCell colSpan={6} className="text-center py-12 peract-font-color-muted text-sm">Nenhum fornecedor encontrado.</PeractTableCell></PeractTableRow>}
                </PeractTableBody>
              </PeractTableRoot>
            </div>
            <div className="px-4 py-3 border-t border-gray-50"><p className="text-xs peract-font-color-muted">{filtFornecedores.length} fornecedor(es)</p></div>
          </PeractCard>
        </div>}

      {/* ─── FUNCIONÁRIOS ─── */}
      {aba === "funcionarios" && <div data-tour="tour-people-employee-results" className="flex flex-col gap-3">
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
                          <span className="max-w-[16rem] truncate text-sm font-medium peract-font-color-default" title={f.nome}>{f.nome}</span>
                        </div>
                      </PeractTableCell>
                      <PeractTableCell className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${f.cargo === "Administrador" ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"}`}>
                          {f.donoOrganizacao ? "Administrador (dono)" : f.cargo}
                        </span>
                      </PeractTableCell>
                      <PeractTableCell className="max-w-[16rem] truncate px-4 py-3 text-sm text-gray-600" title={f.email}>{f.email}</PeractTableCell>
                      <PeractTableCell className="px-4 py-3">
                        <span aria-label="Senha protegida" className="text-xs peract-font-color-muted font-mono bg-gray-50 px-2 py-0.5 rounded">••••••</span>
                      </PeractTableCell>
                      <PeractTableCell className="px-4 py-3">
                        {f.donoOrganizacao ? <span className="text-xs peract-font-color-muted" title="O dono da organização não pode ser editado ou excluído por outro administrador">Conta protegida</span> : <div className="flex items-center gap-2">
                          <PeractButtonPrimitive onClick={() => setModal({
                      type: "funcionario",
                      data: f
                    })} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100 transition-colors" title="Editar" variant="plain" size="plain" aria-label="Editar"><Pencil size={14} /></PeractButtonPrimitive>
                          <PeractButtonPrimitive onClick={() => requestEmployeeDeletion(f)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-red-50 hover:text-red-600 transition-colors" title="Excluir" variant="plain" size="plain" aria-label="Excluir"><Trash2 size={14} /></PeractButtonPrimitive>
                        </div>}
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
                    <p className="truncate text-sm font-medium peract-font-color-default">{f.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.cargo === "Administrador" ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"}`}>{f.donoOrganizacao ? "Administrador (dono)" : f.cargo}</span>
                  </div>
                  {!f.donoOrganizacao && <CardActions onEdit={() => setModal({
              type: "funcionario",
              data: f
            })} onDelete={() => requestEmployeeDeletion(f)} />}
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Mail size={12} className="shrink-0" /><span className="truncate">{f.email}</span></div>
                </div>
              </PeractCard>)}
          </div>
        </div>}
    </div>;
}
