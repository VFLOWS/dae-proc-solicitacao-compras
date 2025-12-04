function servicetask15(attempt, message) {
	log.info("🚀 INICIANDO ServiceTask15 - Tentativa: " + attempt);
	
	try {
		var numSC = hAPI.getCardValue("nrSC")
		var dataSolicitacao = configuraData(hAPI.getCardValue("dataHoraSolic").split(" ")[0])
		if (numSC == null || numSC.isEmpty() || numSC == "") {
			var sucesso = criaSC(dataSolicitacao);
			if (!sucesso) {
				throw "ERRO NA CRIAÇÃO DE SC - Falha na criação da SC no sistema Protheus. Verifique os dados informados e tente novamente.";
			}
			// Pega o número que foi salvo no formulário
			numSC = hAPI.getCardValue("nrSC");
		} else {
			atualizaSC(numSC, dataSolicitacao)
		}
		log.info("✅ ServiceTask15 concluída com sucesso! SC: " + numSC);
		log.info("🔄 EXECUTANDO RETURN TRUE - A tarefa deveria avançar agora!");
		
		// Log adicional para debug
		log.info("📊 ESTADO FINAL:");
		log.info("📊 nrSC: " + hAPI.getCardValue("nrSC"));
		
		return true;
	} catch (e) {
		var errorMsg = e.message || e.toString();
		// Se o erro não começa com "ERRO NA", formatar corretamente
		if (errorMsg.indexOf("ERRO NA") !== 0) {
			errorMsg = "ERRO NA INTEGRAÇÃO PROTHEUS - " + errorMsg;
		}
		log.error("❌ Erro no ServiceTask15: " + errorMsg);
		log.error("❌ Stack trace: " + e.stack);
		log.error("🔄 EXECUTANDO THROW - A tarefa deveria parar aqui!");
		throw errorMsg; // Re-lança a exceção para interromper o workflow
	}
}

