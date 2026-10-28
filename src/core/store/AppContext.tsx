import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import type { AuthSession, AuthenticatedUser } from "../auth/auth.types";
import { sessionService } from "../auth/session.service";
import { authService } from "../services/auth.service";
import { logger } from "../logging/logger";

/* ─── Types ─── */
export type StockStatus = "ok" | "critico" | "esgotado";

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  status: StockStatus;
  preco: number;
  precoCompra?: number; // custo de aquisição
  volume?: number;
  tipoMedida?: string;
}

export interface Category {
  id: number;
  nome: string;
}

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: Endereco;
  totalPedidos: number;
  ativo?: boolean; // true = ativo (padrão), false = inativo
}

export interface Fornecedor {
  id: number;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: Endereco;
  totalCompras: number;
}

export type CargoFuncionario = "Administrador" | "Funcionário";

export interface Funcionario {
  id: number;
  nome: string;
  cargo: CargoFuncionario;
  email: string;
  senha?: string;
}

export interface AppNotification {
  id: number;
  type: "low_stock" | "out_of_stock";
  message: string;
  productName: string;
  read: boolean;
  timestamp: number;
}

export interface StockThresholds {
  critico: number;
}

/* ─── Vendas ─── */
export interface VendaItem {
  nome: string;
  categoria?: string;
  volume?: string;
  quantidade: number;
  valorUnitario: number;
  tipoItem?: "PRODUTO" | "DECANT" | "BODY_SPLASH_FRACIONADO";
}

export interface Venda {
  id: string;
  data: string;
  cliente: string;
  emailCliente?: string;
  pagamento: string;
  total: number;
  tipoVenda: "online" | "presencial";
  canalOnline?: "whatsapp" | "site";
  frete?: number;
  desconto?: number; // valor do desconto aplicado em R$
  itens: VendaItem[];
  cancelada?: boolean;
  enviado?: boolean;
  dataEnvio?: string;
  codigoRastreio?: string;
}

export type KanbanColuna =
  | "Prospecto"
  | "Contato Feito"
  | "Proposta Enviada"
  | "Em Negociação"
  | "Ganho"
  | "Perdido";

export const KANBAN_COLUNAS: KanbanColuna[] = [
  "Prospecto",
  "Contato Feito",
  "Proposta Enviada",
  "Em Negociação",
  "Ganho",
  "Perdido",
];

export interface KanbanCard {
  clienteId: number;
  coluna: KanbanColuna;
  nota: string;
  addedAt: number;
}

/* ─── Initial data ─── */
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Chanel N°5",
    brand: "Chanel",
    category: "Perfumes",
    currentStock: 4,
    status: "critico",
    preco: 45,
    precoCompra: 27,
    volume: 100,
    tipoMedida: "ml",
  },
  {
    id: 2,
    name: "Dior Sauvage",
    brand: "Dior",
    category: "Perfumes",
    currentStock: 0,
    status: "esgotado",
    preco: 38,
    precoCompra: 23,
    volume: 200,
    tipoMedida: "ml",
  },
  {
    id: 3,
    name: "YSL Libre",
    brand: "Yves Saint Laurent",
    category: "Perfumes",
    currentStock: 6,
    status: "critico",
    preco: 42,
    precoCompra: 25,
    volume: 90,
    tipoMedida: "ml",
  },
  {
    id: 4,
    name: "Creed Aventus",
    brand: "Creed",
    category: "Perfumes",
    currentStock: 15,
    status: "ok",
    preco: 65,
    precoCompra: 40,
    volume: 100,
    tipoMedida: "ml",
  },
  {
    id: 5,
    name: "Tom Ford Black Orchid",
    brand: "Tom Ford",
    category: "Perfumes",
    currentStock: 22,
    status: "ok",
    preco: 58,
    precoCompra: 36,
    volume: 50,
    tipoMedida: "ml",
  },
  {
    id: 6,
    name: "Lavanda & Ylang Body Splash",
    brand: "Próprio",
    category: "Body Splash",
    currentStock: 18,
    status: "ok",
    preco: 22,
    precoCompra: 11,
    volume: 200,
    tipoMedida: "ml",
  },
  {
    id: 7,
    name: "Rosa & Baunilha Body Splash",
    brand: "Próprio",
    category: "Body Splash",
    currentStock: 12,
    status: "ok",
    preco: 22,
    precoCompra: 11,
    volume: 200,
    tipoMedida: "ml",
  },
  {
    id: 8,
    name: "Colônia Clássica Citrus",
    brand: "Próprio",
    category: "Colônias",
    currentStock: 0,
    status: "esgotado",
    preco: 28,
    precoCompra: 15,
    volume: 150,
    tipoMedida: "ml",
  },
  {
    id: 9,
    name: "Kit Presente Premium",
    brand: "Próprio",
    category: "Kits",
    currentStock: 9,
    status: "ok",
    preco: 120,
    precoCompra: 72,
  },
  {
    id: 10,
    name: "Hermès Terre d'Hermès",
    brand: "Hermès",
    category: "Perfumes",
    currentStock: 25,
    status: "ok",
    preco: 55,
    precoCompra: 34,
    volume: 75,
    tipoMedida: "ml",
  },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, nome: "Amadeirados" },
  { id: 2, nome: "Ambarados" },
  { id: 3, nome: "Cítricos" },
  { id: 4, nome: "Florais" },
];

