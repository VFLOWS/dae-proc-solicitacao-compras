function servicetask21(attempt, message) {
	verificarAprovacao()

	return true
}

function verificarAprovacao() {
	var versao = parseInt(hAPI.getCardValue("controleAssinaturas"))
	var aprovador = parseInt(hAPI.getCardValue("controleOrdem"))
	var aprovacoes = hAPI.getCardValue("controleAprovacoes")
	var obj = JSON.parse(aprovacoes)
	var numeroSC = hAPI.getCardValue("nrSC")
	var matriculaAssinante = hAPI.getCardValue("matriculaAssinante")

	var aprovacao = hAPI.getCardValue("hidden_decisao")

	var aprovado = "aprovado"
	var horario = hAPI.getCardValue("dataHoraAprov")
	var comentario = hAPI.getCardValue("justificativaAprov")

	log.info("servicetask21 -- verificarAprovacao()")
	log.info("servicetask21 -- aprovacoes " + aprovacoes)
	log.info("servicetask21 -- versao " + versao)
	log.info("servicetask21 -- numeroSC " + numeroSC)
	log.info("servicetask21 -- aprovacoes OBJ")
	log.dir(obj)
	log.info("servicetask21 -- aprovacoes OBJ KEYS")
	log.dir(Object.keys(obj[versao - 1][numeroSC]))
	
	var len = Object.keys(obj[versao - 1][numeroSC]).length
	log.info("servicetask21 -- len " + len)

	if (aprovacao == "APROVAR") {
		for (var i = 1; i <= len; i++) {
			if (obj[versao - 1][numeroSC][i]["matricula"] == matriculaAssinante &&
				parseInt(obj[versao - 1][numeroSC][i]["ordem"]) == aprovador
			) {
				obj[versao - 1][numeroSC][i]["status"] = "aprovado"
				obj[versao - 1][numeroSC][i]["horario"] = horario
				obj[versao - 1][numeroSC][i]["comentario"] = comentario
				if (i != len) {
					hAPI.setCardValue("matriculaAssinante", obj[versao - 1][numeroSC][i+1]["matricula"])
				}
				break;
			}
		}
	} else if (aprovacao == "REPROVAR") {
		for (var i = 1; i <= len; i++) {
			if (obj[versao - 1][numeroSC][i]["matricula"] == matriculaAssinante) {
				obj[versao - 1][numeroSC][i]["status"] = "reprovado"
				obj[versao - 1][numeroSC][i]["horario"] = horario
				obj[versao - 1][numeroSC][i]["comentario"] = comentario
				break;
			}
		}
		aprovado = "reprovado"
	}

	for (var i = 1; i <= len; i++) {
		if (obj[versao - 1][numeroSC][i]["status"] == "pendente" && aprovado != "reprovado") {
			aprovado = "pendente"
			hAPI.setCardValue("controleOrdem", aprovador + 1)
			break;
		}
	}
	hAPI.setCardValue("controleAprovacoes", JSONUtil.toJSON(obj))
	hAPI.setCardValue("statusAprovacao", aprovado)
	return aprovado
}