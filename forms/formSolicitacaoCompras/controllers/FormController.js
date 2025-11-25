class FormController {
  constructor(activity, numProces, WKCardId, WKFormId, user, mobile, formMode) {
    this._atividade = activity;
    this._idProcesso = numProces;
    this._idCardForm = WKCardId;
    this._idForm = WKFormId;
    this._user = user;
    this._isMobile = mobile;
    this._formMode = formMode;
    this._fluigUtil = new Object({
      myComplete: new Object(),
      calendar: new Object()
    });

    this.calendarios = {
      calendarioDataInicioViagem: null,
    };

    this._activityController = new ActivityController(this._formMode, this._atividade);
    this._FormView = new FormView();
    this._loadForm();
  }

  /**
   * Método para carregar os eventos dos campos do formulário.
   */
  _loadForm() {

    var classes = new Array(
      "receber",
    );

    this.exibirPaineisHistorico(classes);

    this.montaTabelaAprovacoes();

    const formController = this;
    this._FormView.setFormController(formController);
    window['setSelectedZoomItem'] = !window['setSelectedZoomItem'] ? objZoom => this.zoomSelected(objZoom) : window['setSelectedZoomItem']();
    window['removedZoomItem'] = !window['removedZoomItem'] ? objZoom => this.zoomRemoved(objZoom) : window['removedZoomItem'];

    Util.contrairTodosCollapses();

    if (this._formMode == 'VIEW') {
      this._activityController._activityView[this._atividade](this._formMode, this._atividade, this._FormView, formController);
    } else {
      this._activityController._activityController[this._atividade](this._formMode, this._atividade, this._FormView, formController);
    }

    Util.expandirCollapsesDestacados();

    this.setarMascaras();
  }

  /**
   * @function setarMascaras Adiciona máscara de reais nos campos que contém a classe.
   */
  setarMascaras() {
    // if (this._atividade == Activity.INICIO_PADRAO || this._atividade == Activity.CORRIGIR || this._atividade == Activity.INICIO) {
    //   this.calendarios.calendarioDataRetornoViagem = Util.criarCalendario('divDataRetornoViagem');
    // }

    $('.real').mask("#.##0,00", {
      reverse: true
    });
  }

  atualizaValorDiarias() {
    $('#valorDiaria, #quantidade').on('keyup', function () {
      const valorDiariaFloat = $('#valorDiaria').val() ? Util.converterReaisEmFloat($('#valorDiaria').val()) : 0;
      const quantidadeMensalidades = $("#quantidade").val() ? parseFloat($("#quantidade").val().replace(',', '.')) : 0

      $("#valorTotal").val(
        (valorDiariaFloat * quantidadeMensalidades).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).replace('R$ ', '')
      )
    })
  }

  adicionarItem(event) {
    const TABELA_ITEM = 'tbItens';
    const indexLinhaCriada = wdkAddChild(TABELA_ITEM);
    $(`#valorUn___${indexLinhaCriada}`).on("change", function (data) {
      var quantidade = $(`#quantidade___${indexLinhaCriada}`).val();
      var valor = data.target.value;
      var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);
      $(`#valorTotal___${indexLinhaCriada}`).val(total.toLocaleString('pt-br', {
        minimumFractionDigits: 2
      }));
      if ($(`#valorTotal___${indexLinhaCriada}`).val() == 'NaN') {
        $(`#valorTotal___${indexLinhaCriada}`).val('0,00');
      }
    })
    $(`#quantidade___${indexLinhaCriada}`).on("change", function (data) {
      var valor = $(`#valorUn___${indexLinhaCriada}`).val();
      var quantidade = data.target.value;
      var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);
      $(`#valorTotal___${indexLinhaCriada}`).val(total.toLocaleString('pt-br', {
        minimumFractionDigits: 2
      }));
      if ($(`#valorTotal___${indexLinhaCriada}`).val() == 'NaN') {
        $(`#valorTotal___${indexLinhaCriada}`).val('0,00');
      }
    })
     $('.real').mask('#.##0,00', {
      reverse: true,
      placeholder: '0,00'
    });

  }

  carregaFuncionalidadesTabela(event) {
    $.makeArray($('input[id^="valorUn___"]')).forEach(input => {
      $(input).on("change", function (data) {
        var quantidade = $(input).parent().parent().find('[id^="quantidade__"]').val();
        var valor = data.target.value;
        var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);
        $(input).parent().parent().find('[name^="valorTotal__"]').val(total.toLocaleString('pt-br', {
          minimumFractionDigits: 2
        }));
        if ($(input).parent().parent().find('[name^="valorTotal__"').val() == 'NaN') {
          $(input).parent().parent().find('[name^="valorTotal__"').val('0,00');
        }
      })
    })
    $.makeArray($('input[id^="quantidade__"]')).forEach(input => {
      $(input).on("change", function (data) {
        var valor = $(input).parent().parent().find('[id^="valorUn___"]').val();
        var quantidade = data.target.value;
        var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);
        $(input).parent().parent().find('[name^="valorTotal__"]').val(total.toLocaleString('pt-br', {
          minimumFractionDigits: 2
        }));
        if ($(input).parent().parent().find('[name^="valorTotal__"').val() == 'NaN') {
          $(input).parent().parent().find('[name^="valorTotal__"').val('0,00');
        }
      })
    })
  }

  /**  ====================      ZOOM      ====================  */
  /**
   * Método para realizar ações ao selecionar um item num campo zoom.
   *
   * @param {Object} selectedItem
   */
  zoomSelected(selectedItem) {
    Util.carregamento(() => {
      const idSelecionado = selectedItem.inputId;
      this.zoomPainelSolicitacao(idSelecionado, selectedItem, AcaoZoom.SELECIONADO);
    });
  }

  /**
   * Método para realizar ações ao remover um item de um campo zoom.
   *
   * @param {Object} removedItem
   */
  zoomRemoved(removedItem) {
    Util.carregamento(() => {
      const idSelecionado = removedItem.inputId;
      this.zoomPainelSolicitacao(idSelecionado, removedItem, AcaoZoom.REMOVIDO);
    });
  }

  zoomPainelSolicitacao(idSelecionado, zoomItem, acaoZoom) {
    if (acaoZoom == AcaoZoom.SELECIONADO) {

      if (idSelecionado.indexOf("produto___") === 0 || idSelecionado === "produto") {
        var idx = Util.getIdx(idSelecionado, "produto");
        Util.setVal("descricao___" + idx, zoomItem["B1_COD"] || "");
        Util.setVal("unidade___" + idx, zoomItem["B1_UM"] || "");
        Util.setVal("armazem___" + idx, zoomItem["B1_GRUPO"] || "");

        // Pré-preencher Conta/CC (usuário pode trocar)
        if (zoomItem["contaContabil"]) {
          Util.safeSetZoomValue("contaContabil___" + idx, {
            "CT1_CONTA": zoomItem["B1_CONTA"],
            "CT1_DESC01": zoomItem["B1_CONTA"]
          });
        }
        if (zoomItem["centroCusto"]) {
          Util.safeSetZoomValue("centroCusto___" + idx, {
            "CTT_CUSTO": zoomItem["B1_CCCUSTO"],
            "CTT_DESC01": zoomItem["B1_CCCUSTO"]
          });
        }
      }
      if (idSelecionado.indexOf("contaContabil___") === 0 || idSelecionado === "contaContabil") {
        var idx = Util.getIdx(idSelecionado, "contaContabil");
        Util.setVal("hidden_contaContabil___" + idx, zoomItem["CT1_CONTA"] || "");
      }
      if (idSelecionado.indexOf("centroCusto___") === 0 || idSelecionado === "centroCusto") {
        var idx = Util.getIdx(idSelecionado, "centroCusto");
        Util.setVal("hidden_centroCusto___" + idx, zoomItem["CTT_CUSTO"] || "");
        Util.setVal("armazem___" + idx, zoomItem["CTT_FILIAL"] || "");
      }
      if (idSelecionado.indexOf("codComprador___") === 0 || idSelecionado === "codComprador") {
        var idx = Util.getIdx(idSelecionado, "codComprador");
        Util.setVal("hidden_codComprador___" + idx, zoomItem["Y1_COD"] || "");
      }
      if (idSelecionado.indexOf("filialEntrega___") === 0 || idSelecionado === "filialEntrega") {
        var idx = Util.getIdx(idSelecionado, "filialEntrega");
        Util.setVal("hidden_filialEntrega___" + idx, zoomItem["Y1_COD"] || "");
      }


    } else if (acaoZoom == AcaoZoom.REMOVIDO) {

      if (idSelecionado.indexOf("produto___") === 0 || idSelecionado === "produto") {
        var idx = Util.getIdx(idSelecionado, "produto");
        Util.setVal("descricao___" + idx, "");
        Util.setVal("unidade___" + idx, "");
        Util.setVal("armazem___" + idx, "");
      }
      
      if (idSelecionado.indexOf("contaContabil___") === 0 || idSelecionado === "contaContabil") {
        var idx = Util.getIdx(idSelecionado, "contaContabil");
        Util.setVal("hidden_contaContabil___" + idx, "");
      }
      
      if (idSelecionado.indexOf("centroCusto___") === 0 || idSelecionado === "centroCusto") {
        var idx = Util.getIdx(idSelecionado, "centroCusto");
        Util.setVal("hidden_centroCusto___" + idx, "");
        Util.setVal("armazem___" + idx, "");
      }
      
      if (idSelecionado.indexOf("codComprador___") === 0 || idSelecionado === "codComprador") {
        var idx = Util.getIdx(idSelecionado, "codComprador");
        Util.setVal("hidden_codComprador___" + idx, "");
      }
      
      if (idSelecionado.indexOf("filialEntrega___") === 0 || idSelecionado === "filialEntrega") {
        var idx = Util.getIdx(idSelecionado, "filialEntrega");
        Util.setVal("hidden_filialEntrega___" + idx, "");
      }

    }
  }

  consultaNome(nome) {
    var constraintColleague = DatasetFactory.createConstraint('colleaguePK.colleagueId', nome, nome, ConstraintType.MUST);
    var retornoColleague = DatasetFactory.getDataset('colleague', [], [constraintColleague], null).values[0]['colleagueName'];
    return retornoColleague
  }

  montaTabelaAprovacoes() {
    const aprovacoes = JSON.parse($("#controleAprovacoes").val())
    if (!Util.estaVazio(aprovacoes)) {
      for (let i = 0; i < Object.keys(aprovacoes).length; i++) {
        var html = ``
        var objPrimario = Object.keys(aprovacoes[i])
        var numsc = objPrimario[0]
        html = `
          <div class="panel panel-default vf-timeline" id="painelEtapa_${i + 1}">
            <div class="panel-heading">
              <h3 class="panel-title" style="font-weight: bold;">
                <a class="collapse-icon up" data-toggle="collapse" data-parent="#accordion" href="#panelCollapseAprova_${i + 1}">
                  <span class="flaticon flaticon-document-approved icon-sm"></span>&nbsp;Aprovação Etapa ${i + 1} - Solicitação de Compra ${numsc}</a>
              </h3>
            </div>
            <div id="panelCollapseAprova_${i + 1}" class="panel-collapse collapse in">
              <div class="panel-body">
              `

        for (let j = 1; j <= Object.keys(aprovacoes[i][numsc]).length; j++) {

          html += `<ol class="vf-tl-list">`

          var nome = this.consultaNome(aprovacoes[i][numsc][j]["matricula"])

          if (aprovacoes[i][numsc][j]["status"] == "pendente") {
            html += `
                <li class="vf-tl-item vf-st-pendente">
                  <div class="vf-tl-marker"><span class="fluigicon fluigicon-time icon-sm"></span></div>
                  <div class="vf-tl-content">
                    <div class="vf-tl-row">
                      <strong>Nível ${aprovacoes[i][numsc][j]["ordem"]} - ${nome}</strong>
                      <span class="vf-tl-date">Pendente</span>
                    </div>
                    <div class="vf-tl-meta"> ---</div>
                  </div>
                </li>
            `
          }

          if (aprovacoes[i][numsc][j]["status"] == "aprovado") {
            html += `
                <li class="vf-tl-item vf-st-aprovado">
                  <div class="vf-tl-marker"><span class="fluigicon fluigicon-check icon-sm"></span></div>
                  <div class="vf-tl-content">
                    <div class="vf-tl-row">
                      <strong>Nível ${aprovacoes[i][numsc][j]["ordem"]} - ${nome}</strong>
                      <span class="vf-tl-date">${aprovacoes[i][numsc][j]["horario"]}</span>
                    </div>
                    <div class="vf-tl-meta">${nome}</div>
                    <div class="vf-tl-note">${aprovacoes[i][numsc][j]["comentario"]}</div>
                  </div>
                </li>
            `
          }

          if (aprovacoes[i][numsc][j]["status"] == "reprovado") {
            html += `
                 <li class="vf-tl-item vf-st-reprovado">
                    <div class="vf-tl-marker"><span class="fluigicon fluigicon-remove icon-sm"></span></div>
                    <div class="vf-tl-content">
                      <div class="vf-tl-row">
                        <strong>Nível ${aprovacoes[i][numsc][j]["ordem"]} - ${nome}</strong>
                        <span class="vf-tl-date">${aprovacoes[i][numsc][j]["horario"]}</span>
                      </div>
                      <div class="vf-tl-meta">${nome}</div>
                      <div class="vf-tl-note">${aprovacoes[i][numsc][j]["comentario"]}</div>
                    </div>
                  </li>
            `
          }

          html += `</ol>`
        }


        html += ` 
              </div>
            </div>
          </div>
      `

      $("#aprovacoes").append(html)
      }

    }
  }


  static salvarPainelHistorico(painel, data, nomeSolicitante) {
    var indiceLinhaAdicionada = wdkAddChild("tableHistorico");

    var inputs = {};
    $.makeArray($(`#${painel}`).find("[id]")).forEach(el => {
      if ((el.type == "radio" || el.type == "checkbox")) {
        if ($(el).is(":checked")) {
          inputs[`${indiceLinhaAdicionada}_${el.id}`] = el.value
        }
      } else {
        inputs[`${indiceLinhaAdicionada}_${el.id}`] = el.value
      }
    })


    var htmlOriginalPainel = $(`#${painel}`).html()
    var htmlReduzido = htmlOriginalPainel.replace(/>\s+|\s+</g, function (m) {
      return m.trim();
    });


    var htmlNovosIds = htmlReduzido.replaceAll('id="', `id="${indiceLinhaAdicionada}_`)
    htmlNovosIds = htmlNovosIds.replaceAll('name="', `name="${indiceLinhaAdicionada}_`)
    htmlNovosIds = htmlNovosIds.replaceAll('for="', `for="${indiceLinhaAdicionada}_`)

    const chunks = new Array(4)

    $(`#indiceHistorico___${indiceLinhaAdicionada}`).val(indiceLinhaAdicionada);
    $(`#dataHistorico___${indiceLinhaAdicionada}`).val($(`#${data}`).val());
    $(`#nomeSolicitanteHistorico___${indiceLinhaAdicionada}`).val($(`#${nomeSolicitante}`).val());

    var sobra = htmlNovosIds.length % 4;
    var quantidadeChars = (htmlNovosIds.length - sobra) / 4;

    for (let i = 0, o = 0; i < 4; ++i, o += quantidadeChars) {
      if (i == 3)
        chunks[i] = htmlNovosIds.substr(o, quantidadeChars + sobra)
      else
        chunks[i] = htmlNovosIds.substr(o, quantidadeChars)

      $(`#painelHistorico${i + 1}___${indiceLinhaAdicionada}`).val(chunks[i]);
    }
    $(`#valuesCamposHistorico___${indiceLinhaAdicionada}`).val(JSON.stringify(inputs));
  }

  exibirPaineisHistorico(classesRemover) {
    /** PERCORRE TABLE DE HISTÓRICO */
    $.makeArray($("[id^='rowPainelHistorico___']")).reverse().forEach((row, idx) => {

      var indexHistorico = row.id.split("___")[1]

      /** VERIFICAR SE O PAINEL É DO TIPO 'ASSINATURA ELETRONICA' E FAZ O TRATAMENTO ADEQUADO */



      /** INSERE PAINEL DE HISTÓRICO LOGO APÓS O PAINEL ORIGINAL DE SOLICITAÇÃO */
      $(`<div class="panel panel-default" id="idPainelHistorico___${indexHistorico}">` + $(row).find("input[id^='painelHistorico1___']").val() +
        $(row).find("input[id^='painelHistorico2___']").val() + $(row).find("input[id^='painelHistorico3___']").val() +
        $(row).find("input[id^='painelHistorico4___']").val() + "</div>")
        .insertAfter("#painelSolicitante")

      var valuesInputs = JSON.parse($(row).find("input[id^='valuesCamposHistorico___']").val())

      /** REMOVE CLASSES QUE FAZEM CONTROLE DA VISUALIZAÇÃO DO PAINEL */
      if (classesRemover.length > 0) {
        classesRemover.forEach(classe => {
          if (classe == `panel-info`) {
            $(`.panel-info`, $(`#idPainelHistorico___${indexHistorico}`)).addClass(`panel-default`);
          }
          $(`#idPainelHistorico___${indexHistorico}`).find(`.${classe}`).removeClass(classe);
        });
      }

      /** ATUALIZA O VALOR DO HREF DOS COLLAPSES PARA QUE NÃO HAJA CONFLITO COM O PAINEL ORIGINAL */
      let hrefCollpase = $(`#idPainelHistorico___${indexHistorico}`).find("[href^='#panelCollapse']").attr("href")
      $(`#idPainelHistorico___${indexHistorico}`).find("[href^='#panelCollapse']").attr("href", "#" + (indexHistorico) + "_" + (hrefCollpase.split("#")[1]))

      $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("[href^='#panel']")).forEach(fieldset => {
        let hrefFieldset = $(fieldset).attr("href");
        $(fieldset).attr("href", "#" + (indexHistorico) + "_" + (hrefFieldset.split("#")[1]))
      })

      /** ATUALIZA HEADER DO PAINEL HISTÓRICO, ADICIONANDO O INDICE, NOME DO SOLICITANTE E A DATA  */
      $(`#idPainelHistorico___${indexHistorico}`).find(`[href^='#${indexHistorico}_panelCollapse']`)
        .prepend(`${$(row).find("input[id^='indiceHistorico___']").val()}.`)
        .append(`<span>  |  ${$(row).find("input[id^='nomeSolicitanteHistorico___']").val()} ${$(row).find("input[id^='dataHistorico___']").val()}</span>`)

      /** REMOVE BOTÕES DE ANEXAR E DE EXCLUIR ANEXO */
      $(`#idPainelHistorico___${indexHistorico}`).find(".fluigicon-trash").remove()
      $(`#idPainelHistorico___${indexHistorico}`).find(`[id^='${indexHistorico}_btnAddSC']`).remove()

      /** CONTRAI COLLAPSE  */
      $(`#idPainelHistorico___${indexHistorico}`).find(".in").removeClass("in")
      $(`#idPainelHistorico___${indexHistorico}`).find(`[id^='${indexHistorico}_panelCollapse']`).addClass("in")

      /** PERCORRE O PAINEL DE HISTÓRICO PARA ENCONTRAR TODOS OS RADIOS E DESMARCALOS */
      $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("[id]")).forEach(el => {
        if ($(el).attr("type") == "radio") {
          $(el).prop("checked", false);
        }
      })

      /** PERCORRE O PAINEL DE HISTÓRICO PARA ENCONTRAR TODOS OS ELEMENTOS QUE TENHAM ID */
      $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("[id]")).forEach(el => {

        /** SALVA O ID ORIGINAL DO ELEMENTO */
        var id = $(el).attr("id");

        /** DESATIVA EVENTO DE CLICK NO ELEMENTO */
        //$(el).css("pointer-events", "none");

        /** Remove atributo tablename */
        var attrTablename = $(el).attr('tablename');
        if (typeof attrTablename !== 'undefined' && attrTablename !== false) {
          $(el).attr("tablename", `tablePaiFilho_${indexHistorico}`);
          $(el).attr("id", `tablePaiFilho_${indexHistorico}`);
          $(el).attr("name", `tablePaiFilho_${indexHistorico}`);
        }

        /** PASSA OS VALORES PARA OS CAMPOS E CASO SEJA CHECKBOX / RADIO SELECIONA A OPÇÃO CORRETA */
        if ($(el).attr("type") == "radio" || $(el).attr("type") == "checkbox") {
          if (valuesInputs[id]) {
            $(`#${id}`).prop("checked", true);
          } else {
            $(`#${id}`).prop("checked", false);
          }
        } else {
          $(`#${id}`).val(valuesInputs[id]);
        }

        if ($(`#${id}`).attr("type") != "zoom") {
          Util.desabilitarCampos([`#${id}`]);
        }
      });

      if ($(`#${indexHistorico}_hidden_decisao`).val() == "APROVAR") {
        $(`#${indexHistorico}_decisao_aprovar`).attr('checked', 'checked')
        $(`label[for="${indexHistorico}_decisao_aprovar"]`).css({
          "background": "#15803d",
          "border-color": "#15803d",
          "color": "#fff"
        })
      }
      if ($(`#${indexHistorico}_hidden_decisao`).val() == "REPROVAR") {
        $(`#${indexHistorico}_decisao_reprovar`).attr('checked', 'checked')
        $(`label[for="${indexHistorico}_decisao_reprovar"]`).css({
          "background": "#b91c1c",
          "border-color": "#b91c1c",
          "color": "#fff"
        })
      }

      /** Remove atributo detailname de todas as TR's */
      $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("tr")).forEach(el => {
        $(el).removeAttr("detailname");
      });

      $(".bootstrap-tagsinput:not(.bootstrap-tagsinput-max)").each(function (key, element) {
        var a = $(element)[0].previousSibling
        $(a).show()
      });
      $(".bootstrap-tagsinput:not(.bootstrap-tagsinput-max)").hide()

      $(`#idPainelHistorico___${indexHistorico}`).find(`div[id^='${indexHistorico}_field']`).removeAttr("style")
      $(`#idPainelHistorico___${indexHistorico}`).find(`fieldset[id^='${indexHistorico}_fieldset']`).removeAttr("style")
      $(`#idPainelHistorico___${indexHistorico}`).find(`table[id^='tablePaiFilho']`).removeAttr("style")

    });

  }

}

class AcaoZoom {
  static get SELECIONADO() {
    return true;
  }

  static get REMOVIDO() {
    return false;
  }
}

class ValidationError {
  constructor(message) {
    this.message = message;
  }
}