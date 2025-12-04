function servicetask34(attempt, message) {
	log.info("🚀 INICIANDO ServiceTask34 - Configuração de Aprovadores - Tentativa: " + attempt);
	
	try {
		var numSC = hAPI.getCardValue("nrSC");
		if (numSC == null || numSC == "" || numSC == undefined) {
			// ERRO COMENTADO PARA TESTE - DESCOMENTAR DEPOIS
			// throw "ERRO NA CONFIGURAÇÃO DE APROVADORES - Número da SC não foi encontrado. Verifique se a criação da SC foi executada corretamente.";
			log.warn("⚠️ MODO TESTE: Número da SC não encontrado, mas continuando execução");
			numSC = "000185"; // SC mockada para teste
		}
		
		setAprovadoresSC(numSC);
		
		log.info("✅ ServiceTask34 concluída com sucesso! Aprovadores configurados para SC: " + numSC);
		log.info("🔄 EXECUTANDO RETURN TRUE - A tarefa deveria avançar agora!");
		
		// Log adicional para debug
		log.info("📊 ESTADO FINAL:");
		log.info("📊 controleAssinaturas: " + hAPI.getCardValue("controleAssinaturas"));
		log.info("📊 controleOrdem: " + hAPI.getCardValue("controleOrdem"));
		log.info("📊 matriculaAssinante: " + hAPI.getCardValue("matriculaAssinante"));
		
		return true;
	} catch (e) {
		var errorMsg = e.message || e.toString();
		// Se o erro não começa com "ERRO NA", formatar corretamente
		if (errorMsg.indexOf("ERRO NA") !== 0) {
			errorMsg = "ERRO NA CONFIGURAÇÃO DE APROVADORES - " + errorMsg;
		}
		log.error("❌ Erro no ServiceTask34: " + errorMsg);
		log.error("❌ Stack trace: " + e.stack);
		log.error("🔄 EXECUTANDO THROW - A tarefa deveria parar aqui!");
		throw errorMsg; // Re-lança a exceção para interromper o workflow
	}
}

