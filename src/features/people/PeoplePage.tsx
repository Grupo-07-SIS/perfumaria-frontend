import { PeractField } from "../../shared/components/peract-field";
import { PeractTableCell } from "../../shared/components/peract-table";
import { PeractTableBody } from "../../shared/components/peract-table";
import { PeractTableHead } from "../../shared/components/peract-table";
import { PeractTableRow } from "../../shared/components/peract-table";
import { PeractTableHeader } from "../../shared/components/peract-table";
import { PeractTableRoot } from "../../shared/components/peract-table";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { PeractModal } from "../../shared/components/peract-modal";
import { PeractModalTitle } from "../../shared/components/peract-modal";
import { PeractNativeSelect } from "../../shared/components/peract-select";
import { PeractInputControl } from "../../shared/components/peract-input";
import { PeractLabel } from "../../shared/components/peract-label";
import { useState } from "react";
import { Search, Plus, Phone, MapPin, User, Truck, X, CheckCircle, Briefcase, Pencil, Trash2, Users, Eye, EyeOff, KeyRound, Mail, UserX, UserCheck, UserMinus } from "lucide-react";
import { useApp, Cliente, Fornecedor, Funcionario, CargoFuncionario, Endereco } from "../../app/context/AppContext";
const ACC = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";
type Aba = "clientes" | "fornecedores" | "funcionarios";
type StatusFiltro = "todos" | "ativos" | "inativos";
const UF_LIST = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

