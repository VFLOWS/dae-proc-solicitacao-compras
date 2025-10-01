function servicetask15(attempt, message) {
	var numSC = criaSC()
	setAprovadoresSC(numSC)
	return true
}

function criaSC() {
	var numSC = "12346745"
	hAPI.setCardValue("nrSC", numSC)

	return numSC
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