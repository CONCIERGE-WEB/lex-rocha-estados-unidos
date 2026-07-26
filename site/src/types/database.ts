export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "usuario" | "admin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          nome: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          nome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          nome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      casos: {
        Row: {
          id: string;
          user_id: string | null;
          nome: string;
          email: string;
          telefone: string | null;
          plataforma: string;
          descricao: string;
          data_ocorrencia: string | null;
          tentativas_anteriores: string | null;
          prints_urls: string[] | null;
          status: string;
          wizard_step: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          nome: string;
          email: string;
          telefone?: string | null;
          plataforma: string;
          descricao: string;
          data_ocorrencia?: string | null;
          tentativas_anteriores?: string | null;
          prints_urls?: string[] | null;
          status?: string;
          wizard_step?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          nome?: string;
          email?: string;
          telefone?: string | null;
          plataforma?: string;
          descricao?: string;
          data_ocorrencia?: string | null;
          tentativas_anteriores?: string | null;
          prints_urls?: string[] | null;
          status?: string;
          wizard_step?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      relatorios: {
        Row: {
          id: string;
          caso_id: string | null;
          conteudo_markdown: string;
          viabilidade: string | null;
          fundamentos: string[] | null;
          precedentes: string[] | null;
          pedidos_sugeridos: string[] | null;
          pdf_url: string | null;
          aprovado_por_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          caso_id?: string | null;
          conteudo_markdown: string;
          viabilidade?: string | null;
          fundamentos?: string[] | null;
          precedentes?: string[] | null;
          pedidos_sugeridos?: string[] | null;
          pdf_url?: string | null;
          aprovado_por_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          caso_id?: string | null;
          conteudo_markdown?: string;
          viabilidade?: string | null;
          fundamentos?: string[] | null;
          precedentes?: string[] | null;
          pedidos_sugeridos?: string[] | null;
          pdf_url?: string | null;
          aprovado_por_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      legacy_encaminhamento_audit: {
        Row: {
          id: string;
          audited_at: string;
          leads_count: number;
          escritorios_count: number;
          casos_legacy_count: number;
          relatorios_legacy_count: number;
          profiles_escritorio_count: number;
          action: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          audited_at?: string;
          leads_count?: number;
          escritorios_count?: number;
          casos_legacy_count?: number;
          relatorios_legacy_count?: number;
          profiles_escritorio_count?: number;
          action: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          audited_at?: string;
          leads_count?: number;
          escritorios_count?: number;
          casos_legacy_count?: number;
          relatorios_legacy_count?: number;
          profiles_escritorio_count?: number;
          action?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      relatorios_pesquisa: {
        Row: {
          id: string;
          numero_sequencial: number;
          nome_cliente: string | null;
          referencia_interna: string | null;
          area: string;
          fatos: string;
          precedentes: string | null;
          fundamentos: string[];
          valor_estimado: number | null;
          valor_estimado_min: number | null;
          valor_estimado_max: number | null;
          valor_cobrado: number | null;
          complexidade: string | null;
          urgente: boolean | null;
          motivo_urgencia: string | null;
          via_sugerida: string | null;
          prazo_prescricional_anos: number | null;
          observacoes: string | null;
          conteudo_gerado: string | null;
          pdf_url: string | null;
          status: string;
          modelo_ia: string | null;
          codigo_acompanhamento: string | null;
          previsao_entrega: string | null;
          fila_status: string;
          solicitacao_id: string | null;
          motivo_revisao: string | null;
          revisao_desde: string | null;
          revisao_alerta_em: string | null;
          revisao_acao: string | null;
          revisao_acao_em: string | null;
          revisao_acao_por: string | null;
          revisao_cliente_avisado_em: string | null;
          revisao_telegram_message_id: string | null;
          nfse_id: string | null;
          nfse_numero: string | null;
          nfse_status: string | null;
          nfse_pdf_url: string | null;
          nfse_emitida_em: string | null;
          nfse_desejada: boolean;
          nfse_tomador_documento: string | null;
          nfse_tomador_cmun: string | null;
          nfse_tomador_cep: string | null;
          nfse_tomador_logradouro: string | null;
          nfse_tomador_numero: string | null;
          nfse_tomador_bairro: string | null;
          nfse_tomador_complemento: string | null;
          satisfacao_cliente: string | null;
          satisfacao_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero_sequencial?: number;
          nome_cliente?: string | null;
          referencia_interna?: string | null;
          area: string;
          fatos: string;
          precedentes?: string | null;
          fundamentos?: string[];
          valor_estimado?: number | null;
          valor_estimado_min?: number | null;
          valor_estimado_max?: number | null;
          valor_cobrado?: number | null;
          complexidade?: string | null;
          urgente?: boolean | null;
          motivo_urgencia?: string | null;
          via_sugerida?: string | null;
          prazo_prescricional_anos?: number | null;
          observacoes?: string | null;
          conteudo_gerado?: string | null;
          pdf_url?: string | null;
          status?: string;
          modelo_ia?: string | null;
          codigo_acompanhamento?: string | null;
          previsao_entrega?: string | null;
          fila_status?: string;
          solicitacao_id?: string | null;
          motivo_revisao?: string | null;
          revisao_desde?: string | null;
          revisao_alerta_em?: string | null;
          revisao_acao?: string | null;
          revisao_acao_em?: string | null;
          revisao_acao_por?: string | null;
          revisao_cliente_avisado_em?: string | null;
          revisao_telegram_message_id?: string | null;
          nfse_id?: string | null;
          nfse_numero?: string | null;
          nfse_status?: string | null;
          nfse_pdf_url?: string | null;
          nfse_emitida_em?: string | null;
          nfse_desejada?: boolean;
          nfse_tomador_documento?: string | null;
          nfse_tomador_cmun?: string | null;
          nfse_tomador_cep?: string | null;
          nfse_tomador_logradouro?: string | null;
          nfse_tomador_numero?: string | null;
          nfse_tomador_bairro?: string | null;
          nfse_tomador_complemento?: string | null;
          satisfacao_cliente?: string | null;
          satisfacao_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero_sequencial?: number;
          nome_cliente?: string | null;
          referencia_interna?: string | null;
          area?: string;
          fatos?: string;
          precedentes?: string | null;
          fundamentos?: string[];
          valor_estimado?: number | null;
          valor_estimado_min?: number | null;
          valor_estimado_max?: number | null;
          valor_cobrado?: number | null;
          complexidade?: string | null;
          urgente?: boolean | null;
          motivo_urgencia?: string | null;
          via_sugerida?: string | null;
          prazo_prescricional_anos?: number | null;
          observacoes?: string | null;
          conteudo_gerado?: string | null;
          pdf_url?: string | null;
          status?: string;
          modelo_ia?: string | null;
          codigo_acompanhamento?: string | null;
          previsao_entrega?: string | null;
          fila_status?: string;
          solicitacao_id?: string | null;
          motivo_revisao?: string | null;
          revisao_desde?: string | null;
          revisao_alerta_em?: string | null;
          revisao_acao?: string | null;
          revisao_acao_em?: string | null;
          revisao_acao_por?: string | null;
          revisao_cliente_avisado_em?: string | null;
          revisao_telegram_message_id?: string | null;
          nfse_id?: string | null;
          nfse_numero?: string | null;
          nfse_status?: string | null;
          nfse_pdf_url?: string | null;
          nfse_emitida_em?: string | null;
          nfse_desejada?: boolean;
          nfse_tomador_documento?: string | null;
          nfse_tomador_cmun?: string | null;
          nfse_tomador_cep?: string | null;
          nfse_tomador_logradouro?: string | null;
          nfse_tomador_numero?: string | null;
          nfse_tomador_bairro?: string | null;
          nfse_tomador_complemento?: string | null;
          satisfacao_cliente?: string | null;
          satisfacao_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pagamentos_pesquisa: {
        Row: {
          id: string;
          relatorio_id: string;
          valor: number;
          forma_pagamento: string | null;
          status: string;
          stripe_session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          relatorio_id: string;
          valor: number;
          forma_pagamento?: string | null;
          status?: string;
          stripe_session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          relatorio_id?: string;
          valor?: number;
          forma_pagamento?: string | null;
          status?: string;
          stripe_session_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      stripe_webhook_events: {
        Row: {
          event_id: string;
          event_type: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          event_type: string;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      email_dispatch_queue: {
        Row: {
          id: string;
          kind: string;
          to_email: string;
          payload: Json;
          status: string;
          attempts: number;
          max_attempts: number;
          last_error: string | null;
          next_attempt_at: string;
          sent_at: string | null;
          dedupe_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kind: string;
          to_email: string;
          payload?: Json;
          status?: string;
          attempts?: number;
          max_attempts?: number;
          last_error?: string | null;
          next_attempt_at?: string;
          sent_at?: string | null;
          dedupe_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kind?: string;
          to_email?: string;
          payload?: Json;
          status?: string;
          attempts?: number;
          max_attempts?: number;
          last_error?: string | null;
          next_attempt_at?: string;
          sent_at?: string | null;
          dedupe_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      solicitacoes_pesquisa: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          area: string;
          descricao: string;
          status: string;
          codigo_acompanhamento: string | null;
          previsao_entrega: string | null;
          fila_status: string;
          faixa_relatorio: string | null;
          relatorio_id: string | null;
          nfse_desejada: boolean;
          nfse_tomador_documento: string | null;
          nfse_tomador_cmun: string | null;
          nfse_tomador_cep: string | null;
          nfse_tomador_logradouro: string | null;
          nfse_tomador_numero: string | null;
          nfse_tomador_bairro: string | null;
          nfse_tomador_complemento: string | null;
          satisfacao_cliente: string | null;
          satisfacao_em: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          area: string;
          descricao: string;
          status?: string;
          codigo_acompanhamento?: string | null;
          previsao_entrega?: string | null;
          fila_status?: string;
          faixa_relatorio?: string | null;
          relatorio_id?: string | null;
          nfse_desejada?: boolean;
          nfse_tomador_documento?: string | null;
          nfse_tomador_cmun?: string | null;
          nfse_tomador_cep?: string | null;
          nfse_tomador_logradouro?: string | null;
          nfse_tomador_numero?: string | null;
          nfse_tomador_bairro?: string | null;
          nfse_tomador_complemento?: string | null;
          satisfacao_cliente?: string | null;
          satisfacao_em?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          area?: string;
          descricao?: string;
          status?: string;
          codigo_acompanhamento?: string | null;
          previsao_entrega?: string | null;
          fila_status?: string;
          faixa_relatorio?: string | null;
          relatorio_id?: string | null;
          nfse_desejada?: boolean;
          nfse_tomador_documento?: string | null;
          nfse_tomador_cmun?: string | null;
          nfse_tomador_cep?: string | null;
          nfse_tomador_logradouro?: string | null;
          nfse_tomador_numero?: string | null;
          nfse_tomador_bairro?: string | null;
          nfse_tomador_complemento?: string | null;
          satisfacao_cliente?: string | null;
          satisfacao_em?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      log_ia: {
        Row: {
          id: string;
          relatorio_id: string | null;
          api_usada: string;
          modelo: string | null;
          tokens_entrada: number | null;
          tokens_saida: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          relatorio_id?: string | null;
          api_usada: string;
          modelo?: string | null;
          tokens_entrada?: number | null;
          tokens_saida?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          relatorio_id?: string | null;
          api_usada?: string;
          modelo?: string | null;
          tokens_entrada?: number | null;
          tokens_saida?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      consent_log: {
        Row: {
          id: string;
          session_id: string;
          ip_hash: string | null;
          user_agent_hash: string | null;
          versao_politica: string;
          cookies_necessarios: boolean;
          cookies_analiticos: boolean;
          data_consentimento: string;
          data_revogacao: string | null;
          origem: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          ip_hash?: string | null;
          user_agent_hash?: string | null;
          versao_politica: string;
          cookies_necessarios?: boolean;
          cookies_analiticos?: boolean;
          data_consentimento?: string;
          data_revogacao?: string | null;
          origem?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          ip_hash?: string | null;
          user_agent_hash?: string | null;
          versao_politica?: string;
          cookies_necessarios?: boolean;
          cookies_analiticos?: boolean;
          data_consentimento?: string;
          data_revogacao?: string | null;
          origem?: string;
        };
        Relationships: [];
      };
      access_log: {
        Row: {
          id: string;
          ip_hash: string;
          user_agent_hash: string | null;
          rota: string | null;
          metodo: string | null;
          status_code: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_hash: string;
          user_agent_hash?: string | null;
          rota?: string | null;
          metodo?: string | null;
          status_code?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ip_hash?: string;
          user_agent_hash?: string | null;
          rota?: string | null;
          metodo?: string | null;
          status_code?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      direitos_lgpd: {
        Row: {
          id: string;
          tipo: string;
          email_contato: string | null;
          descricao: string | null;
          status: string;
          prazo_resposta: string | null;
          data_resposta: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tipo: string;
          email_contato?: string | null;
          descricao?: string | null;
          status?: string;
          prazo_resposta?: string | null;
          data_resposta?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tipo?: string;
          email_contato?: string | null;
          descricao?: string | null;
          status?: string;
          prazo_resposta?: string | null;
          data_resposta?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      parceiros: {
        Row: {
          id: string;
          nome: string;
          documento: string | null;
          tipo_pessoa: string;
          funcao: string | null;
          chave_pix: string | null;
          comissao_base: number;
          permite_substituto: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          documento?: string | null;
          tipo_pessoa: string;
          funcao?: string | null;
          chave_pix?: string | null;
          comissao_base?: number;
          permite_substituto?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          documento?: string | null;
          tipo_pessoa?: string;
          funcao?: string | null;
          chave_pix?: string | null;
          comissao_base?: number;
          permite_substituto?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      parceiro_relatorios: {
        Row: {
          id: string;
          parceiro_id: string;
          relatorio_id: string;
          funcao_no_relatorio: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          parceiro_id: string;
          relatorio_id: string;
          funcao_no_relatorio?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          parceiro_id?: string;
          relatorio_id?: string;
          funcao_no_relatorio?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      parceiro_feedback: {
        Row: {
          id: string;
          relatorio_id: string;
          parceiro_id: string;
          nota: number;
          comentario: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          relatorio_id: string;
          parceiro_id: string;
          nota: number;
          comentario?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          relatorio_id?: string;
          parceiro_id?: string;
          nota?: number;
          comentario?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      parceiro_ocorrencias: {
        Row: {
          id: string;
          parceiro_id: string;
          relatorio_id: string | null;
          tipo: string;
          descricao: string;
          severidade: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          parceiro_id: string;
          relatorio_id?: string | null;
          tipo: string;
          descricao: string;
          severidade: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          parceiro_id?: string;
          relatorio_id?: string | null;
          tipo?: string;
          descricao?: string;
          severidade?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      config_parceiro: {
        Row: {
          chave: string;
          valor: Json;
          updated_at: string;
        };
        Insert: {
          chave: string;
          valor: Json;
          updated_at?: string;
        };
        Update: {
          chave?: string;
          valor?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      datajud_ingestao_fila: {
        Row: {
          id: string;
          tribunal: string;
          categoria_slug: string;
          parametros_consulta: Json;
          status: string;
          tentativas: number;
          ultimo_erro: string | null;
          agendado_para: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tribunal: string;
          categoria_slug: string;
          parametros_consulta?: Json;
          status?: string;
          tentativas?: number;
          ultimo_erro?: string | null;
          agendado_para?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tribunal?: string;
          categoria_slug?: string;
          parametros_consulta?: Json;
          status?: string;
          tentativas?: number;
          ultimo_erro?: string | null;
          agendado_para?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      acervo_vetorial: {
        Row: {
          id: string;
          texto_hash: string;
          origem: string;
          origem_ref: string;
          categoria_slug: string;
          uf: string | null;
          tribunal: string | null;
          resultado_sintetico: string | null;
          texto_base: string;
          fonte_publica_url: string | null;
          embedding: number[] | null;
          modelo_embedding: string;
          embedded_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          texto_hash: string;
          origem: string;
          origem_ref: string;
          categoria_slug: string;
          uf?: string | null;
          tribunal?: string | null;
          resultado_sintetico?: string | null;
          texto_base: string;
          fonte_publica_url?: string | null;
          embedding?: number[] | null;
          modelo_embedding?: string;
          embedded_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          texto_hash?: string;
          origem?: string;
          origem_ref?: string;
          categoria_slug?: string;
          uf?: string | null;
          tribunal?: string | null;
          resultado_sintetico?: string | null;
          texto_base?: string;
          fonte_publica_url?: string | null;
          embedding?: number[] | null;
          modelo_embedding?: string;
          embedded_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      datajud_cache_processos: {
        Row: {
          id: string;
          numero_processo_hash: string;
          tribunal: string;
          categoria_slug: string;
          classe: string | null;
          assunto: string | null;
          orgao_julgador: string | null;
          data_ajuizamento: string | null;
          data_ultima_movimentacao: string | null;
          resultado_sintetico: string;
          fonte: string;
          coletado_em: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero_processo_hash: string;
          tribunal: string;
          categoria_slug: string;
          classe?: string | null;
          assunto?: string | null;
          orgao_julgador?: string | null;
          data_ajuizamento?: string | null;
          data_ultima_movimentacao?: string | null;
          resultado_sintetico?: string;
          fonte?: string;
          coletado_em?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero_processo_hash?: string;
          tribunal?: string;
          categoria_slug?: string;
          classe?: string | null;
          assunto?: string | null;
          orgao_julgador?: string | null;
          data_ajuizamento?: string | null;
          data_ultima_movimentacao?: string | null;
          resultado_sintetico?: string;
          fonte?: string;
          coletado_em?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      estatisticas_categoria: {
        Row: {
          id: string;
          categoria_slug: string;
          tribunal: string;
          periodo_referencia: string;
          total_processos_amostra: number;
          distribuicao_resultados: Json;
          tempo_medio_tramitacao_dias: number | null;
          amostra_representativa: boolean;
          gerado_em: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_slug: string;
          tribunal?: string;
          periodo_referencia: string;
          total_processos_amostra?: number;
          distribuicao_resultados?: Json;
          tempo_medio_tramitacao_dias?: number | null;
          amostra_representativa?: boolean;
          gerado_em?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria_slug?: string;
          tribunal?: string;
          periodo_referencia?: string;
          total_processos_amostra?: number;
          distribuicao_resultados?: Json;
          tempo_medio_tramitacao_dias?: number | null;
          amostra_representativa?: boolean;
          gerado_em?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      datajud_rate_limit_controle: {
        Row: {
          id: string;
          janela_inicio: string;
          requisicoes_feitas: number;
          limite_configurado: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          janela_inicio: string;
          requisicoes_feitas?: number;
          limite_configurado: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          janela_inicio?: string;
          requisicoes_feitas?: number;
          limite_configurado?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cache_freshness: {
        Row: {
          id: string;
          categoria_slug: string;
          tribunal: string;
          ultima_sincronizacao_sucesso: string | null;
          proxima_sincronizacao_prevista: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_slug: string;
          tribunal?: string;
          ultima_sincronizacao_sucesso?: string | null;
          proxima_sincronizacao_prevista?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria_slug?: string;
          tribunal?: string;
          ultima_sincronizacao_sucesso?: string | null;
          proxima_sincronizacao_prevista?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      advogados: {
        Row: {
          id: string;
          nome: string;
          email_conta: string;
          oab: string | null;
          subtitulo: string | null;
          areas: string[];
          regioes: string[];
          contato_whatsapp: string | null;
          contato_email: string | null;
          site_url: string | null;
          plano: string;
          perfil_publicado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email_conta: string;
          oab?: string | null;
          subtitulo?: string | null;
          areas?: string[];
          regioes?: string[];
          contato_whatsapp?: string | null;
          contato_email?: string | null;
          site_url?: string | null;
          plano?: string;
          perfil_publicado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email_conta?: string;
          oab?: string | null;
          subtitulo?: string | null;
          areas?: string[];
          regioes?: string[];
          contato_whatsapp?: string | null;
          contato_email?: string | null;
          site_url?: string | null;
          plano?: string;
          perfil_publicado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assinaturas_advogado: {
        Row: {
          id: string;
          advogado_id: string;
          plano: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          periodo_fim: string | null;
          cancelar_no_fim_periodo: boolean;
          organizacao_id: string | null;
          assentos: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          advogado_id: string;
          plano: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          periodo_fim?: string | null;
          cancelar_no_fim_periodo?: boolean;
          organizacao_id?: string | null;
          assentos?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          advogado_id?: string;
          plano?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          periodo_fim?: string | null;
          cancelar_no_fim_periodo?: boolean;
          organizacao_id?: string | null;
          assentos?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assinaturas_advogado_advogado_id_fkey";
            columns: ["advogado_id"];
            referencedRelation: "advogados";
            referencedColumns: ["id"];
          },
        ];
      };
      organizacao_advogados: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          email_billing: string;
          admin_advogado_id: string | null;
          assentos: number;
          plano: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string | null;
          email_billing: string;
          admin_advogado_id?: string | null;
          assentos?: number;
          plano?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cnpj?: string | null;
          email_billing?: string;
          admin_advogado_id?: string | null;
          assentos?: number;
          plano?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizacao_membros: {
        Row: {
          id: string;
          organizacao_id: string;
          advogado_id: string | null;
          email_convite: string;
          papel: string;
          status: string;
          portfolio_habilitado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizacao_id: string;
          advogado_id?: string | null;
          email_convite: string;
          papel?: string;
          status?: string;
          portfolio_habilitado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizacao_id?: string;
          advogado_id?: string | null;
          email_convite?: string;
          papel?: string;
          status?: string;
          portfolio_habilitado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      usuarios_consumidor: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          consentimento_lgpd_em: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          consentimento_lgpd_em?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          consentimento_lgpd_em?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clientes_advogado: {
        Row: {
          id: string;
          advogado_id: string;
          organizacao_id: string | null;
          nome: string;
          email: string | null;
          telefone: string | null;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          advogado_id: string;
          organizacao_id?: string | null;
          nome: string;
          email?: string | null;
          telefone?: string | null;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          advogado_id?: string;
          organizacao_id?: string | null;
          nome?: string;
          email?: string | null;
          telefone?: string | null;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolio_advogado: {
        Row: {
          id: string;
          advogado_id: string;
          slug: string | null;
          oab_numero: string | null;
          oab_uf: string | null;
          biografia_curta: string | null;
          formacao: string | null;
          anos_atuacao: number | null;
          cidade_atuacao: string | null;
          uf_atuacao: string | null;
          status: string;
          motivo_rejeicao: string | null;
          enviado_em: string | null;
          publicado_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          advogado_id: string;
          slug?: string | null;
          oab_numero?: string | null;
          oab_uf?: string | null;
          biografia_curta?: string | null;
          formacao?: string | null;
          anos_atuacao?: number | null;
          cidade_atuacao?: string | null;
          uf_atuacao?: string | null;
          status?: string;
          motivo_rejeicao?: string | null;
          enviado_em?: string | null;
          publicado_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          advogado_id?: string;
          slug?: string | null;
          oab_numero?: string | null;
          oab_uf?: string | null;
          biografia_curta?: string | null;
          formacao?: string | null;
          anos_atuacao?: number | null;
          cidade_atuacao?: string | null;
          uf_atuacao?: string | null;
          status?: string;
          motivo_rejeicao?: string | null;
          enviado_em?: string | null;
          publicado_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_advogado_advogado_id_fkey";
            columns: ["advogado_id"];
            referencedRelation: "advogados";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_verificacao_log: {
        Row: {
          id: string;
          advogado_id: string;
          portfolio_id: string;
          revisor_email: string;
          resultado: string;
          observacao: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          advogado_id: string;
          portfolio_id: string;
          revisor_email: string;
          resultado: string;
          observacao?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          advogado_id?: string;
          portfolio_id?: string;
          revisor_email?: string;
          resultado?: string;
          observacao?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_verificacao_log_advogado_id_fkey";
            columns: ["advogado_id"];
            referencedRelation: "advogados";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_verificacao_log_portfolio_id_fkey";
            columns: ["portfolio_id"];
            referencedRelation: "portfolio_advogado";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_slug_redirect: {
        Row: {
          slug_antigo: string;
          portfolio_id: string;
          advogado_id: string;
          created_at: string;
        };
        Insert: {
          slug_antigo: string;
          portfolio_id: string;
          advogado_id: string;
          created_at?: string;
        };
        Update: {
          slug_antigo?: string;
          portfolio_id?: string;
          advogado_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_slug_redirect_portfolio_id_fkey";
            columns: ["portfolio_id"];
            referencedRelation: "portfolio_advogado";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_slug_redirect_advogado_id_fkey";
            columns: ["advogado_id"];
            referencedRelation: "advogados";
            referencedColumns: ["id"];
          },
        ];
      };
      motor_pedidos_relatorio: {
        Row: {
          id: string;
          perfil: string;
          plano: string;
          categoria_slug: string;
          pagamento_ref: string | null;
          solicitacao_id: string | null;
          email_contato: string;
          dados_formulario: Record<string, unknown>;
          status: string;
          caminho_saida: string | null;
          ultimo_erro: string | null;
          processado_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          perfil: string;
          plano: string;
          categoria_slug: string;
          pagamento_ref?: string | null;
          solicitacao_id?: string | null;
          email_contato: string;
          dados_formulario?: Record<string, unknown>;
          status?: string;
          caminho_saida?: string | null;
          ultimo_erro?: string | null;
          processado_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          perfil?: string;
          plano?: string;
          categoria_slug?: string;
          pagamento_ref?: string | null;
          solicitacao_id?: string | null;
          email_contato?: string;
          dados_formulario?: Record<string, unknown>;
          status?: string;
          caminho_saida?: string | null;
          ultimo_erro?: string | null;
          processado_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assinaturas_pagina_advogado: {
        Row: {
          id: string;
          advogado_id: string;
          status: string;
          periodicidade: string;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          confirmado_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          advogado_id: string;
          status?: string;
          periodicidade?: string;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          confirmado_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          advogado_id?: string;
          status?: string;
          periodicidade?: string;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          confirmado_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assinaturas_pagina_advogado_advogado_id_fkey";
            columns: ["advogado_id"];
            referencedRelation: "advogados";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
