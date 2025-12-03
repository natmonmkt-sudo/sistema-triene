// Versão Final Limpa - Triene System
import React, { useState } from 'react';
import {
  Users,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  Zap,
  Phone,
  Mail,
  Tag,
  Download,
  Upload,
  User,
  LogOut,
  Database,
  Lock,
  Server,
  Globe,
  Wifi,
  Image,
  CalendarCheck,
  Edit3,
  Wand2
} from 'lucide-react';

// --- TIPOS ---
type LeadStatus = 'Novo' | 'Em Cadência' | 'Respondeu' | 'Agendado' | 'Perdido';
type ChannelType = 'whatsapp' | 'email';
type IntegrationProvider = 'digisac' | 'z-api' | 'evolution' | 'native';
type ImageStatus = 'Pendente' | 'Gerada' | 'Editada';

interface StyleGuide {
  colors: string;
  fonts: string;
  elements: string;
  aesthetics: string;
  persona: string;
  niche: string;
  cta: string;
}

interface ContentPlanItem {
  day: number;
  theme: string;
  imageType: string;
  objective: string;
  prompt: string;
  imageStatus: ImageStatus;
  imagePreview?: string;
  description: string;
  hashtags: string;
  ctaUsed: string;
}

interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
  email: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  tags: string[]; // Etiquetas (ex: 'VIP', 'Frio')
  status: LeadStatus;
  cadenceId: string; // Qual fluxo ele está seguindo
  currentStep: number;
  enteredAt: string;
  customData: {
    cpf?: string;
    city?: string;
    source?: string;
  };
  logs: Log[];
}

interface Log {
  id: number;
  message: string;
  timestamp: string;
  type: 'system' | 'sent_wa' | 'sent_email' | 'reply' | 'error';
  provider?: string; // Ex: 'DigiSac'
}

interface CadenceStep {
  step: number;
  day: number;
  channel: ChannelType;
  title: string;
  content: string;
  subject?: string; // Para emails
}

interface CadenceFlow {
  id: string;
  name: string;
  triggerTag: string; // A tag que ativa esse fluxo
  steps: CadenceStep[];
}

interface IntegrationConfig {
  provider: IntegrationProvider;
  apiUrl: string;
  token: string;
  isConnected: boolean;
}

// --- DADOS INICIAIS (MOCK) ---

const MOCK_CADENCES: CadenceFlow[] = [
  {
    id: 'flow_padrao',
    name: 'Fluxo Padrão (Leads Frios)',
    triggerTag: 'Frio',
    steps: [
      { step: 1, day: 0, channel: 'whatsapp', title: 'Boas Vindas', content: 'Olá [Nome], vi seu cadastro na Triene. Podemos conversar?' },
      { step: 2, day: 1, channel: 'email', title: 'Case de Sucesso', subject: 'Veja como a Empresa X cresceu', content: 'Oi [Nome], segue um estudo de caso...' },
      { step: 3, day: 2, channel: 'whatsapp', title: 'Cobrança', content: 'Eai [Nome], conseguiu ver o email?' }
    ]
  },
  {
    id: 'flow_vip',
    name: 'Fluxo VIP (High Ticket)',
    triggerTag: 'VIP',
    steps: [
      { step: 1, day: 0, channel: 'whatsapp', title: 'Contato Pessoal', content: 'Olá [Nome], sou o Diretor da Triene. Vi que você tem perfil VIP.' },
      { step: 2, day: 0, channel: 'email', title: 'Proposta Formal', subject: 'Convite Exclusivo Triene', content: 'Segue convite para reunião...' }
    ]
  }
];

// --- COMPONENTE PRINCIPAL ---