const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 1,
    nome: "Ana Lima",
    email: "ana@email.com",
    telefone: "(11) 99999-1111",
    endereco: {
      cep: "01310-100",
      logradouro: "Rua das Flores",
      numero: "100",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    },
    totalPedidos: 12,
  },
  {
    id: 2,
    nome: "Carlos Mendes",
    email: "carlos@email.com",
    telefone: "(21) 98888-2222",
    endereco: {
      cep: "22070-010",
      logradouro: "Av. Atlântica",
      numero: "200",
      bairro: "Copacabana",
      cidade: "Rio de Janeiro",
      uf: "RJ",
    },
    totalPedidos: 8,
  },
  {
    id: 3,
    nome: "Mariana Costa",
    email: "mariana@email.com",
    telefone: "(31) 97777-3333",
    endereco: {
      cep: "30130-170",
      logradouro: "Rua Ouro Preto",
      numero: "50",
      bairro: "Funcionários",
      cidade: "Belo Horizonte",
      uf: "MG",
    },
    totalPedidos: 20,
  },
  {
    id: 4,
    nome: "Pedro Alves",
    email: "pedro@email.com",
    telefone: "(85) 96666-6666",
    endereco: {
      cep: "60165-121",
      logradouro: "Av. Beira Mar",
      numero: "80",
      bairro: "Meireles",
      cidade: "Fortaleza",
      uf: "CE",
    },
    totalPedidos: 5,
  },
  {
    id: 5,
    nome: "Juliana Santos",
    email: "juliana@email.com",
    telefone: "(47) 95555-8888",
    endereco: {
      cep: "89010-002",
      logradouro: "Rua XV de Novembro",
      numero: "300",
      bairro: "Centro",
      cidade: "Blumenau",
      uf: "SC",
    },
    totalPedidos: 15,
  },
];

const INITIAL_FORNECEDORES: Fornecedor[] = [
  {
    id: 1,
    razaoSocial: "FrascosBR Ltda",
    cnpj: "11.222.333/0001-44",
    email: "vendas@fracsosbr.com.br",
    telefone: "(11) 3333-4444",
    endereco: {
      cep: "03220-000",
      logradouro: "Rua Industrial",
      numero: "500",
      bairro: "Brás",
      cidade: "São Paulo",
      uf: "SP",
    },
    totalCompras: 15,
  },
  {
    id: 2,
    razaoSocial: "PrintMax",
    cnpj: "55.666.777/0001-88",
    email: "contato@printmax.com.br",
    telefone: "(19) 3222-5555",
    endereco: {
      cep: "13010-050",
      logradouro: "Av. Comercial",
      numero: "200",
      bairro: "Centro",
      cidade: "Campinas",
      uf: "SP",
    },
    totalCompras: 8,
  },
  {
    id: 3,
    razaoSocial: "QuimicaPlus",
    cnpj: "99.000.111/0001-22",
    email: "vendas@quimicaplus.com",
    telefone: "(11) 4444-7777",
    endereco: {
      cep: "04310-100",
      logradouro: "Rua dos Químicos",
      numero: "10",
      bairro: "Vila Mariana",
      cidade: "São Paulo",
      uf: "SP",
    },
    totalCompras: 22,
  },
];

const INITIAL_FUNCIONARIOS: Funcionario[] = [
  {
    id: 1,
    nome: "Administrador",
    cargo: "Administrador",
    email: "admin@canalperfumado.com.br",
    senha: "admin123",
  },
  {
    id: 2,
    nome: "Beatriz Oliveira",
    cargo: "Funcionário",
    email: "beatriz@canalperfumado.com.br",
    senha: "func123",
  },
];

const INITIAL_THRESHOLDS: StockThresholds = { critico: 6 };