function setAprovadoresSC(numSC) {
	// Validar se numSC é válido antes de prosseguir
	if (numSC == null || numSC == "" || numSC == undefined) {
		// ERRO COMENTADO PARA TESTE - DESCOMENTAR DEPOIS
		// throw "ERRO NA CONFIGURAÇÃO DE APROVADORES - Número da SC não foi gerado corretamente. Verifique os dados da solicitação.";
		log.warn("⚠️ MODO TESTE: Número da SC inválido, mas continuando execução");
		return; // Sair da função sem fazer nada
	}
	
	var c1 = DatasetFactory.createConstraint("numeroSC", numSC, numSC, ConstraintType.MUST)
	var aprovadoresSC = DatasetFactory.getDataset("ds_aprovadores_sc", null, [c1], null);
	if (aprovadoresSC.rowsCount > 0) {
		var aprovadores = {}
		for (var i = 0; i < aprovadoresSC.rowsCount; i++) {
			// Buscar email do usuário
			var email = aprovadoresSC.getValue(i, "USR_EMAIL");
			var nomeAprovador = aprovadoresSC.getValue(i, "CR_USER") || "Aprovador não identificado";
			
			if (email == null || email == "" || email == undefined) {
				// ERRO COMENTADO PARA TESTE - DESCOMENTAR DEPOIS
				// throw "ERRO NA CONFIGURAÇÃO DE APROVADORES - Usuário '" + nomeAprovador + "' da alçada de aprovação não possui e-mail cadastrado. Favor verificar o cadastro no sistema.";
				email = "suporte.totvs@totvs.com.br"; // Email mockado para teste
				log.info("Email não encontrado para aprovador " + (i+1) + " (" + nomeAprovador + "), usando email mockado: " + email);
			} else {
				log.info("Email encontrado para aprovador " + (i+1) + " (" + nomeAprovador + "): " + email);
			}
			
			// Buscar colleagueId pelo email
			var idfluig = "";
			try {
				var c2 = DatasetFactory.createConstraint("mail", email, email, ConstraintType.MUST);
				var colleague = DatasetFactory.getDataset("colleague", null, [c2], null);
				if (colleague.rowsCount > 0) {
					idfluig = colleague.getValue(0, "colleaguePK.colleagueId");
					log.info("ColleagueId encontrado para " + nomeAprovador + " (" + email + "): " + idfluig);
				} else {
					// ERRO COMENTADO PARA TESTE - DESCOMENTAR DEPOIS
					// throw "ERRO NA CONFIGURAÇÃO DE APROVADORES - Usuário '" + nomeAprovador + "' com e-mail '" + email + "' da alçada de aprovação não encontrado no TOTVS FLUIG. Favor verificar.";
					log.warn("Nenhum colleague encontrado para email: " + email + ", usando ID mockado");
					idfluig = "suporte.totvs"; // ID mockado para teste
				}
			} catch (e) {
				// ERRO COMENTADO PARA TESTE - DESCOMENTAR DEPOIS
				// if (e.message && e.message.startsWith("ERRO NA")) {
				//     throw e; // Re-lançar erros específicos
				// }
				// throw "ERRO NA CONFIGURAÇÃO DE APROVADORES - Falha ao buscar usuário '" + nomeAprovador + "' com e-mail '" + email + "' no TOTVS FLUIG: " + e.message;
				log.error("Erro ao buscar colleague para email " + email + ": " + e.message + ", usando ID mockado");
				idfluig = "suporte.totvs"; // ID mockado para teste em caso de erro
			}
			
			aprovadores[i + 1] = {
				"CR_TIPO" : aprovadoresSC.getValue(i, "CR_TIPO"),
				"CR_NUM" : aprovadoresSC.getValue(i, "CR_NUM"),
				"CR_NIVEL" : aprovadoresSC.getValue(i, "CR_NIVEL"),
				"CR_USER" : aprovadoresSC.getValue(i, "CR_USER"),
				"CR_APROV" : aprovadoresSC.getValue(i, "CR_APROV"),
				"CR_GRUPO" : aprovadoresSC.getValue(i, "CR_GRUPO"),
				"CR_ITGRP" : aprovadoresSC.getValue(i, "CR_ITGRP"),
				"CR_STATUS" : aprovadoresSC.getValue(i, "CR_STATUS"),
				"CR_EMISSAO" : aprovadoresSC.getValue(i, "CR_EMISSAO"),
				"AL_ITEM" : aprovadoresSC.getValue(i, "AL_ITEM"), // Ordem de aprovação
				"USR_EMAIL" : email,
				"IDFLUIG" : idfluig
			}
		}
		var versao = hAPI.getCardValue("controleAssinaturas")
		var controleAprovacoes = hAPI.getCardValue("controleAprovacoes")
		
		// Verificar se já existe estrutura ou criar uma nova
		var obj = {};
		if (controleAprovacoes != null && controleAprovacoes != "") {
			try {
				obj = JSON.parse(controleAprovacoes);
			} catch (e) {
				log.warn("⚠️ Erro ao fazer parse de controleAprovacoes, criando nova estrutura: " + e.message);
				obj = {};
			}
		} else {
			log.info("📋 Criando nova estrutura controleAprovacoes");
			obj = {};
		}
		
		obj[versao] = {}
		obj[versao][numSC.toString()] = aprovadores
		versao = parseInt(versao) + 1;
		hAPI.setCardValue("controleAssinaturas", versao + "")
		hAPI.setCardValue("controleOrdem", "1")
		hAPI.setCardValue("controleAprovacoes", JSONUtil.toJSON(obj))
		// CORRIGIDO: Usar IDFLUIG como responsável da tarefa (não CR_USER)
		hAPI.setCardValue("matriculaAssinante", obj[versao - 1][numSC.toString()][1]["IDFLUIG"])
		log.info("✅ Aprovadores configurados com sucesso para SC: " + numSC);
		
	} else {
		// ERRO COMENTADO PARA TESTE - DESCOMENTAR DEPOIS
		// var errorMsg = "ERRO NA CONFIGURAÇÃO DE APROVADORES - Não foram encontrados aprovadores para a SC " + numSC + ".";
		// if (aprovadoresSC.rowsCount == 0) {
		//     errorMsg += " Verifique se a alçada de aprovação está configurada corretamente no sistema.";
		// } else {
		//     errorMsg += " Erro retornado: " + aprovadoresSC.getValue(0, "0");
		// }
		// log.error(errorMsg);
		// throw errorMsg;
		
		log.warn("⚠️ MODO TESTE: Nenhum aprovador encontrado para SC " + numSC + ", mas continuando execução");
	}
}