export default function TrieneApp() {
  // Estado de Autenticação
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Estado da Aplicação
  const [activeTab, setActiveTab] = useState<'leads' | 'cadence' | 'settings' | 'content'>('leads');
  const [activeCadenceId, setActiveCadenceId] = useState<string>('flow_padrao');
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado do Módulo de Conteúdo
  const [instagramHandle, setInstagramHandle] = useState('');
  const [outlineApproved, setOutlineApproved] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState('');
  const [contentOutline, setContentOutline] = useState<ContentPlanItem[]>([]);
  const [styleGuide, setStyleGuide] = useState<StyleGuide>({
    colors: 'Azul escuro, branco e detalhes em neon',
    fonts: 'Sans-serif condensada e títulos em bold',
    elements: 'Formas geométricas, ícones minimalistas, mockups de smartphones',
    aesthetics: 'Feed limpo com contraste e layouts modulares',
    persona: 'Fundadores e CMOs de startups digitais',
    niche: 'Marketing de performance',
    cta: 'Fale com nosso time via WhatsApp'
  });
  
  // Configuração de Integração (DigiSac)
  const [integration, setIntegration] = useState<IntegrationConfig>({
    provider: 'digisac',
    apiUrl: 'https://api.digisac.io/v1',
    token: 'sk_test_simulacao_token_123',
    isConnected: true
  });

  // Removido setCadences pois não era usado, evitando erro TS
  const [cadences] = useState<CadenceFlow[]>(MOCK_CADENCES);
  
  const [leads, setLeads] = useState<Lead[]>([
    { 
      id: 1, 
      name: 'Carlos Oliveira', 
      email: 'carlos@empresa.com',
      phone: '5511999991234', 
      company: 'Tech Solutions',
      tags: ['Frio', 'Facebook'],
      status: 'Em Cadência', 
      cadenceId: 'flow_padrao',
      currentStep: 2, 
      enteredAt: '2023-10-25 10:00',
      customData: { cpf: '123.456.789-00', city: 'São Paulo', source: 'Facebook Ads' },
      logs: [
        { id: 1, type: 'system', message: 'Lead importado', timestamp: '10:00' },
        { id: 2, type: 'sent_wa', message: 'Boas Vindas enviada', timestamp: '10:05', provider: 'DigiSac' }
      ] 
    },
    { 
      id: 2, 
      name: 'Mariana Silva', 
      email: 'mariana@vip.com',
      phone: '5521988887777', 
      company: 'Grupo Silva',
      tags: ['VIP'],
      status: 'Novo', 
      cadenceId: 'flow_vip',
      currentStep: 0, 
      enteredAt: '2023-10-26 14:00',
      customData: { cpf: '987.654.321-11', city: 'Rio de Janeiro', source: 'Indicação' },
      logs: [{ id: 3, type: 'system', message: 'Lead VIP cadastrado', timestamp: '14:00' }] 
    }
  ]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadDetailTab, setLeadDetailTab] = useState<'chat' | 'info'>('chat');

  // --- FUNÇÕES DO GERADOR DE CONTEÚDO ---
  const buildOutline = () => {
    const objectives = ['Engajamento', 'Autoridade', 'Venda', 'Educativo', 'Institucional'];
    const imageTypes = ['Carrossel', 'Mockup', 'Quote visual', 'Infográfico', 'Reels capa'];
    const themesBase = [
      'Bastidores da agência',
      'Resultado de cliente',
      'Framework de campanha',
      'Tendência do nicho',
      'Oferta do mês',
      'Dica prática de mídia paga',
      'História de sucesso',
      'Checklist rápido',
      'Quebra de objeção',
      'Convite para conversa'
    ];

    const outline = Array.from({ length: 30 }, (_, index) => ({
      day: index + 1,
      theme: `${themesBase[index % themesBase.length]} #${index + 1}`,
      imageType: imageTypes[index % imageTypes.length],
      objective: objectives[index % objectives.length],
      prompt: '',
      imageStatus: 'Pendente' as ImageStatus,
      imagePreview: '',
      description: '',
      hashtags: '',
      ctaUsed: styleGuide.cta
    }));

    setContentOutline(outline);
    setOutlineApproved(false);
    setAnalysisSummary(`Analisamos @${instagramHandle || 'cliente'}: feed com ${styleGuide.colors.toLowerCase()}, fontes ${styleGuide.fonts.toLowerCase()} e estética ${styleGuide.aesthetics.toLowerCase()}. Personas principais: ${styleGuide.persona}. Nicho: ${styleGuide.niche}.`);
  };

  const updateContentItem = (day: number, data: Partial<ContentPlanItem>) => {
    setContentOutline(prev => prev.map(item => item.day === day ? { ...item, ...data } : item));
  };

  const approveOutline = () => {
    if (!contentOutline.length) {
      alert('Gere um esboço antes de aprovar.');
      return;
    }
    setOutlineApproved(true);
  };

  const generateAutoPrompt = (item: ContentPlanItem) => {
    return `Arte ${item.imageType} para Instagram focada em ${item.objective}. Use ${styleGuide.colors}, tipografia ${styleGuide.fonts}, elementos ${styleGuide.elements}. Estética: ${styleGuide.aesthetics}. Persona: ${styleGuide.persona}. Nicho: ${styleGuide.niche}. Realce o tema "${item.theme}" e finalize com call-to-action ${styleGuide.cta}.`;
  };

  const createImageForDay = (day: number) => {
    const item = contentOutline.find(plan => plan.day === day);
    if (!item) return;
    const promptToUse = item.prompt || generateAutoPrompt(item);
    const previewUrl = `https://dummyimage.com/600x400/0f172a/ffffff.png&text=Dia+${item.day}+${encodeURIComponent(item.theme)}`;
    updateContentItem(day, {
      prompt: promptToUse,
      imageStatus: 'Gerada',
      imagePreview: previewUrl
    });
  };

  const editImageForDay = (day: number) => {
    const item = contentOutline.find(plan => plan.day === day);
    if (!item) return;
    const editedPreview = item.imagePreview
      ? `${item.imagePreview}&edited=${Date.now()}`
      : `https://dummyimage.com/600x400/f97316/ffffff.png&text=Editado+Dia+${day}`;
    updateContentItem(day, { imageStatus: 'Editada', imagePreview: editedPreview });
  };

  const generateDescriptionForDay = (day: number) => {
    const item = contentOutline.find(plan => plan.day === day);
    if (!item) return;
    const hashtags = `#${styleGuide.niche.replace(/\s+/g, '')} #marketing #${item.objective.toLowerCase()} #${styleGuide.persona.split(' ')[0].toLowerCase()}`;
    const description = `Post sobre "${item.theme}". Explica visualmente ${item.objective.toLowerCase()} com foco em ${item.imageType}. ${styleGuide.cta}. ${hashtags}`;
    updateContentItem(day, { description, hashtags, ctaUsed: styleGuide.cta });
  };

  const bulkGenerateImages = () => {
    if (!outlineApproved) {
      alert('Aprove o esboço antes de gerar em massa.');
      return;
    }
    setContentOutline(prev => prev.map(item => ({
      ...item,
      prompt: item.prompt || generateAutoPrompt(item),
      imageStatus: 'Gerada',
      imagePreview: item.imagePreview || `https://dummyimage.com/600x400/0f172a/ffffff.png&text=Dia+${item.day}+${encodeURIComponent(item.theme)}`
    })));
  };

  const bulkGenerateDescriptions = () => {
    if (!outlineApproved) {
      alert('Aprove o esboço antes de gerar descrições.');
      return;
    }
    setContentOutline(prev => prev.map(item => {
      const hashtags = `#${styleGuide.niche.replace(/\s+/g, '')} #marketing #${item.objective.toLowerCase()} #${styleGuide.persona.split(' ')[0].toLowerCase()}`;
      const description = `Post sobre "${item.theme}". Explica visualmente ${item.objective.toLowerCase()} com foco em ${item.imageType}. ${styleGuide.cta}. ${hashtags}`;
      return { ...item, description, hashtags, ctaUsed: styleGuide.cta };
    }));
  };

  const exportCalendar = () => {
    if (!contentOutline.length) {
      alert('Nada para exportar. Gere o esboço primeiro.');
      return;
    }
    const payload = contentOutline.map(item => ({
      dia: item.day,
      tema: item.theme,
      tipoImagem: item.imageType,
      objetivo: item.objective,
      prompt: item.prompt,
      statusImagem: item.imageStatus,
      descricao: item.description,
      hashtags: item.hashtags,
      cta: item.ctaUsed
    }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cronograma_conteudo.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- FUNÇÕES DE LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@triene.com' && loginPass === 'admin') {
      setCurrentUser({ id: 1, name: 'Administrador', role: 'admin', email: loginEmail });
    } else if (loginEmail === 'user@triene.com' && loginPass === 'user') {
      setCurrentUser({ id: 2, name: 'Vendedor', role: 'user', email: loginEmail });
    } else {
      alert('Tente admin@triene.com / admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedLead(null);
  };

  // --- FUNÇÕES DO SISTEMA ---

  // Testar Conexão API
  const testConnection = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIntegration(prev => ({ ...prev, isConnected: true }));
      alert(`Conexão com ${integration.provider.toUpperCase()} estabelecida com sucesso!`);
    }, 1500);
  };

  // Importar CSV (Simulado)
  const handleImport = () => {
    const confirm = window.confirm("Simular importação de 'lista_leads_outubro.csv'?");
    if (confirm) {
      setIsProcessing(true);
      setTimeout(() => {
        const newLeads: Lead[] = [
          {
            id: leads.length + 1,
            name: 'Roberto Importado',
            email: 'beto@gmail.com',
            phone: '5511977776666',
            company: 'Varejo Ltda',
            tags: ['Frio', 'Importado'],
            status: 'Novo',
            cadenceId: 'flow_padrao',
            currentStep: 0,
            enteredAt: new Date().toLocaleTimeString(),
            customData: { source: 'CSV Import' },
            logs: [{ id: Date.now(), type: 'system', message: 'Importado via CSV', timestamp: new Date().toLocaleTimeString() }]
          },
          {
            id: leads.length + 2,
            name: 'Julia VIP Importada',
            email: 'julia@bigcorp.com',
            phone: '5511955554444',
            company: 'Big Corp',
            tags: ['VIP', 'Importado'],
            status: 'Novo',
            cadenceId: 'flow_vip',
            currentStep: 0,
            enteredAt: new Date().toLocaleTimeString(),
            customData: { source: 'CSV Import' },
            logs: [{ id: Date.now(), type: 'system', message: 'Importado via CSV', timestamp: new Date().toLocaleTimeString() }]
          }
        ];
        setLeads([...newLeads, ...leads]);
        setIsProcessing(false);
        alert('2 Leads importados com sucesso! As etiquetas definiram os fluxos automaticamente.');
      }, 1500);
    }
  };

  // Exportar CSV
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome,Email,Telefone,Status,Etiquetas\n"
      + leads.map(l => `${l.name},${l.email},${l.phone},${l.status},"${l.tags.join(',')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_triene.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Robô de Envio
  const runAutomation = async () => {
    if (!integration.isConnected) {
      alert("Erro: API de integração não conectada. Verifique as configurações.");
      return;
    }

    setIsProcessing(true);
    // Simula processamento
    await new Promise(r => setTimeout(r, 1500));

    setLeads(prevLeads => prevLeads.map(lead => {
      // Regras de bloqueio
      if (lead.status === 'Respondeu' || lead.status === 'Perdido') return lead;

      // Achar o fluxo correto desse lead
      const flow = cadences.find(f => f.id === lead.cadenceId);
      if (!flow) return lead;

      // Achar o próximo passo
      const nextStepIndex = lead.currentStep + 1;
      const stepConfig = flow.steps.find(s => s.step === nextStepIndex);

      if (stepConfig) {
        // Enviar (Simulado)
        let logMsg = '';
        let logType: Log['type'] = 'system';
        const providerName = integration.provider === 'digisac' ? 'DigiSac' : 'API';
        
        if (stepConfig.channel === 'whatsapp') {
          logMsg = `🤖 Zap Enviado: ${stepConfig.title}`;
          logType = 'sent_wa';
        } else {
          logMsg = `📧 Email Enviado: ${stepConfig.subject}`;
          logType = 'sent_email';
        }

        const newLog: Log = {
          id: Date.now() + Math.random(),
          type: logType,
          message: logMsg,
          timestamp: 'Agora',
          provider: providerName
        };

        return {
          ...lead,
          status: 'Em Cadência',
          currentStep: nextStepIndex,
          logs: [...lead.logs, newLog]
        };
      }
      return lead;
    }));
    setIsProcessing(false);
  };

  // Renderizar Tela de Login
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Zap size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Triene System</h1>
          <p className="text-center text-slate-500 mb-6 text-sm">Faça login para acessar o painel</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@triene.com"
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Senha</label>
              <input 
                type="password" 
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                placeholder="admin"
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium">
              Entrar no Sistema
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-slate-400 bg-slate-100 p-2 rounded">
            <p>Admin: admin@triene.com / admin</p>
            <p>User: user@triene.com / user</p>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DO SISTEMA ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
             <Zap className="text-blue-400" size={24} />
             <h1 className="text-xl font-bold tracking-wider">TRIENE</h1>
          </div>
          <p className="text-xs text-slate-400">Automação & CRM</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'leads' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Users size={18} className="mr-3" />
            Leads & CRM
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'content' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <CalendarCheck size={18} className="mr-3" />
            Conteúdo 30 dias
          </button>
          
          {currentUser.role === 'admin' && (
            <>
              <button 
                onClick={() => setActiveTab('cadence')}
                className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'cadence' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <Settings size={18} className="mr-3" />
                Configurar Fluxos
              </button>
              
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <Server size={18} className="mr-3" />
                Integrações
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                 <User size={16} />
              </div>
              <div>
                 <p className="text-sm font-medium">{currentUser.name}</p>
                 <p className="text-xs text-slate-400 uppercase">{currentUser.role}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="flex items-center text-xs text-red-400 hover:text-red-300 w-full">
              <LogOut size={14} className="mr-2" /> Sair do Sistema
           </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm h-16">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            {activeTab === 'leads' && <><Database size={20}/> Gestão de Leads</>}
            {activeTab === 'content' && <><Image size={20}/> Calendário de Conteúdo</>}
            {activeTab === 'cadence' && <><Settings size={20}/> Editor de Fluxos</>}
            {activeTab === 'settings' && <><Server size={20}/> Integrações (API)</>}
          </h2>
          
          <div className="flex gap-2">
            {activeTab === 'leads' && (
              <>
                <button onClick={handleImport} className="flex items-center gap-2 bg-white text-slate-600 px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-sm">
                  <Upload size={14} /> Importar CSV
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 bg-white text-slate-600 px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-sm">
                  <Download size={14} /> Exportar
                </button>
                <button 
                  onClick={runAutomation}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded shadow-sm transition-all text-sm font-medium disabled:opacity-50"
                >
                  <Clock size={16} />
                  {isProcessing ? 'Enviando...' : 'Rodar Automação'}
                </button>
              </>
            )}
            
            {/* Status da API no Header */}
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold ${integration.isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <Wifi size={12} className="mr-1.5" />
                {integration.provider.toUpperCase()}: {integration.isConnected ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-hidden relative bg-slate-100 p-4">

          {activeTab === 'content' && (
            <div className="space-y-4 h-full overflow-auto pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="text-indigo-600" size={18} />
                    <p className="text-sm font-semibold text-slate-700">Etapa 1 — Esboço dos 30 dias</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">Perfil do Instagram</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        placeholder="@cliente"
                        value={instagramHandle}
                        onChange={e => setInstagramHandle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">CTA configurado</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        value={styleGuide.cta}
                        onChange={e => setStyleGuide(prev => ({ ...prev, cta: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Nicho</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        value={styleGuide.niche}
                        onChange={e => setStyleGuide(prev => ({ ...prev, niche: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Persona</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        value={styleGuide.persona}
                        onChange={e => setStyleGuide(prev => ({ ...prev, persona: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div>
                      <label className="text-xs text-slate-500">Cores predominantes</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        value={styleGuide.colors}
                        onChange={e => setStyleGuide(prev => ({ ...prev, colors: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Fontes</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        value={styleGuide.fonts}
                        onChange={e => setStyleGuide(prev => ({ ...prev, fonts: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Elementos visuais</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        value={styleGuide.elements}
                        onChange={e => setStyleGuide(prev => ({ ...prev, elements: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Estética do feed</label>
                      <input
                        className="w-full mt-1 rounded border border-slate-200 px-3 py-2 text-sm"
                        value={styleGuide.aesthetics}
                        onChange={e => setStyleGuide(prev => ({ ...prev, aesthetics: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 items-center">
                    <button
                      onClick={buildOutline}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Analisar perfil e gerar esboço
                    </button>
                    <button
                      onClick={approveOutline}
                      className={`px-4 py-2 rounded text-sm font-medium border ${outlineApproved ? 'bg-green-600 text-white border-green-600' : 'border-slate-300 text-slate-700 bg-white'}`}
                    >
                      Aprovar esboço
                    </button>
                    {analysisSummary && (
                      <span className="text-xs text-slate-500">{analysisSummary}</span>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                    <CalendarCheck size={18} className="text-blue-600" />
                    Cronograma geral
                  </div>
                  <p className="text-xs text-slate-500">Visualização rápida dos 30 dias aprovados.</p>
                  <div className="max-h-64 overflow-auto border border-slate-100 rounded">
                    {contentOutline.map(item => (
                      <div key={item.day} className="px-3 py-2 border-b border-slate-100 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-700">Dia {item.day}</span> — {item.theme}
                          <div className="text-[10px] text-slate-500">{item.imageType} · {item.objective}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] border ${item.imageStatus === 'Gerada' ? 'bg-green-50 text-green-700 border-green-200' : item.imageStatus === 'Editada' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{item.imageStatus}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={bulkGenerateImages} className="flex-1 text-sm bg-blue-600 text-white py-2 rounded">Gerar imagens em massa</button>
                    <button onClick={bulkGenerateDescriptions} className="flex-1 text-sm bg-slate-800 text-white py-2 rounded">Gerar descrições em massa</button>
                  </div>
                  <button onClick={exportCalendar} className="w-full text-sm border border-slate-200 py-2 rounded hover:bg-slate-50">Exportar calendário</button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Etapa 2 — Geração de Imagem</p>
                    <p className="text-xs text-slate-500">Cole um prompt manualmente ou deixe a IA gerar com base no estilo visual aprovado.</p>
                  </div>
                  <span className="text-[11px] px-3 py-1 rounded-full border bg-slate-50 text-slate-600">Designer da imagem é prioridade</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-auto pr-1">
                  {contentOutline.map(item => (
                    <div key={item.day} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-700">Dia {item.day}: {item.theme}</p>
                          <p className="text-[11px] text-slate-500">{item.imageType} · {item.objective}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full border ${item.imageStatus === 'Gerada' ? 'bg-green-50 text-green-700 border-green-200' : item.imageStatus === 'Editada' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200'}`}>{item.imageStatus}</span>
                      </div>
                      <div className="rounded-md border border-dashed border-slate-200 bg-white overflow-hidden">
                        {item.imagePreview ? (
                          <img src={item.imagePreview} alt={`Prévia do dia ${item.day}`} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 bg-slate-50">
                            Prévia da arte aparecerá aqui
                          </div>
                        )}
                      </div>
                      <textarea
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                        rows={3}
                        placeholder="Cole seu prompt manualmente"
                        value={item.prompt}
                        onChange={e => updateContentItem(item.day, { prompt: e.target.value })}
                      />
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => updateContentItem(item.day, { prompt: generateAutoPrompt(item) })}
                          className="flex-1 bg-white border border-slate-200 rounded py-1 hover:bg-slate-100"
                        >
                          Gerar prompt automático
                        </button>
                        <button
                          onClick={() => createImageForDay(item.day)}
                          className="flex-1 bg-indigo-600 text-white rounded py-1 hover:bg-indigo-700"
                        >
                          Gerar imagem agora
                        </button>
                      </div>
                      <button
                        onClick={() => editImageForDay(item.day)}
                        className="w-full text-xs border border-amber-200 text-amber-700 rounded py-1 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-1"
                      >
                        <Edit3 size={14} /> Editar imagem
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Etapa 3 — Descrição do Post</p>
                    <p className="text-xs text-slate-500">Explica a imagem, aplica CTA configurado e hashtags do nicho automaticamente.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-auto pr-1">
                  {contentOutline.map(item => (
                    <div key={item.day} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                      <p className="text-sm font-bold text-slate-700">Dia {item.day}: {item.theme}</p>
                      <textarea
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                        rows={3}
                        placeholder="Descrição focada em explicar a imagem"
                        value={item.description}
                        onChange={e => updateContentItem(item.day, { description: e.target.value })}
                      />
                      <div className="text-[11px] text-slate-500">CTA: {item.ctaUsed || styleGuide.cta}</div>
                      <div className="text-[11px] text-slate-500">Hashtags: {item.hashtags || '#aguardando'}</div>
                      <button
                        onClick={() => generateDescriptionForDay(item.day)}
                        className="w-full text-xs bg-slate-900 text-white rounded py-1 hover:bg-slate-800 flex items-center gap-1 justify-center"
                      >
                        <Tag size={14} /> Gerar descrição para esta imagem
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="flex gap-4 h-full">
              
              {/* LISTA DE LEADS */}
              <div className="flex-1 bg-white rounded-lg shadow border border-slate-200 flex flex-col">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Etiquetas (Fluxo)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Progresso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {leads.map(lead => (
                        <tr 
                          key={lead.id} 
                          onClick={() => setSelectedLead(lead)}
                          className={`cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                        >
                          <td className="p-3">
                            <div className="font-medium text-slate-900">{lead.name}</div>
                            <div className="text-xs text-slate-400">{lead.company}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 flex-wrap">
                              {lead.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] text-blue-500 mt-1">Fluxo: {lead.cadenceId === 'flow_vip' ? 'VIP' : 'Padrão'}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                              lead.status === 'Novo' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              lead.status === 'Respondeu' ? 'bg-green-100 text-green-700 border-green-200' :
                              'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                              {lead.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                             <span className="text-xs font-mono text-slate-500">Passo {lead.currentStep}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DETALHE DO LEAD (SIDE PANEL) */}
              <div className="w-[400px] bg-white rounded-lg shadow border border-slate-200 flex flex-col">
                {selectedLead ? (
                  <>
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{selectedLead.name}</h3>
                        <p className="text-xs text-slate-500">{selectedLead.email}</p>
                        <div className="flex gap-2 mt-2">
                           <button className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-600"><Phone size={10}/> WhatsApp</button>
                           <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-600"><Mail size={10}/> Email</button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-xs font-mono bg-slate-200 px-1 rounded">{selectedLead.id}</span>
                      </div>
                    </div>

                    {/* TABS DO PERFIL */}
                    <div className="flex border-b border-slate-200">
                      <button 
                        onClick={() => setLeadDetailTab('chat')}
                        className={`flex-1 py-2 text-sm font-medium ${leadDetailTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        Histórico & Chat
                      </button>
                      <button 
                         onClick={() => setLeadDetailTab('info')}
                         className={`flex-1 py-2 text-sm font-medium ${leadDetailTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        Dados & Tags
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto bg-slate-50/50">
                      
                      {leadDetailTab === 'chat' && (
                        <div className="p-4 space-y-4">
                            {selectedLead.logs.map(log => (
                                <div key={log.id} className={`flex flex-col ${log.type === 'reply' ? 'items-start' : log.type === 'system' ? 'items-center' : 'items-end'}`}>
                                    {log.type === 'system' && (
                                        <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-1 rounded-full mb-2">{log.message} - {log.timestamp}</span>
                                    )}
                                    {(log.type === 'sent_wa' || log.type === 'sent_email') && (
                                        <div className={`max-w-[90%] p-3 rounded-lg text-sm shadow-sm border ${log.type === 'sent_wa' ? 'bg-green-50 border-green-200 text-slate-800' : 'bg-blue-50 border-blue-200 text-slate-800'}`}>
                                            <div className="flex items-center gap-2 mb-1 text-xs opacity-70 font-bold uppercase">
                                                {log.type === 'sent_wa' ? <><Phone size={10}/> WhatsApp</> : <><Mail size={10}/> Email Marketing</>}
                                                {log.provider && <span className="ml-auto bg-white/50 px-1 rounded text-[9px]">{log.provider}</span>}
                                            </div>
                                            {log.message}
                                            <div className="text-[10px] text-right mt-1 opacity-50">{log.timestamp}</div>
                                        </div>
                                    )}
                                    {log.type === 'reply' && (
                                        <div className="max-w-[90%] bg-white p-3 rounded-lg text-sm shadow-sm border border-slate-200 text-slate-700">
                                            {log.message}
                                            <div className="text-[10px] mt-1 opacity-50">{log.timestamp}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                      )}

                      {leadDetailTab === 'info' && (
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Etiquetas (Lógica de Fluxo)</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedLead.tags.map(tag => (
                                        <span key={tag} className="flex items-center bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                            <Tag size={10} className="mr-1"/> {tag}
                                        </span>
                                    ))}
                                    <button className="text-xs text-slate-400 hover:text-blue-500 border border-dashed border-slate-300 rounded px-2 py-1">+ Add</button>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Dados Cadastrais</h4>
                                <div className="bg-white border border-slate-200 rounded p-3 space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Empresa:</span> <span>{selectedLead.company}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Telefone:</span> <span>{selectedLead.phone}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">CPF/CNPJ:</span> <span>{selectedLead.customData.cpf || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Cidade:</span> <span>{selectedLead.customData.city || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Origem:</span> <span>{selectedLead.customData.source || '-'}</span></div>
                                </div>
                            </div>
                        </div>
                      )}

                    </div>
                    {/* FOOTER ACTIONS */}
                    <div className="p-3 border-t border-slate-200 bg-white">
                        <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded text-sm font-medium transition">
                            Editar Dados
                        </button>
                    </div>
                  </>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <User size={40} className="mb-2 opacity-20" />
                    <p>Selecione um cliente para ver detalhes e histórico</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cadence' && (
            // --- TAB CONFIGURAÇÃO CADÊNCIA ---
            <div className="flex gap-6 h-full">
                {/* LISTA DE FLUXOS */}
                <div className="w-64 bg-white rounded-lg shadow border border-slate-200 p-4">
                    <h3 className="font-bold text-slate-700 mb-4">Seus Fluxos</h3>
                    <div className="space-y-2">
                        {cadences.map(cadence => (
                            <div 
                                key={cadence.id}
                                onClick={() => setActiveCadenceId(cadence.id)}
                                className={`p-3 rounded cursor-pointer border ${activeCadenceId === cadence.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                            >
                                <div className="font-bold text-sm">{cadence.name}</div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Tag size={10}/> Tag: {cadence.triggerTag}
                                </div>
                            </div>
                        ))}
                        <button className="w-full mt-2 border border-dashed border-slate-300 text-slate-400 py-2 rounded text-xs hover:bg-slate-50">+ Criar Novo Fluxo</button>
                    </div>
                </div>

                {/* EDITOR DO FLUXO */}
                <div className="flex-1 bg-white rounded-lg shadow border border-slate-200 p-6 overflow-auto">
                    {cadences.map(cadence => {
                        if (cadence.id !== activeCadenceId) return null;
                        return (
                            <div key={cadence.id}>
                                <div className="mb-6 border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-bold text-slate-800">{cadence.name}</h2>
                                    <p className="text-sm text-slate-500">Este fluxo é ativado automaticamente quando um lead recebe a etiqueta <span className="font-bold bg-slate-100 px-1 rounded">{cadence.triggerTag}</span></p>
                                </div>

                                <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:h-full before:w-0.5 before:bg-slate-200">
                                    {cadence.steps.map((step, idx) => (
                                        <div key={idx} className="relative pl-16">
                                            {/* Icone */}
                                            <div className={`absolute left-2 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${step.channel === 'whatsapp' ? 'bg-green-100 border-green-500 text-green-600' : 'bg-blue-100 border-blue-500 text-blue-600'}`}>
                                                {step.channel === 'whatsapp' ? <Phone size={14}/> : <Mail size={14}/>}
                                            </div>
                                            
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition">
                                                <div className="flex justify-between mb-2">
                                                    <div>
                                                        <span className="font-bold text-slate-700 text-sm block">Passo {step.step}: {step.title}</span>
                                                        <span className="text-xs text-slate-400">
                                                            {step.day === 0 ? 'Envio Imediato' : `Esperar ${step.day} dia(s)`}
                                                        </span>
                                                    </div>
                                                    <button className="text-slate-400 hover:text-blue-600"><Settings size={14}/></button>
                                                </div>
                                                
                                                {step.channel === 'email' && (
                                                    <div className="mb-2 text-sm text-slate-600">
                                                        <span className="font-bold">Assunto:</span> {step.subject}
                                                    </div>
                                                )}
                                                
                                                <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600 italic">
                                                    "{step.content}"
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="pl-16">
                                        <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                            <Plus size={16}/> Adicionar passo (Email ou WhatsApp)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
          )}

          {activeTab === 'settings' && (
            // --- TAB INTEGRAÇÕES (DIGISAC) ---
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Server className="text-blue-500"/>
                        Configuração de Integração
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">Conecte sua conta DigiSac ou Z-API para enviar mensagens reais.</p>
                </div>
                
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Provedor de Envio</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['digisac', 'z-api', 'evolution'] as IntegrationProvider[]).map((prov) => (
                                <div 
                                    key={prov}
                                    onClick={() => setIntegration(prev => ({...prev, provider: prov}))}
                                    className={`cursor-pointer p-3 border rounded-lg text-center transition ${integration.provider === prov ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="font-bold capitalize">{prov}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">API URL (Endpoint)</label>
                        <div className="flex items-center gap-2 border rounded p-2 bg-slate-50">
                            <Globe size={16} className="text-slate-400"/>
                            <input 
                                type="text" 
                                value={integration.apiUrl}
                                onChange={(e) => setIntegration(prev => ({...prev, apiUrl: e.target.value}))}
                                className="bg-transparent outline-none flex-1 text-sm"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Ex: https://api.digisac.io/v1</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Token de Acesso (Bearer)</label>
                        <div className="flex items-center gap-2 border rounded p-2 bg-slate-50">
                            <Lock size={16} className="text-slate-400"/>
                            <input 
                                type="password" 
                                value={integration.token}
                                onChange={(e) => setIntegration(prev => ({...prev, token: e.target.value}))}
                                className="bg-transparent outline-none flex-1 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 text-blue-800 p-4 rounded text-sm flex items-start gap-2">
                        <CheckCircle size={16} className="mt-0.5 shrink-0"/>
                        <div>
                            <strong>Instruções DigiSac:</strong> Acesse Configurações {'>'} API no seu painel DigiSac para gerar um novo token. Certifique-se de que o token tem permissão de "Envio de Mensagens".
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button 
                            onClick={testConnection}
                            disabled={isProcessing}
                            className={`px-6 py-2 rounded text-white font-medium transition ${isProcessing ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isProcessing ? 'Testando Conexão...' : 'Salvar e Testar Conexão'}
                        </button>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}