const INITIAL_VENDAS: Venda[] = [
  {
    id: "V-1042",
    data: "24/03/2026 14:32",
    cliente: "Ana Lima",
    pagamento: "Pix",
    total: 104.0,
    tipoVenda: "online",
    frete: 15.0,
    enviado: false,
    itens: [
      {
        nome: "Decant Chanel N°5 5ml",
        volume: "5ml",
        quantidade: 2,
        valorUnitario: 25.0,
      },
      {
        nome: "Lavanda & Ylang Body Splash",
        quantidade: 1,
        valorUnitario: 22.0,
      },
      {
        nome: "Decant Dior Sauvage 5ml",
        volume: "5ml",
        quantidade: 1,
        valorUnitario: 17.0,
      },
    ],
  },
  {
    id: "V-1041",
    data: "24/03/2026 11:15",
    cliente: "Carlos Mendes",
    pagamento: "Cartão de crédito",
    total: 156.0,
    tipoVenda: "presencial",
    itens: [
      {
        nome: "Decant Creed Aventus 3ml",
        volume: "3ml",
        quantidade: 3,
        valorUnitario: 28.0,
      },
      {
        nome: "Decant Dior Sauvage 10ml",
        volume: "10ml",
        quantidade: 1,
        valorUnitario: 50.0,
      },
      { nome: "Kit Presente Premium", quantidade: 1, valorUnitario: 30.0 },
    ],
  },
  {
    id: "V-1040",
    data: "23/03/2026 16:45",
    cliente: "Mariana Costa",
    pagamento: "Pix",
    total: 232.0,
    tipoVenda: "online",
    frete: 20.0,
    enviado: true,
    dataEnvio: "24/03/2026",
    itens: [
      { nome: "Creed Aventus", quantidade: 2, valorUnitario: 65.0 },
      {
        nome: "Decant YSL Libre 2ml",
        volume: "2ml",
        quantidade: 4,
        valorUnitario: 13.0,
      },
      {
        nome: "Lavanda & Ylang Body Splash",
        quantidade: 2,
        valorUnitario: 22.0,
      },
    ],
  },
  {
    id: "V-1039",
    data: "23/03/2026 10:20",
    cliente: "Pedro Alves",
    pagamento: "Dinheiro",
    total: 67.5,
    tipoVenda: "presencial",
    itens: [
      {
        nome: "Decant Chanel N°5 2ml",
        volume: "2ml",
        quantidade: 3,
        valorUnitario: 12.0,
      },
      {
        nome: "Rosa & Baunilha Body Splash",
        quantidade: 1,
        valorUnitario: 22.0,
      },
    ],
  },
  {
    id: "V-1038",
    data: "22/03/2026 15:00",
    cliente: "Juliana Santos",
    pagamento: "Cartão de débito",
    total: 345.0,
    tipoVenda: "presencial",
    itens: [
      { nome: "Tom Ford Black Orchid", quantidade: 3, valorUnitario: 58.0 },
      {
        nome: "Decant Dior Sauvage 10ml",
        volume: "10ml",
        quantidade: 3,
        valorUnitario: 50.0,
      },
      { nome: "Kit Presente Premium", quantidade: 1, valorUnitario: 120.0 },
    ],
  },
  {
    id: "V-1037",
    data: "22/03/2026 09:10",
    cliente: "Roberto Ferreira",
    pagamento: "Transferência bancária",
    total: 118.0,
    tipoVenda: "online",
    frete: 20.0,
    enviado: false,
    itens: [
      {
        nome: "Decant Creed Aventus 3ml",
        volume: "3ml",
        quantidade: 2,
        valorUnitario: 28.0,
      },
      {
        nome: "Lavanda & Ylang Body Splash",
        quantidade: 2,
        valorUnitario: 22.0,
      },
    ],
  },
  {
    id: "V-1036",
    data: "21/03/2026 13:00",
    cliente: "Fernanda Rocha",
    pagamento: "Pix",
    total: 196.0,
    tipoVenda: "online",
    frete: 18.0,
    enviado: false,
    itens: [
      { nome: "Hermès Terre d'Hermès", quantidade: 2, valorUnitario: 55.0 },
      {
        nome: "Decant YSL Libre 2ml",
        volume: "2ml",
        quantidade: 4,
        valorUnitario: 13.0,
      },
      {
        nome: "Lavanda & Ylang Body Splash",
        quantidade: 2,
        valorUnitario: 22.0,
      },
    ],
  },
];

