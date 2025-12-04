function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();
    
    var SQL = "";
    var endPoint = "";
    var metodo = "POST"
    var queryParam = ""
    var dataParam = ""
    try {
        
        
        if (constraints != null) {
            for (var i = 0; i < constraints.length; i++) {
                if (constraints[i].fieldName == 'SQL') {
                    SQL = constraints[i].initialValue;
                    log.info("SQL "+ SQL)
                }
                if (constraints[i].fieldName == 'endpoint') {
                    endPoint = constraints[i].initialValue;
                }
                if (constraints[i].fieldName == 'metodo') {
                    metodo = "PUT"
                }
                if (constraints[i].fieldName == 'data') {
                    dataParam = constraints[i].initialValue;
                }
            }
        }
        
        var clientService = fluigAPI.getAuthorizeClientService();

        if(SQL != "") {
            queryParam = JSON.parse(SQL)
        } else {
            queryParam = dataParam
        }

        log.info('-- DEBUG -- dsRestProtheus')
        log.info('-- DEBUG -- queryParam: ' + queryParam)
        
        var data = {
            companyId: getValue("WKCompany") + '',
            serviceCode: 'RESTPROTHEUS',
            endpoint: endPoint,
            method: metodo,
            timeoutService: '1500',
            options : {
                encoding : "UTF-8",
                mediaType: "application/json"
            },
            headers: {
                "Content-Type": "application/json"
            },    
            params: queryParam
        };
        
        log.info('-- DEBUG -- dsRestProtheus || data: ')
        log.dir(data)
        
        var response = clientService.invoke(JSONUtil.toJSON(data));

        log.info('-- DEBUG -- dsRestProtheus || response object: ')
        log.dir(response)
        
        if (!response) {
            log.info('-- ERRO -- Response é null');
            dataset.addColumn("ERRO");
            dataset.addRow(["Response é null"]);
            return dataset;
        }
        
        if (response.getResult() == null) {
            log.info('-- ERRO -- Response.getResult() é null');
            dataset.addColumn("ERRO");
            dataset.addRow(["Response.getResult() é null"]);
            return dataset;
        }
        
        if (response.getResult().isEmpty()) {
            log.info('-- ERRO -- Response.getResult() está vazio');
            dataset.addColumn("ERRO");
            dataset.addRow(["Response.getResult() está vazio"]);
            return dataset;
        }

        var raw = response.getResult().trim();
        log.info('-- DEBUG -- Raw response do Protheus: ' + raw);

        // Mostra o retorno se der erro no JSON
        if (raw.indexOf("{") !== 0 && raw.indexOf("[") !== 0) {
            log.info('-- ERRO -- Resposta não é JSON válido: ' + raw);
            dataset.addColumn("ERRO");
            dataset.addRow(["Resposta inesperada: " + raw]);
            return dataset;
        }

        // Faz o parse do JSON
        var result = JSON.parse(raw);
        
        log.info('-- DEBUG -- Resultado parseado: ' + JSONUtil.toJSON(result));
        
        var lista = result;
        
        // Se o resultado não é array, transforma em array
        if (!Array.isArray(lista)) {
            lista = [lista];
        }

        if (!lista || lista.length === 0) {
            dataset.addColumn("ERRO");
            dataset.addRow(["Lista vazia"]);
            return dataset;
        }

        // Cria colunas dinamicamente baseado no primeiro item
        for (var key in lista[0]) {
            dataset.addColumn(key);
        }

        // Adiciona as linhas
        for (var i = 0; i < lista.length; i++) {
            var row = [];
            for (var key in lista[i]) {
                row.push(lista[i][key]);
            }
            dataset.addRow(row);
        }

    } catch (e) {
        log.info('-- ERRO -- Exception no dsRestProtheus: ' + e.message);
        log.info('-- ERRO -- Stack trace: ' + e.stack);
        dataset.addColumn("ERRO");
        dataset.addRow([e.message]);
    }

    return dataset;
}