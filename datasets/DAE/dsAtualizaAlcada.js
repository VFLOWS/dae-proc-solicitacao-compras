function createDataset(fields, constraints, sortFields) {
    log.info("---DEBUG--- dsAtualizaAlcada")
    
    try {
        var dataset = DatasetBuilder.newDataset();
        dataset.addColumn("status");
        dataset.addColumn("returnMsg");
      
        var PAYLOAD = {};
        
        if(constraints != null){    
            for (var i = 0; i < constraints.length; i++){		 
                if(constraints[i]["fieldName"] == "data"){
                    PAYLOAD = JSON.parse(constraints[i]["finalValue"]);
                }
            }		
        }

        var endpoint = '/IntegraFluig/atualizaalcada';
    
        var clientService = fluigAPI.getAuthorizeClientService();
        var data = {            
            companyId: getValue("WKCompany") + '',
            serviceCode: 'RESTPROTHEUS',
            endpoint: endpoint,
            method: 'POST',
            timeoutService: '120',
            params: PAYLOAD,
            headers: {
                'Content-Type': "application/json",
                'Accept': 'application/json'
            }
        }

        var gson = new com.google.gson.Gson();
        var vo = clientService.invoke(gson.toJson(data));
        var result = vo.getResult();

        if (!result) {
            dataset.addRow(["ERRO", "Nenhuma resposta recebida do Protheus"]);
            return dataset;
        }

        log.info("---DEBUG--- Tipo do resultado: " + typeof result);
        log.info("---DEBUG--- Tamanho do resultado: " + result.length);
        
        // Mostrar primeiros caracteres de forma segura
        var preview = result.length > 200 ? result.substring(0, 200) + "..." : result;
        log.info("---DEBUG--- Conteúdo do resultado: " + preview);

        // Verificar se a resposta é HTML (erro do servidor)
        if (typeof result === 'string' && result.trim().indexOf('<') === 0) {
            log.error("---ERRO--- Protheus retornou HTML em vez de JSON - possível erro no servidor");
            dataset.addRow(["ERRO", "", "Protheus retornou HTML - erro no servidor/endpoint"]);
            return dataset;
        }

        // Parse direto - o resultado vem como string JSON
        var response;
        try {
            response = JSON.parse(result);
        } catch (e) {
            log.error("---ERRO--- Falha ao fazer parse do JSON: " + e.message);
            log.error("---ERRO--- Conteúdo recebido: " + result);
            dataset.addRow(["ERRO", "Resposta inválida do Protheus: " + e.message]);
            return dataset;
        }
        
        var status = response.status || "ERRO";
        var returnMsg = response["return"] || "Sem retorno";

        dataset.addRow([status, returnMsg]);
        return dataset;

    } catch (error) {
        log.error("Erro no dsAtualizaAlcada: " + error);
        var dataset = DatasetBuilder.newDataset();
        dataset.addColumn("status");
        dataset.addColumn("returnMsg");
        dataset.addRow(["ERRO", error.message || error]);
        return dataset;
    }
}