function criaSC(dataSolicitacao) {
	var obj = geraObjetoSC(dataSolicitacao)
	
	// Log para debug do payload
	log.info("=== DEBUG PAYLOAD SC ===");
	log.info("Objeto gerado: " + JSONUtil.toJSON(obj));
	log.info("========================");

	var c1 = DatasetFactory.createConstraint("data", JSONUtil.toJSON(obj), JSONUtil.toJSON(obj), ConstraintType.MUST)
	var retornoDS = DatasetFactory.getDataset("dsEnviaSC", null, [c1], null);
	
	// Log do retorno do dataset
	log.info("=== DEBUG RETORNO DS ===");
	log.info("Rows count: " + retornoDS.rowsCount);
	if (retornoDS.rowsCount > 0) {
		for (var j = 0; j < retornoDS.columnsCount; j++) {
			log.info("Coluna " + j + ": " + retornoDS.getColumnName(j) + " = " + retornoDS.getValue(0, j));
		}
	}
	log.info("========================");
	
	if (retornoDS.rowsCount > 0) {
		// Buscar pelos campos corretos do retorno do Protheus
		var status = retornoDS.getValue(0, "status") || "";
		var numero = retornoDS.getValue(0, "numero") || "";
		var returnMsg = retornoDS.getValue(0, "returnMsg") || "";
		
		log.info("Status: " + status);
		log.info("Número: " + numero);
		log.info("Return: " + returnMsg);

		if (status == "OK" && /^[0-9]+$/.test(numero)) {
			hAPI.setCardValue("nrSC", numero);

			// Atualizar o campo nrSC no histórico que já foi salvo
			atualizarHistoricoNrSC(numero);
			
			log.info("✅ SC criada com sucesso. Número: " + numero);
			return true;

		
		// Verificar se status é OK e se número contém apenas dígitos
		//if (status == "OK" && /^[0-9]+$/.test(numero)) {
			// MOCK PARA TESTE - substituindo numero do Protheus por valor fixo
			//hAPI.setCardValue("nrSC", "000185");
			//log.info("✅ SC criada com sucesso. Número MOCADO: 000185 (original era: " + numero + ")");
			//return true;



		} else {
			var errorMsg = "ERRO NA CRIAÇÃO DE SC - Falha na integração com Protheus.";
			
			// Se status for ERRO mas returnMsg indicar problema de parsing, mostrar detalhes
			if (status == "ERRO" && returnMsg != "" && returnMsg.indexOf("control character") > -1) {
				errorMsg += " Problema no parsing da resposta do Protheus.";
				errorMsg += " Detalhes técnicos: " + returnMsg;
				// Tentar mostrar o conteúdo bruto se disponível nos logs
				log.error("💡 DICA: Verifique o log anterior '---ERRO--- Conteúdo recebido:' para ver a resposta completa do Protheus");
			} else {
				if (status != "OK") {
					errorMsg += " Status retornado: '" + status + "'.";
				}
				if (numero == "" || !/^[0-9]+$/.test(numero)) {
					errorMsg += " Número da SC inválido ou não gerado. Retorno recebido: '" + numero + "'.";
				}
				if (returnMsg != "") {
					errorMsg += " Detalhes do sistema: " + returnMsg;
				}
			}
			
			errorMsg += " Verifique os dados da solicitação e tente novamente.";
			log.error(errorMsg);
			throw errorMsg;
		}
	} else {
		var errorMsg = "ERRO NA CRIAÇÃO DE SC - Nenhuma resposta recebida do sistema Protheus. Verifique a conectividade e tente novamente.";
		log.error(errorMsg);
		throw errorMsg;
	}
}
function atualizaSC(numSC, dataSolicitacao) {
	var obj = geraObjetoSC(dataSolicitacao, numSC)

	var c1 = DatasetFactory.createConstraint("data", JSONUtil.toJSON(obj), JSONUtil.toJSON(obj), ConstraintType.MUST)
	var c2 = DatasetFactory.createConstraint("atualizacao", "true", "true", ConstraintType.MUST)
	var retornoDS = DatasetFactory.getDataset("dsEnviaSC", null, [c1, c2], null);
	
	if (retornoDS.rowsCount > 0) {
		var status = retornoDS.getValue(0, "status") || "";
		var returnMsg = retornoDS.getValue(0, "returnMsg") || "";
		
		log.info("Atualização - Status: " + status);
		log.info("Atualização - Return: " + returnMsg);
		
		if (status != "OK") {
			var errorMsg = "ERRO NA ATUALIZAÇÃO DE SC - Falha na integração com Protheus.";
			errorMsg += " Status retornado: '" + status + "'.";
			if (returnMsg != "") {
				errorMsg += " Detalhes do sistema: " + returnMsg;
			}
			errorMsg += " Verifique os dados da solicitação e tente novamente.";
			log.error(errorMsg);
			throw errorMsg;
		} else {
			// Atualizar o campo nrSC no histórico que já foi salvo
			atualizarHistoricoNrSC(numSC);
			
			log.info("✅ SC atualizada com sucesso. Número: " + numSC);
		}
	} else {
		var errorMsg = "ERRO NA ATUALIZAÇÃO DE SC - Nenhuma resposta recebida do sistema Protheus. Verifique a conectividade e tente novamente.";
		log.error(errorMsg);
		throw errorMsg;
	}
}

function configuraData(data) {
	data = data.split("/")
	return data[2] + data[1] + data[0]
}


