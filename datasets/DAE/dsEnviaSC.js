function createDataset(fields, constraints, sortFields) {
    log.info("---DEBUG--- dsEnviaSC")
    
    try {
        var dataset = DatasetBuilder.newDataset();
        dataset.addColumn("status");
        dataset.addColumn("numero");
        dataset.addColumn("returnMsg");
      
        var PAYLOAD = {};
        var ATUALIZACAO = false;
        
        if(constraints != null){    
            for (var i = 0; i < constraints.length; i++){		 
                if(constraints[i]["fieldName"] == "data"){
                    PAYLOAD = JSON.parse(constraints[i]["finalValue"]);
                }
                else if(constraints[i]["fieldName"] == "atualizacao"){
                    ATUALIZACAO = true;
                }
            }		
        }

        var endpoint = ATUALIZACAO ? '/IntegraFluig/atualizasolicitacao' : '/IntegraFluig/solicitacaocompras';
        var method = ATUALIZACAO ? 'PUT' : 'POST';
    
        var clientService = fluigAPI.getAuthorizeClientService();
        var data = {            
            companyId: getValue("WKCompany") + '',
            serviceCode: 'RESTPROTHEUS',
            endpoint: endpoint,
            method: method,
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
            dataset.addRow(["ERRO", "", "Nenhuma resposta recebida do Protheus"]);
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

        // Função para limpar caracteres de controle
        function limparCaracteresControle(str) {
            if (typeof str !== 'string') return str;
            // Remove caracteres de controle mas preserva quebras de linha básicas
            return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        }

        // Limpar o JSON ANTES do parse para evitar erro de caracteres de controle
        var cleanResult = limparCaracteresControle(result);
        log.info("---DEBUG--- JSON limpo (preview): " + (cleanResult.length > 200 ? cleanResult.substring(0, 200) + "..." : cleanResult));

        // Parse do JSON limpo
        var response;
        try {
            response = JSON.parse(cleanResult);
        } catch (e) {
            log.error("---ERRO--- Falha ao fazer parse do JSON: " + e.message);
            
            // Tentar extrair manualmente os dados quando o JSON.parse falha
            try {
                log.info("---TENTATIVA--- Extraindo dados manualmente...");
                
                // Extrair status
                var statusMatch = cleanResult.match(/"status"\s*:\s*"([^"]+)"/);
                var extractedStatus = statusMatch ? statusMatch[1] : "ERRO";
                
                // Extrair numero (pode ter quebras de linha)
                var numeroMatch = cleanResult.match(/"numero"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                var extractedNumero = numeroMatch ? numeroMatch[1] : "";
                
                // Extrair return
                var returnMatch = cleanResult.match(/"return"\s*:\s*"([^"]+)"/);
                var extractedReturn = returnMatch ? returnMatch[1] : "Sem retorno";
                
                log.info("---EXTRAÇÃO--- Status: " + extractedStatus);
                log.info("---EXTRAÇÃO--- Número: '" + extractedNumero.substring(0, 50) + (extractedNumero.length > 50 ? "..." : "") + "'");
                log.info("---EXTRAÇÃO--- Return: " + extractedReturn);
                
                // Se conseguiu extrair status como OK, usar dados extraídos
                if (extractedStatus === "OK") {
                    dataset.addRow([extractedStatus, extractedNumero, extractedReturn]);
                    return dataset;
                }
            } catch (extractError) {
                log.error("---ERRO--- Falha na extração manual: " + extractError.message);
            }
            
            log.error("---ERRO--- Conteúdo recebido: " + result);
            dataset.addRow(["ERRO", "", "Resposta inválida do Protheus: " + e.message]);
            return dataset;
        }
        
        var status = response.status || "ERRO";
        var numero = response.numero || "";
        var returnMsg = response["return"] || "Sem retorno";

        // Limpar caracteres de controle dos campos individuais também
        status = limparCaracteresControle(status);
        numero = limparCaracteresControle(numero);
        returnMsg = limparCaracteresControle(returnMsg);

        // Log dos dados limpos para debug
        log.info("---DEBUG--- Dados após limpeza:");
        log.info("---DEBUG--- Status: " + status);
        log.info("---DEBUG--- Número: '" + numero + "'");
        log.info("---DEBUG--- ReturnMsg: " + (returnMsg.length > 100 ? returnMsg.substring(0, 100) + "..." : returnMsg));

        dataset.addRow([status, numero, returnMsg]);
        return dataset;

    } catch (error) {
        log.error("Erro no dsEnviaSC: " + error);
        var dataset = DatasetBuilder.newDataset();
        dataset.addColumn("status");
        dataset.addColumn("numero");
        dataset.addColumn("returnMsg");
        dataset.addRow(["ERRO", "", error.message || error]);
        return dataset;
    }
}
