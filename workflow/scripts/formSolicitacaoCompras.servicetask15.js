function servicetask15(attempt, message) {
	var numSC = hAPI.getCardValue("nrSC")
	var dataSolicitacao = configuraData(hAPI.getCardValue("dataHoraSolic").split(" ")[0])
	if (numSC == null || numSC.isEmpty() || numSC == "") {
		numSC = criaSC(dataSolicitacao)
	} else {
		atualizaSC(numSC, dataSolicitacao)
	}
	setAprovadoresSC(numSC)
	return true
}

function criaSC(dataSolicitacao) {
	var obj = geraObjetoSC(dataSolicitacao)

	var c1 = DatasetFactory.createConstraint("data", JSONUtil.toJSON(obj), JSONUtil.toJSON(obj), ConstraintType.MUST)
	var retornoDS = DatasetFactory.getDataset("dsEnviaSC", null, [c1], null);
	if (retornoDS.rowsCount > 0) {
		var numSC = retornoDS.getValue(0, "num_sc")
		hAPI.setCardValue("nrSC", numSC)
		return numSC
	} else {
		throw "Erro ao criar SC. " + retornoDS.getValue(0, "0")
	}
}
function atualizaSC(numSC, dataSolicitacao) {
	var obj = geraObjetoSC(dataSolicitacao , numSC)

	var c1 = DatasetFactory.createConstraint("data", JSONUtil.toJSON(obj), JSONUtil.toJSON(obj), ConstraintType.MUST)
	var c2 = DatasetFactory.createConstraint("atualizacao", true, true, ConstraintType.MUST)
	var retornoDS = DatasetFactory.getDataset("dsEnviaSC", null, [c1, c2], null);
	if (retornoDS.rowsCount > 0) {
		var numSC = retornoDS.getValue(0, "num_sc")
	} else {
		throw "Erro ao Editar SC. " + retornoDS.getValue(0, "0")
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
			"C1_OBS" : hAPI.getCardValue("justificativaSC"),
			"C1_CC" : hAPI.getCardValue("hidden_unidRequis"),
			"C1_CONTA" : hAPI.getCardValue("contaContabil"),
		}
	]
	obj["ITENS"] = []
	var qtdItens = parseInt(hAPI.getChildrenIndexes("tbItens"))
	for (var i = 1; i <= qtdItens; i++) {
		var item = {}
		item["C1_ITEM"] = ("0000" + i).slice(-4)
		item["C1_PRODUTO"] = hAPI.getCardValue("descricao___" + i)
		item["C1_QUANT"] = parseInt(hAPI.getCardValue("quantidade___" + i))
		item["C1_VUNIT"] = hAPI.getCardValue("valorUn___" + i).replace(",", ".")
		item["ADC_ITENS"] = [{}]
		obj["ITENS"].push(item)
	}
}

function setAprovadoresSC(numSC) {
	var c1 = DatasetFactory.createConstraint("numeroSC", numSC, numSC, ConstraintType.MUST)
	var aprovadoresSC = DatasetFactory.getDataset("ds_aprovadores_sc", null, [c1], null);
	if (aprovadoresSC.rowsCount > 0) {
		var aprovadores = {}
		for (var i = 0; i < aprovadoresSC.rowsCount; i++) {
			aprovadores[i + 1] = {
				"ordem" : aprovadoresSC.getValue(i, "ordem"),
				"matricula" : aprovadoresSC.getValue(i, "matricula"),
				"status" : "pendente",
				"horario" : "00:00:00",
				"comentario" : "",
			}
		}
		var versao = hAPI.getCardValue("controleAssinaturas")
		var obj = JSON.parse(hAPI.getCardValue("controleAprovacoes"))
		obj[versao] = {}
		obj[versao][numSC.toString()] = aprovadores
		versao = parseInt(versao) + 1;
		hAPI.setCardValue("controleAssinaturas", versao + "")
		hAPI.setCardValue("controleOrdem", "1")
		hAPI.setCardValue("controleAprovacoes", JSONUtil.toJSON(obj))
		hAPI.setCardValue("matriculaAssinante", obj[versao - 1][numSC][1]["matricula"])
	} else throw "Erro ao consultar aprovadores da SC. " + aprovadoresSC.getValue(0, "0")
}