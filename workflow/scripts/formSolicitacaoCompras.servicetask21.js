function servicetask21(attempt, message) {
	verificarAprovacao()

	return true
}

function verificarAprovacao() {
	var versao = parseInt(hAPI.getCardValue("controleAssinaturas"))
	var aprovador = parseInt(hAPI.getCardValue("controleOrdem"))
	var aprovacoes = hAPI.getCardValue("controleAprovacoes")
	
	// Verificação de segurança no parsing
	var obj = {};
	if (aprovacoes == null || aprovacoes == "") {
		var errorMsg = "ERRO NA APROVAÇÃO - Estrutura de aprovadores não foi inicializada. Verifique se a configuração de alçada foi executada corretamente.";
		log.error(errorMsg);
		throw errorMsg;
	}
	
	try {
		obj = JSON.parse(aprovacoes);
	} catch (e) {
		var errorMsg = "ERRO NA APROVAÇÃO - Falha ao processar estrutura de aprovadores. Dados corrompidos: " + e.message;
		log.error("❌ Erro ao fazer parse de controleAprovacoes: " + e.message);
		log.error("❌ Conteúdo: " + aprovacoes);
		throw errorMsg;
	}
	
	var numeroSC = hAPI.getCardValue("nrSC")
	// Remover zeros à esquerda para busca no objeto (JS remove automaticamente zeros em chaves de objeto)
	var numeroSCBusca = parseInt(numeroSC, 10).toString(); // Converte para número e volta para string sem zeros
	log.info("🔍 DEBUG: numeroSC original = '" + numeroSC + "', numeroSCBusca = '" + numeroSCBusca + "'");
	var matriculaAssinante = hAPI.getCardValue("matriculaAssinante")

	var aprovacao = hAPI.getCardValue("hidden_decisao")

	var aprovado = "aprovado"
	var horario = hAPI.getCardValue("dataHoraAprov")
	var comentario = hAPI.getCardValue("justificativaAprov")

	log.info("servicetask21 -- verificarAprovacao()")
	log.info("servicetask21 -- versao " + versao)
	log.info("servicetask21 -- numeroSC " + numeroSC)
	log.info("servicetask21 -- numeroSCBusca " + numeroSCBusca)
	log.info("servicetask21 -- matriculaAssinante " + matriculaAssinante)
	log.info("servicetask21 -- aprovacoes " + aprovacoes)
	log.info("servicetask21 -- aprovacoes OBJ")
	log.dir(obj)
	log.info("servicetask21 -- verificando estrutura: obj[" + (versao-1) + "]")
	log.dir(obj[versao - 1])
	log.info("servicetask21 -- verificando estrutura: obj[" + (versao-1) + "][" + numeroSCBusca + "]")
	log.dir(obj[versao - 1] ? obj[versao - 1][numeroSCBusca] : "versao-1 undefined")
	
	// Verificação de segurança antes de usar Object.keys
	if (!obj[versao - 1] || !obj[versao - 1][numeroSCBusca]) {
		var errorMsg = "ERRO NA APROVAÇÃO - Estrutura de aprovadores não encontrada para SC " + numeroSC + ".";
		if (!obj[versao - 1]) {
			errorMsg += " Versão de aprovação inválida: " + (versao - 1) + ".";
		} else {
			errorMsg += " SC não encontrada na estrutura de aprovação.";
			errorMsg += " SCs disponíveis: " + Object.keys(obj[versao - 1]).join(", ") + ".";
		}
		errorMsg += " Verifique se a configuração de alçada foi executada corretamente.";
		log.error(errorMsg);
		throw errorMsg;
	}
	
	var len = Object.keys(obj[versao - 1][numeroSCBusca]).length
	log.info("servicetask21 -- len " + len);
	log.info("servicetask21 -- aprovacao recebida: " + aprovacao);

	// === INTEGRAÇÃO COM PROTHEUS - ATUALIZAR ALÇADA ===
	// Encontrar os dados do aprovador atual para enviar ao Protheus
	var aprovadorAtual = null;
	for (var i = 1; i <= len; i++) {
		if (obj[versao - 1][numeroSCBusca][i]["IDFLUIG"] == matriculaAssinante &&
			parseInt(obj[versao - 1][numeroSCBusca][i]["AL_ITEM"]) == aprovador
		) {
			aprovadorAtual = obj[versao - 1][numeroSCBusca][i];
			break;
		}
	}
	
	if (aprovadorAtual != null) {
		var sucessoIntegracao = atualizaAlcadaProtheus(aprovadorAtual, aprovacao, comentario, numeroSC);
		if (!sucessoIntegracao) {
			throw "ERRO NA INTEGRAÇÃO - Falha ao atualizar alçada de aprovação no sistema Protheus para SC " + numeroSC + ". Verifique a conectividade e tente novamente.";
		}
	} else {
		log.warn("⚠️ Aprovador atual não encontrado na estrutura, continuando sem integração");
	}
	// === FIM INTEGRAÇÃO ===

	if (aprovacao == "APROVAR") {
		for (var i = 1; i <= len; i++) {
			log.info("📋 Verificando aprovador " + i + " - IDFLUIG: " + obj[versao - 1][numeroSCBusca][i]["IDFLUIG"] + " vs " + matriculaAssinante);
			if (obj[versao - 1][numeroSCBusca][i]["IDFLUIG"] == matriculaAssinante &&
				parseInt(obj[versao - 1][numeroSCBusca][i]["AL_ITEM"]) == aprovador
			) {
				// Marcar como liberado (status 03 = aprovado)
				obj[versao - 1][numeroSCBusca][i]["CR_STATUS"] = "03";
				// Salvar a justificativa/comentário do aprovador
				obj[versao - 1][numeroSCBusca][i]["CR_OBS"] = comentario || "Aprovado";
				// Salvar a data/hora atual da aprovação
				var agora = new Date();
				var horas = agora.getHours() < 10 ? "0" + agora.getHours() : agora.getHours();
				var minutos = agora.getMinutes() < 10 ? "0" + agora.getMinutes() : agora.getMinutes();
				var segundos = agora.getSeconds() < 10 ? "0" + agora.getSeconds() : agora.getSeconds();
				var dia = agora.getDate() < 10 ? "0" + agora.getDate() : agora.getDate();
				var mes = (agora.getMonth() + 1) < 10 ? "0" + (agora.getMonth() + 1) : (agora.getMonth() + 1);
				var ano = agora.getFullYear();
				var dataAtual = horas + ":" + minutos + ":" + segundos + " " + dia + "/" + mes + "/" + ano;
				obj[versao - 1][numeroSCBusca][i]["CR_DATA_ATUAL"] = dataAtual;
				log.info("✅ Aprovador " + i + " marcado como LIBERADO (CR_STATUS=03) com justificativa: " + (comentario || "Aprovado") + " em " + dataAtual);
				if (i != len) {
					hAPI.setCardValue("matriculaAssinante", obj[versao - 1][numeroSCBusca][i+1]["IDFLUIG"])
					log.info("👤 Próximo responsável: " + obj[versao - 1][numeroSCBusca][i+1]["IDFLUIG"]);
				}
				break;
			}
		}
	} else if (aprovacao == "REPROVAR") {
		for (var i = 1; i <= len; i++) {
			if (obj[versao - 1][numeroSCBusca][i]["IDFLUIG"] == matriculaAssinante &&
				parseInt(obj[versao - 1][numeroSCBusca][i]["AL_ITEM"]) == aprovador
			) {
				// Marcar como rejeitado (status 06 = reprovado)
				obj[versao - 1][numeroSCBusca][i]["CR_STATUS"] = "06";
				// Salvar a justificativa/comentário do aprovador
				obj[versao - 1][numeroSCBusca][i]["CR_OBS"] = comentario || "Rejeitado";
				// Salvar a data/hora atual da reprovação
				var agora = new Date();
				var horas = agora.getHours() < 10 ? "0" + agora.getHours() : agora.getHours();
				var minutos = agora.getMinutes() < 10 ? "0" + agora.getMinutes() : agora.getMinutes();
				var segundos = agora.getSeconds() < 10 ? "0" + agora.getSeconds() : agora.getSeconds();
				var dia = agora.getDate() < 10 ? "0" + agora.getDate() : agora.getDate();
				var mes = (agora.getMonth() + 1) < 10 ? "0" + (agora.getMonth() + 1) : (agora.getMonth() + 1);
				var ano = agora.getFullYear();
				var dataAtual = horas + ":" + minutos + ":" + segundos + " " + dia + "/" + mes + "/" + ano;
				obj[versao - 1][numeroSCBusca][i]["CR_DATA_ATUAL"] = dataAtual;
				log.info("❌ Aprovador " + i + " marcado como REJEITADO (CR_STATUS=06) com justificativa: " + (comentario || "Rejeitado") + " em " + dataAtual);
				break;
			}
		}
		aprovado = "reprovado"
	}

	for (var i = 1; i <= len; i++) {
		// CR_STATUS: "02" = pendente, "03" = liberado, "06" = rejeitado
		var status = obj[versao - 1][numeroSCBusca][i]["CR_STATUS"];
		log.info("🔍 Verificando aprovador " + i + " - CR_STATUS: " + status);
		if (status == "02" && aprovado != "reprovado") {
			aprovado = "pendente"
			hAPI.setCardValue("controleOrdem", aprovador + 1)
			log.info("⏳ Ainda há aprovadores pendentes - Status final: pendente");
			break;
		}
	}
	
	log.info("📊 Status final da aprovação: " + aprovado);
	hAPI.setCardValue("controleAprovacoes", JSONUtil.toJSON(obj))
	hAPI.setCardValue("statusAprovacao", aprovado)
	return aprovado
}