/* ─── Context interface ─── */
interface AppContextType {
  // Auth
  isLoggedIn: boolean;
  currentUser: AuthenticatedUser | null;
  applyAuthSession: (session: AuthSession) => void;
  logout: () => Promise<void>;

  // Products
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "status">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: number) => void;
  reduceStock: (items: { productId: number; qty: number }[]) => void;

  // Categories
  categories: Category[];
  addCategory: (nome: string) => void;
  editCategory: (id: number, nome: string) => void;
  deleteCategory: (id: number) => void;

  // People
  clientes: Cliente[];
  setClientes: Dispatch<SetStateAction<Cliente[]>>;
  fornecedores: Fornecedor[];
  setFornecedores: Dispatch<SetStateAction<Fornecedor[]>>;
  funcionarios: Funcionario[];
  setFuncionarios: Dispatch<SetStateAction<Funcionario[]>>;

  // Notifications
  notifications: AppNotification[];
  dismissNotification: (id: number) => void;
  markAllRead: () => void;

  // Stock thresholds
  stockThresholds: StockThresholds;
  setStockThresholds: (t: StockThresholds) => void;

  // Kanban
  kanbanCards: KanbanCard[];
  addKanbanCard: (clienteId: number, coluna: KanbanColuna) => void;
  moveKanbanCard: (clienteId: number, coluna: KanbanColuna) => void;
  removeKanbanCard: (clienteId: number) => void;
  updateKanbanNote: (clienteId: number, nota: string) => void;

  // Vendas
  vendas: Venda[];
  addVenda: (v: Omit<Venda, "id" | "cancelada">) => string;
  updateVenda: (v: Venda) => void;
  softDeleteVenda: (id: string) => void;
  updateVendaEnvio: (
    id: string,
    enviado: boolean,
    dataEnvio?: string,
    codigoRastreio?: string,
  ) => void;

  // Helpers
  getStockStatus: (qty: number) => StockStatus;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [restoredSession] = useState(() => sessionService.restore());

  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(restoredSession));
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(
    restoredSession?.user ?? null,
  );

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [fornecedores, setFornecedores] =
    useState<Fornecedor[]>(INITIAL_FORNECEDORES);
  const [funcionarios, setFuncionarios] =
    useState<Funcionario[]>(INITIAL_FUNCIONARIOS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stockThresholds, setStockThresholdsState] =
    useState<StockThresholds>(INITIAL_THRESHOLDS);
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([]);
  const [notifIdCounter, setNotifIdCounter] = useState(1);
  const [vendas, setVendas] = useState<Venda[]>(INITIAL_VENDAS);
  const [vendaIdCounter, setVendaIdCounter] = useState(1043);

  useEffect(() => sessionService.subscribeToClear(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  }), []);

  const applyAuthSession = useCallback((session: AuthSession) => {
    setIsLoggedIn(true);
    setCurrentUser(session.user);
    logger.info("Usuário autenticado", { email: session.user.email });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      logger.warn("Nao foi possivel encerrar a sessao no servidor");
    } finally {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
    logger.info("Sessão encerrada");
  }, []);

  const getStockStatus = useCallback(
    (qty: number): StockStatus => {
      if (qty === 0) return "esgotado";
      if (qty <= stockThresholds.critico) return "critico";
      return "ok";
    },
    [stockThresholds],
  );

  const setStockThresholds = useCallback((t: StockThresholds) => {
    setStockThresholdsState(t);
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        status:
          p.currentStock === 0
            ? "esgotado"
            : p.currentStock <= t.critico
              ? "critico"
              : "ok",
      })),
    );
  }, []);

  const addProduct = useCallback(
    (p: Omit<Product, "id" | "status">) => {
      setProducts((prev) => {
        const newId = Math.max(...prev.map((x) => x.id), 0) + 1;
        const status = getStockStatus(p.currentStock);
        return [...prev, { id: newId, ...p, status }];
      });
    },
    [getStockStatus],
  );

  const updateProduct = useCallback(
    (p: Product) => {
      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...p, status: getStockStatus(p.currentStock) } : x,
        ),
      );
    },
    [getStockStatus],
  );

  const deleteProduct = useCallback((id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addNotification = useCallback(
    (type: "low_stock" | "out_of_stock", productName: string) => {
      setNotifications((prev) => {
        const msg =
          type === "out_of_stock"
            ? `"${productName}" está esgotado!`
            : `"${productName}" está com estoque crítico`;
        const newNotif: AppNotification = {
          id: notifIdCounter,
          type,
          message: msg,
          productName,
          read: false,
          timestamp: Date.now(),
        };
        setNotifIdCounter((c) => c + 1);
        return [newNotif, ...prev];
      });
    },
    [notifIdCounter],
  );

  const reduceStock = useCallback(
    (items: { productId: number; qty: number }[]) => {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          const item = items.find((i) => i.productId === p.id);
          if (!item) return p;
          const newQty = Math.max(0, p.currentStock - item.qty);
          const newStatus: StockStatus =
            newQty === 0
              ? "esgotado"
              : newQty <= stockThresholds.critico
                ? "critico"
                : "ok";
          const wasOk = p.status === "ok";
          const nowCritical = newStatus === "critico";
          const nowEsgotado = newStatus === "esgotado";
          if (wasOk && nowCritical) addNotification("low_stock", p.name);
          if (nowEsgotado && p.status !== "esgotado")
            addNotification("out_of_stock", p.name);
          return { ...p, currentStock: newQty, status: newStatus };
        });
        return updated;
      });
    },
    [stockThresholds, addNotification],
  );

  const addCategory = useCallback((nome: string) => {
    setCategories((prev) => {
      const newId = Math.max(...prev.map((c) => c.id), 0) + 1;
      return [...prev, { id: newId, nome }];
    });
  }, []);

  const editCategory = useCallback((id: number, nome: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, nome } : c)),
    );
    setCategories((prev) => {
      const cat = prev.find((c) => c.id === id);
      if (cat) {
        setProducts((pp) =>
          pp.map((p) =>
            p.category === cat.nome ? { ...p, category: nome } : p,
          ),
        );
      }
      return prev;
    });
  }, []);

  const deleteCategory = useCallback((id: number) => {
    setCategories((prev) => {
      const cat = prev.find((c) => c.id === id);
      if (cat) {
        setProducts((pp) =>
          pp.map((p) =>
            p.category === cat.nome ? { ...p, category: "Não vinculado" } : p,
          ),
        );
      }
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addKanbanCard = useCallback(
    (clienteId: number, coluna: KanbanColuna) => {
      setKanbanCards((prev) => {
        if (prev.find((c) => c.clienteId === clienteId)) return prev;
        return [...prev, { clienteId, coluna, nota: "", addedAt: Date.now() }];
      });
    },
    [],
  );

  const moveKanbanCard = useCallback(
    (clienteId: number, coluna: KanbanColuna) => {
      setKanbanCards((prev) =>
        prev.map((c) => (c.clienteId === clienteId ? { ...c, coluna } : c)),
      );
    },
    [],
  );

  const removeKanbanCard = useCallback((clienteId: number) => {
    setKanbanCards((prev) => prev.filter((c) => c.clienteId !== clienteId));
  }, []);

  const updateKanbanNote = useCallback((clienteId: number, nota: string) => {
    setKanbanCards((prev) =>
      prev.map((c) => (c.clienteId === clienteId ? { ...c, nota } : c)),
    );
  }, []);

  const addVenda = useCallback(
    (v: Omit<Venda, "id" | "cancelada">): string => {
      const newId = `V-${vendaIdCounter}`;
      setVendaIdCounter((c) => c + 1);
      setVendas((prev) => [{ ...v, id: newId, cancelada: false }, ...prev]);
      return newId;
    },
    [vendaIdCounter],
  );

  const updateVenda = useCallback((v: Venda) => {
    setVendas((prev) => prev.map((x) => (x.id === v.id ? v : x)));
  }, []);

  const softDeleteVenda = useCallback((id: string) => {
    setVendas((prev) =>
      prev.map((v) => (v.id === id ? { ...v, cancelada: true } : v)),
    );
  }, []);

  const updateVendaEnvio = useCallback(
    (
      id: string,
      enviado: boolean,
      dataEnvio?: string,
      codigoRastreio?: string,
    ) => {
      setVendas((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                enviado,
                dataEnvio: enviado ? dataEnvio : undefined,
                codigoRastreio: enviado ? codigoRastreio : undefined,
              }
            : v,
        ),
      );
    },
    [],
  );

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        applyAuthSession,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        reduceStock,
        categories,
        addCategory,
        editCategory,
        deleteCategory,
        clientes,
        setClientes,
        fornecedores,
        setFornecedores,
        funcionarios,
        setFuncionarios,
        notifications,
        dismissNotification,
        markAllRead,
        stockThresholds,
        setStockThresholds,
        kanbanCards,
        addKanbanCard,
        moveKanbanCard,
        removeKanbanCard,
        updateKanbanNote,
        vendas,
        addVenda,
        updateVenda,
        softDeleteVenda,
        updateVendaEnvio,
        getStockStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