function geraObjetoSC(dataSolicitacao, numSC) {
	var obj = {}
	obj["CABECALHO"] = {}
	obj["CABECALHO"]["TIPO_MOV"] = numSC != null && numSC != "" ? "A" : "I"
	obj["CABECALHO"]["ALIAS"] = "SC1"
	if (numSC != null && numSC != "") {
		obj["CABECALHO"]["C1_NUM"] = numSC
	} else {
		obj["CABECALHO"]["C1_NUM"] = ""
	}
	obj["CABECALHO"]["C1_DATPRF"] = dataSolicitacao
	obj["CABECALHO"]["C1_SOLICIT"] = hAPI.getCardValue("loginSolicitante")
	obj["CABECALHO"]["C1_FILENT"] = hAPI.getCardValue("hidden_filialEntrega")
	obj["CABECALHO"]["ADC_CABEC"] = [
		{
			"C1_OBS" : hAPI.getCardValue("justificativaSC") || ""
		}
	]
	obj["ITENS"] = []
	
	// Como getChildrenIndexes não funciona corretamente, vamos usar apenas busca manual
	log.info("=== BUSCA MANUAL DE ITENS ===");
	var qtdItens = 0;
	
	// Buscar até encontrar o primeiro item vazio (parar na primeira falha)
	for (var j = 1; j <= 20; j++) {
		var produto = hAPI.getCardValue("hidden_produto___" + j);
		
		// Se retornou null (campo não existe), parar a busca
		if (produto == null) {
			break;
		}
		
		// Se tem conteúdo válido, é um item
		if (produto != "") {
			qtdItens = j;
			log.info("Item " + j + " encontrado - produto: '" + produto + "'");
		}
	}
	
	log.info("Total de itens encontrados: " + qtdItens);
	
	// Processar os itens encontrados
	for (var i = 1; i <= qtdItens; i++) {
		var produtoHidden = hAPI.getCardValue("hidden_produto___" + i) || "";
		var descricao = hAPI.getCardValue("descricao___" + i) || "";
		var quantidade = hAPI.getCardValue("quantidade___" + i) || "";
		var valorUn = hAPI.getCardValue("valorUn___" + i) || "";
		var centroCusto = hAPI.getCardValue("hidden_centroCusto___" + i) || "";
		var contaContabil = hAPI.getCardValue("hidden_contaContabil___" + i) || "";
	
		//var centroCusto = "1";
		//var contaContabil = "41105145";
		
		var armazem = "AC-0218";

		
		log.info("Item " + i + " - Produto: '" + produtoHidden + "', Qtd: '" + quantidade + "', Valor: '" + valorUn + "'");
		
		// Se tiver produto, adicionar o item
		if (produtoHidden != "") {
			var item = {}
			item["C1_ITEM"] = ("0000" + i).slice(-4)
			item["C1_PRODUTO"] = produtoHidden
			item["C1_QUANT"] = parseInt(quantidade) || 1
			item["C1_VUNIT"] = parseFloat((valorUn || "0").replace(",", ".")) || 0.0
			item["C1_CC"] = centroCusto
			item["C1_CONTA"] = contaContabil
			
			if (armazem && armazem != "") {
				item["C1_CLVL"] = armazem;
			}
			
			item["ADC_ITENS"] = [{}]
			obj["ITENS"].push(item)
			log.info("✓ Item " + i + " ADICIONADO");
		} else {
			log.info("✗ Item " + i + " pulado - produto vazio");
		}
	}
	
	log.info("Total de itens no array final: " + obj["ITENS"].length);
	log.info("===================");
	
	return obj
}

function atualizarHistoricoNrSC(numeroSC) {
	try {
		log.info("🔄 Iniciando atualização do campo nrSC no histórico com valor: " + numeroSC);
		
		// Buscar o JSON de valores da primeira linha de histórico
		var valuesCampos = hAPI.getCardValue("valuesCamposHistorico___1");
		
		if (!valuesCampos || valuesCampos == "") {
			log.info("⚠️ valuesCamposHistorico___1 está vazio");
			return;
		}
		
		log.info("📄 JSON original: " + valuesCampos);
		
		try {
			// Fazer parse do JSON
			var objValues = JSON.parse(valuesCampos);
			
			// Atualizar o campo 1_nrSC
			objValues["1_nrSC"] = numeroSC;
			
			// Converter de volta para JSON e salvar usando JSONUtil do Fluig
			var novoJSON = JSONUtil.toJSON(objValues);
			hAPI.setCardValue("valuesCamposHistorico___1", novoJSON);
			
			log.info("✅ Campo 1_nrSC atualizado no histórico com valor: " + numeroSC);
			log.info("📄 JSON atualizado: " + novoJSON);
			
		} catch (e) {
			log.error("❌ Erro ao processar JSON: " + e.message);
			log.error("❌ JSON recebido: " + valuesCampos);
		}
		
		log.info("✅ Atualização do histórico concluída");
		
	} catch (e) {
		log.error("❌ Erro ao atualizar histórico: " + e.message);
		log.error("❌ Stack trace: " + e.stack);
		// Não vamos lançar exceção para não interromper o fluxo principal
	}
}