function atualizaAlcadaProtheus(aprovadorAtual, aprovacao, comentario, numeroSC) {
	try {
		// Montar payload seguindo o padrão solicitado
		var payload = {
			"CABECALHO": {
				"ALIAS": "SCR",
				"CR_TIPO": aprovadorAtual["CR_TIPO"] || "SC",
				"CR_NUM": numeroSC,
				"CR_NIVEL": aprovadorAtual["CR_NIVEL"],
				"CR_USER": aprovadorAtual["CR_USER"],
				"CR_APROV": aprovadorAtual["CR_APROV"],
				"CR_GRUPO": aprovadorAtual["CR_GRUPO"],
				"CR_ITGRP": aprovadorAtual["CR_ITGRP"],
				"CR_OBS": (comentario != null && comentario != "") ? comentario : "Sem justificativa",
				"CR_STATUS": aprovacao == "APROVAR" ? "03" : "06",
				"CR_EMISSAO": aprovadorAtual["CR_EMISSAO"] 
			}
		};
		
		log.info("=== DEBUG PAYLOAD ALÇADA ===");
		log.info("Objeto gerado: " + JSONUtil.toJSON(payload));
		log.info("============================");

		var c1 = DatasetFactory.createConstraint("data", JSONUtil.toJSON(payload), JSONUtil.toJSON(payload), ConstraintType.MUST);
		var retornoDS = DatasetFactory.getDataset("dsAtualizaAlcada", null, [c1], null);
		
		// Log do retorno do dataset
		log.info("=== DEBUG RETORNO DS ALÇADA ===");
		log.info("Rows count: " + retornoDS.rowsCount);
		if (retornoDS.rowsCount > 0) {
			for (var j = 0; j < retornoDS.columnsCount; j++) {
				log.info("Coluna " + j + ": " + retornoDS.getColumnName(j) + " = " + retornoDS.getValue(0, j));
			}
		}
		log.info("===============================");
		
		if (retornoDS.rowsCount > 0) {
			var status = retornoDS.getValue(0, "status") || "";
			var returnMsg = retornoDS.getValue(0, "returnMsg") || "";
			
			log.info("Status Alçada: " + status);
			log.info("Return Alçada: " + returnMsg);
			
			if (status == "OK") {
				log.info("✅ Alçada atualizada com sucesso no Protheus");
				return true;
			} else {
				var errorMsg = "ERRO NA INTEGRAÇÃO - Falha ao atualizar alçada de aprovação no Protheus.";
				if (status != "OK") {
					errorMsg += " Status retornado: '" + status + "'.";
				}
				if (returnMsg != "") {
					errorMsg += " Detalhes do sistema: " + returnMsg;
				}
				errorMsg += " Verifique os dados da aprovação e tente novamente.";
				log.error(errorMsg);
				throw errorMsg;
			}
		} else {
			var errorMsg = "ERRO NA INTEGRAÇÃO - Nenhuma resposta recebida do sistema Protheus para atualização de alçada. Verifique a conectividade e tente novamente.";
			log.error(errorMsg);
			throw errorMsg;
		}
	} catch (e) {
		var errorMsg = e.message || e.toString();
		// Se o erro não começa com "ERRO NA", formatar corretamente
		if (errorMsg.indexOf("ERRO NA") !== 0) {
			errorMsg = "ERRO NA INTEGRAÇÃO - " + errorMsg;
		}
		log.error("❌ Erro na função atualizaAlcadaProtheus: " + errorMsg);
		log.error("❌ Stack trace: " + e.stack);
		throw errorMsg;
	}
}