/* ─── Endereço fields ─── */
interface EnderecoFieldsProps {
  endereco: Endereco;
  onChange: (e: Endereco) => void;
  errors: Record<string, string>;
  onClearError: (key: string) => void;
}
function EnderecoFields({
  endereco,
  onChange
}: EnderecoFieldsProps) {
  const set = (key: keyof Endereco, val: string) => onChange({
    ...endereco,
    [key]: val
  });
  return <div className="border peract-border-color rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b peract-border-color" style={{
      background: "#fafaf9"
    }}>
        <p className="text-xs font-medium peract-font-color-muted flex items-center gap-1.5">
          <MapPin size={12} /> Endereço <span className="peract-font-color-muted font-normal">(opcional)</span>
        </p>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-6 gap-3">
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">CEP</PeractLabel>
          <PeractInputControl type="text" value={endereco.cep} onChange={e => set("cep", e.target.value)} placeholder="00000-000" maxLength={9} className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-4">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Logradouro</PeractLabel>
          <PeractInputControl type="text" value={endereco.logradouro} onChange={e => set("logradouro", e.target.value)} placeholder="Ex: Rua das Flores" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Número</PeractLabel>
          <PeractInputControl type="text" value={endereco.numero} onChange={e => set("numero", e.target.value)} placeholder="Ex: 100" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-4">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Complemento</PeractLabel>
          <PeractInputControl type="text" value={endereco.complemento ?? ""} onChange={e => set("complemento", e.target.value)} placeholder="Apto, sala, bloco..." className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-3">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Bairro</PeractLabel>
          <PeractInputControl type="text" value={endereco.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Ex: Centro" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Cidade</PeractLabel>
          <PeractInputControl type="text" value={endereco.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Ex: São Paulo" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-1">
          <PeractLabel className="text-xs text-gray-600 block mb-1">UF</PeractLabel>
          <PeractNativeSelect value={endereco.uf} onChange={e => set("uf", e.target.value)} className="w-full border peract-border-color rounded-lg px-2 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]">
            <option value="">—</option>
            {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </PeractNativeSelect>
        </PeractField>
      </div>
    </div>;
}
const EMPTY_ENDERECO: Endereco = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: ""
};
function formatEndereco(e: Endereco) {
  const parts = [e.logradouro, e.numero ? `nº ${e.numero}` : "", e.complemento, e.bairro, e.cidade && e.uf ? `${e.cidade}/${e.uf}` : e.cidade || e.uf, e.cep ? `CEP ${e.cep}` : ""].filter(Boolean);
  return parts.join(", ") || "—";
}
function DeleteConfirm({
  nome,
  onClose,
  onConfirm
}: {
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={onClose}>
        <div className="p-4 border-b peract-border-color"><PeractModalTitle className="peract-font-color-default">Confirmar exclusão</PeractModalTitle></div>
        <div className="p-4">
          <p className="text-sm text-gray-600">Tem certeza que deseja excluir <strong className="peract-font-color-default">"{nome}"</strong>? Esta ação não pode ser desfeita.</p>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700" variant="plain" size="plain">Excluir</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}

/* ─── Inativar confirm ─── */
function InativarConfirm({
  nome,
  onClose,
  onConfirm
}: {
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={onClose}>
        <div className="p-4 border-b peract-border-color">
          <PeractModalTitle className="peract-font-color-default">Inativar Cliente</PeractModalTitle>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{
        background: "#FFF7ED",
        border: "1px solid #FED7AA"
      }}>
            <UserMinus size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Inativar "{nome}"?</p>
              <p className="text-xs text-amber-600 mt-0.5">O cliente será marcado como inativo e não aparecerá nas buscas padrão. Você pode reativar a qualquer momento.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-amber-600 hover:bg-amber-700" variant="plain" size="plain">Inativar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}

/* ─── Cliente Modal ─── */
interface ClienteModalProps {
  data?: Cliente;
  onClose: () => void;
  onSave: (d: Omit<Cliente, "id" | "totalPedidos" | "ativo">) => void;
}
function ClienteModal({
  data,
  onClose,
  onSave
}: ClienteModalProps) {
  const [nome, setNome] = useState(data?.nome ?? "");
  const [telefone, setTelefone] = useState(data?.telefone ?? "");
  const [email, setEmail] = useState(data?.email ?? "");
  const [endereco, setEndereco] = useState<Endereco>(data?.endereco ?? {
    ...EMPTY_ENDERECO
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const clearError = (key: string) => setErrors(p => ({
    ...p,
    [key]: ""
  }));
  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Obrigatório.";
    if (!telefone.trim()) e.telefone = "Obrigatório.";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSuccess(true);
    onSave({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      endereco
    });
    setTimeout(onClose, 1200);
  };
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <PeractModalTitle className="peract-font-color-default">{data ? "Editar Cliente" : "Novo Cliente"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"><CheckCircle size={16} /> Salvo!</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PeractField>
              <PeractLabel className="text-sm text-gray-700 block mb-1.5">Nome completo <span className="text-red-500">*</span></PeractLabel>
              <PeractInputControl type="text" value={nome} onChange={e => {
            setNome(e.target.value);
            clearError("nome");
          }} placeholder="Ex: Ana Lima" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.nome ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.nome ? "#f87171" : ""} />
              {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
            </PeractField>
            <PeractField>
              <PeractLabel className="text-sm text-gray-700 block mb-1.5">Telefone <span className="text-red-500">*</span></PeractLabel>
              <PeractInputControl type="text" value={telefone} onChange={e => {
            setTelefone(e.target.value);
            clearError("telefone");
          }} placeholder="(11) 99999-9999" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.telefone ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.telefone ? "#f87171" : ""} />
              {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
            </PeractField>
          </div>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">E-mail <span className="text-xs peract-font-color-muted">(opcional)</span></PeractLabel>
            <PeractInputControl type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""} />
          </PeractField>
          <EnderecoFields endereco={endereco} onChange={setEndereco} errors={errors} onClearError={clearError} />
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">Salvar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}

/* ─── Fornecedor Modal ─── */
interface FornecedorModalProps {
  data?: Fornecedor;
  onClose: () => void;
  onSave: (d: Omit<Fornecedor, "id" | "totalCompras">) => void;
}
function FornecedorModal({
  data,
  onClose,
  onSave
}: FornecedorModalProps) {
  const [razaoSocial, setRazaoSocial] = useState(data?.razaoSocial ?? "");
  const [cnpj, setCnpj] = useState(data?.cnpj ?? "");
  const [email, setEmail] = useState(data?.email ?? "");
  const [telefone, setTelefone] = useState(data?.telefone ?? "");
  const [endereco, setEndereco] = useState<Endereco>(data?.endereco ?? {
    ...EMPTY_ENDERECO
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const clearError = (key: string) => setErrors(p => ({
    ...p,
    [key]: ""
  }));
  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!razaoSocial.trim()) e.razaoSocial = "Obrigatório.";
    if (!cnpj.trim()) e.cnpj = "Obrigatório.";
    if (!email.trim()) e.email = "Obrigatório.";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSuccess(true);
    onSave({
      razaoSocial: razaoSocial.trim(),
      cnpj: cnpj.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      endereco
    });
    setTimeout(onClose, 1200);
  };
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <PeractModalTitle className="peract-font-color-default">{data ? "Editar Fornecedor" : "Novo Fornecedor"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"><CheckCircle size={16} /> Salvo!</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{
          label: "Razão Social",
          key: "razaoSocial",
          val: razaoSocial,
          set: setRazaoSocial,
          ph: "Ex: Empresa Ltda",
          req: true
        }, {
          label: "CNPJ",
          key: "cnpj",
          val: cnpj,
          set: setCnpj,
          ph: "00.000.000/0001-00",
          req: true
        }, {
          label: "Telefone",
          key: "telefone",
          val: telefone,
          set: setTelefone,
          ph: "(11) 3333-4444",
          req: false
        }, {
          label: "E-mail",
          key: "email",
          val: email,
          set: setEmail,
          ph: "contato@empresa.com.br",
          req: true
        }].map(({
          label,
          key,
          val,
          set,
          ph,
          req
        }) => <PeractField key={key}>
                <PeractLabel className="text-sm text-gray-700 block mb-1.5">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</PeractLabel>
                <PeractInputControl type={key === "email" ? "email" : "text"} value={val} onChange={e => {
            set(e.target.value);
            clearError(key);
          }} placeholder={ph} className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors[key] ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors[key] ? "#f87171" : ""} />
                {errors[key] && <p className="text-xs text-red-600 mt-1">{errors[key]}</p>}
              </PeractField>)}
          </div>
          <EnderecoFields endereco={endereco} onChange={setEndereco} errors={errors} onClearError={clearError} />
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">Salvar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}

/* ─── Funcionário Modal ─── */
interface FuncionarioModalProps {
  data?: Funcionario;
  onClose: () => void;
  onSave: (d: Omit<Funcionario, "id">) => void;
}
function FuncionarioModal({
  data,
  onClose,
  onSave
}: FuncionarioModalProps) {
  const [nome, setNome] = useState(data?.nome ?? "");
  const [cargo, setCargo] = useState<CargoFuncionario>(data?.cargo ?? "Funcionário");
  const [email, setEmail] = useState(data?.email ?? "");
  const [senha, setSenha] = useState(data?.senha ?? "");
  const [confirmSenha, setConfirmSenha] = useState(data?.senha ?? "");
  const [showSenha, setShowSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const isNew = !data;
  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Obrigatório.";
    if (!email.trim()) e.email = "Obrigatório.";
    if (isNew && !senha) e.senha = "Defina uma senha de acesso.";
    if (senha && senha.length < 6) e.senha = "Mínimo de 6 caracteres.";
    if (senha && senha !== confirmSenha) e.confirmSenha = "As senhas não coincidem.";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSuccess(true);
    onSave({
      nome: nome.trim(),
      cargo,
      email: email.trim(),
      senha: senha || data?.senha
    });
    setTimeout(onClose, 1200);
  };
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <PeractModalTitle className="peract-font-color-default">{data ? "Editar Funcionário" : "Novo Funcionário"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"><CheckCircle size={16} /> Salvo!</div>}
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">Nome completo <span className="text-red-500">*</span></PeractLabel>
            <PeractInputControl type="text" value={nome} onChange={e => {
          setNome(e.target.value);
          setErrors({
            ...errors,
            nome: ""
          });
        }} placeholder="Ex: Beatriz Oliveira" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.nome ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.nome ? "#f87171" : ""} />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </PeractField>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">Cargo <span className="text-red-500">*</span></PeractLabel>
            <PeractNativeSelect value={cargo} onChange={e => setCargo(e.target.value as CargoFuncionario)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
              <option value="Administrador">Administrador</option>
              <option value="Funcionário">Funcionário</option>
            </PeractNativeSelect>
          </PeractField>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">E-mail de acesso <span className="text-red-500">*</span></PeractLabel>
            <PeractInputControl type="email" value={email} onChange={e => {
          setEmail(e.target.value);
          setErrors({
            ...errors,
            email: ""
          });
        }} placeholder="usuario@canalperfumado.com.br" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.email ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.email ? "#f87171" : ""} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </PeractField>
          <div className="border peract-border-color rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b peract-border-color flex items-center gap-1.5" style={{
          background: "#fafaf9"
        }}>
              <KeyRound size={12} className="peract-font-color-muted" />
              <p className="text-xs font-medium peract-font-color-muted">
                {isNew ? "Senha de acesso" : "Alterar senha"}
                {!isNew && <span className="peract-font-color-muted font-normal ml-1">(deixe em branco para manter)</span>}
              </p>
            </div>
            <div className="p-3 flex flex-col gap-3">
              <PeractField>
                <PeractLabel className="text-xs text-gray-600 block mb-1">{isNew ? "Senha" : "Nova senha"} {isNew && <span className="text-red-500">*</span>}</PeractLabel>
                <div className="relative">
                  <PeractInputControl type={showSenha ? "text" : "password"} value={senha} onChange={e => {
                setSenha(e.target.value);
                setErrors({
                  ...errors,
                  senha: ""
                });
              }} placeholder="Mínimo 6 caracteres" className={`w-full border rounded-lg px-3 py-2 text-sm pr-9 focus:outline-none transition-colors ${errors.senha ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.senha ? "#f87171" : ""} />
                  <PeractButtonPrimitive type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-2.5 top-1/2 -translate-y-1/2 peract-font-color-muted hover:text-gray-600" variant="plain" size="plain">
                    {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                  </PeractButtonPrimitive>
                </div>
                {errors.senha && <p className="text-xs text-red-600 mt-1">{errors.senha}</p>}
              </PeractField>
              <PeractField>
                <PeractLabel className="text-xs text-gray-600 block mb-1">Confirmar senha {isNew && <span className="text-red-500">*</span>}</PeractLabel>
                <PeractInputControl type={showSenha ? "text" : "password"} value={confirmSenha} onChange={e => {
              setConfirmSenha(e.target.value);
              setErrors({
                ...errors,
                confirmSenha: ""
              });
            }} placeholder="Repita a senha" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.confirmSenha ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.confirmSenha ? "#f87171" : ""} />
                {errors.confirmSenha && <p className="text-xs text-red-600 mt-1">{errors.confirmSenha}</p>}
              </PeractField>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">Salvar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
function CardActions({
  onEdit,
  onDelete
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return <div className="flex items-center gap-1">
      <PeractButtonPrimitive onClick={onEdit} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-gray-100" title="Editar" variant="plain" size="plain" aria-label="Editar"><Pencil size={14} /></PeractButtonPrimitive>
      <PeractButtonPrimitive onClick={onDelete} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Excluir" variant="plain" size="plain" aria-label="Excluir"><Trash2 size={14} /></PeractButtonPrimitive>
    </div>;
}

/* ─── Status Badge ─── */
function StatusBadge({
  ativo
}: {
  ativo: boolean;
}) {
  return <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${ativo ? "bg-green-100 text-green-700" : "bg-gray-100 peract-font-color-muted"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ativo ? "bg-green-500" : "bg-gray-400"}`} />
      {ativo ? "Ativo" : "Inativo"}
    </span>;
}
function PeoplePage() {
  const {
    clientes,
    setClientes,
    fornecedores,
    setFornecedores,
    funcionarios,
    setFuncionarios,
    currentUser
  } = useApp();
  const isAdmin = currentUser?.cargo === "Administrador";
  const [aba, setAba] = useState<Aba>("clientes");
  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("ativos");
  type ModalState = {
    type: "cliente";
    data?: Cliente;
  } | {
    type: "fornecedor";
    data?: Fornecedor;
  } | {
    type: "funcionario";
    data?: Funcionario;
  } | null;
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    nome: string;
    fn: () => void;
  } | null>(null);
  const [inativarTarget, setInativarTarget] = useState<Cliente | null>(null);
  const clientesAtivos = clientes.filter(c => c.ativo !== false);
  const clientesInativos = clientes.filter(c => c.ativo === false);
  const allTabs: {
    key: Aba;
    label: string;
    icon: React.ReactNode;
    count: number;
    adminOnly: boolean;
  }[] = [{
    key: "clientes",
    label: "Clientes",
    icon: <User size={15} />,
    count: clientesAtivos.length,
    adminOnly: false
  }, {
    key: "fornecedores",
    label: "Fornecedores",
    icon: <Truck size={15} />,
    count: fornecedores.length,
    adminOnly: true
  }, {
    key: "funcionarios",
    label: "Funcionários",
    icon: <Briefcase size={15} />,
    count: funcionarios.length,
    adminOnly: true
  }];
  const tabs = allTabs.filter(t => isAdmin || !t.adminOnly);
  const saveCliente = (d: Omit<Cliente, "id" | "totalPedidos" | "ativo">) => {
    const cd = modal?.type === "cliente" && modal.data ? modal.data : null;
    if (cd) setClientes(prev => prev.map(c => c.id === cd.id ? {
      ...c,
      ...d
    } : c));else {
      const newId = Math.max(...clientes.map(c => c.id), 0) + 1;
      setClientes(prev => [...prev, {
        id: newId,
        ...d,
        totalPedidos: 0,
        ativo: true
      }]);
    }
    setModal(null);
  };
  const saveFornecedor = (d: Omit<Fornecedor, "id" | "totalCompras">) => {
    const fd = modal?.type === "fornecedor" && modal.data ? modal.data : null;
    if (fd) setFornecedores(prev => prev.map(f => f.id === fd.id ? {
      ...f,
      ...d
    } : f));else {
      const newId = Math.max(...fornecedores.map(f => f.id), 0) + 1;
      setFornecedores(prev => [...prev, {
        id: newId,
        ...d,
        totalCompras: 0
      }]);
    }
    setModal(null);
  };
  const saveFuncionario = (d: Omit<Funcionario, "id">) => {
    const fn = modal?.type === "funcionario" && modal.data ? modal.data : null;
    if (fn) setFuncionarios(prev => prev.map(f => f.id === fn.id ? {
      ...f,
      ...d
    } : f));else {
      const newId = Math.max(...funcionarios.map(f => f.id), 0) + 1;
      setFuncionarios(prev => [...prev, {
        id: newId,
        ...d
      }]);
    }
    setModal(null);
  };
  const toggleAtivo = (id: number, ativar: boolean) => {
    setClientes(prev => prev.map(c => c.id === id ? {
      ...c,
      ativo: ativar
    } : c));
  };

  // Filtro de clientes por status + busca
  const clientesByStatus = clientes.filter(c => {
    if (statusFiltro === "ativos") return c.ativo !== false;
    if (statusFiltro === "inativos") return c.ativo === false;
    return true;
  });
  const filtClientes = clientesByStatus.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()) || c.telefone.includes(search));
  const filtFornecedores = fornecedores.filter(f => f.razaoSocial.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase()));
  const filtFuncionarios = funcionarios.filter(f => f.nome.toLowerCase().includes(search.toLowerCase()) || f.cargo.toLowerCase().includes(search.toLowerCase()));
  const openNew = () => {
    if (aba === "clientes") setModal({
      type: "cliente"
    });else if (aba === "fornecedores") setModal({
      type: "fornecedor"
    });else setModal({
      type: "funcionario"
    });
  };
  const newLabel = aba === "clientes" ? "Novo cliente" : aba === "fornecedores" ? "Novo fornecedor" : "Novo funcionário";
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {modal?.type === "cliente" && <ClienteModal data={modal.data} onClose={() => setModal(null)} onSave={saveCliente} />}
      {modal?.type === "fornecedor" && <FornecedorModal data={modal.data} onClose={() => setModal(null)} onSave={saveFornecedor} />}
      {modal?.type === "funcionario" && <FuncionarioModal data={modal.data} onClose={() => setModal(null)} onSave={saveFuncionario} />}
      {deleteTarget && <DeleteConfirm nome={deleteTarget.nome} onClose={() => setDeleteTarget(null)} onConfirm={() => {
      deleteTarget.fn();
      setDeleteTarget(null);
    }} />}
      {inativarTarget && <InativarConfirm nome={inativarTarget.nome} onClose={() => setInativarTarget(null)} onConfirm={() => {
      toggleAtivo(inativarTarget.id, false);
      setInativarTarget(null);
    }} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="peract-font-color-default">Gestão de Pessoas</h1>
          <p className="text-xs peract-font-color-muted mt-0.5">Clientes, fornecedores e equipe</p>
        </div>
        <PeractButtonPrimitive onClick={openNew} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 self-start peract-bg-accent" variant="plain" size="plain">
          <Plus size={16} /> {newLabel}
        </PeractButtonPrimitive>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b peract-border-color mb-4">
        {tabs.map(t => <PeractButtonPrimitive key={t.key} onClick={() => {
        setAba(t.key);
        setSearch("");
        setStatusFiltro("ativos");
      }} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-all ${aba === t.key ? "font-medium" : "border-transparent peract-font-color-muted hover:text-gray-700"}`} style={aba === t.key ? {
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
          <PeractInputControl type="text" placeholder={`Buscar ${aba === "clientes" ? "cliente" : aba === "fornecedores" ? "fornecedor" : "funcionário"}...`} value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
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
                      {isAtivo ? <PeractButtonPrimitive onClick={() => setInativarTarget(c)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-amber-50 hover:text-amber-600" title="Inativar cliente" variant="plain" size="plain" aria-label="Inativar cliente">
                          <UserMinus size={14} />
                        </PeractButtonPrimitive> : <PeractButtonPrimitive onClick={() => toggleAtivo(c.id, true)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-green-50 hover:text-green-600" title="Reativar cliente" variant="plain" size="plain" aria-label="Reativar cliente">
                          <UserCheck size={14} />
                        </PeractButtonPrimitive>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Phone size={12} className="shrink-0" />{c.telefone}</div>
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
                  <p className="text-xs peract-font-color-muted font-mono">{f.cnpj}</p>
                </div>
                <CardActions onEdit={() => setModal({
            type: "fornecedor",
            data: f
          })} onDelete={() => setDeleteTarget({
            nome: f.razaoSocial,
            fn: () => setFornecedores(prev => prev.filter(x => x.id !== f.id))
          })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Phone size={12} className="shrink-0" />{f.telefone || "—"}</div>
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
                        {f.senha ? <span className="text-xs peract-font-color-muted font-mono bg-gray-50 px-2 py-0.5 rounded">{"•".repeat(Math.min(f.senha.length, 8))}</span> : <span className="text-xs text-red-400 italic">Não definida</span>}
                      </PeractTableCell>
                      <PeractTableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <PeractButtonPrimitive onClick={() => setModal({
                      type: "funcionario",
                      data: f
                    })} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100 transition-colors" title="Editar" variant="plain" size="plain" aria-label="Editar"><Pencil size={14} /></PeractButtonPrimitive>
                          <PeractButtonPrimitive onClick={() => setDeleteTarget({
                      nome: f.nome,
                      fn: () => setFuncionarios(prev => prev.filter(x => x.id !== f.id))
                    })} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-red-50 hover:text-red-600 transition-colors" title="Excluir" variant="plain" size="plain" aria-label="Excluir"><Trash2 size={14} /></PeractButtonPrimitive>
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
            })} onDelete={() => setDeleteTarget({
              nome: f.nome,
              fn: () => setFuncionarios(prev => prev.filter(x => x.id !== f.id))
            })} />
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs peract-font-color-muted"><Mail size={12} className="shrink-0" />{f.email}</div>
                </div>
              </PeractCard>)}
          </div>
        </>}
    </div>;
}
export { PeoplePage };
