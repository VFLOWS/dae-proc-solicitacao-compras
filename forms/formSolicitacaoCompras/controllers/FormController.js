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
    if (this._atividade == Activity.INICIO_PADRAO || this._atividade == Activity.CORRIGIR || this._atividade == Activity.INICIO) {
      this.calendarios.calendarioDataRetornoViagem = Util.criarCalendario('divDataRetornoViagem');
    }
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
    const beneficiario = "beneficiario";
    if (acaoZoom == AcaoZoom.SELECIONADO) {

      if (idSelecionado == beneficiario) {
        $("#cpfCpnjBeneficiario").val(Util.formataCPF(zoomItem["CGCCFO"]));

      }


    } else if (acaoZoom == AcaoZoom.REMOVIDO) {

      if (idSelecionado == beneficiario) {
        reloadZoomFilterValues("beneficiario", `PESSOAFISOUJUR,F`);
      }

    }
  }


  adicionarItem(event) {
    if ($('#solicitacaoCNPJContratoRM').val() ? $('#solicitacaoCNPJContratoRM').val()[0] : null) {
      const TABELA_ITEM = 'tableAdicionarItem';
      const indexLinhaCriada = wdkAddChild(TABELA_ITEM);
      formController.carregaFuncionalidadesTabela()
      const numeroContratoAtual = $('#solicitacaoRMContrato').val();
      if (Util.estaVazio(numeroContratoAtual)) {
        window[`itemContrato___${indexLinhaCriada}`].disable(true);
      } else {
        const coligada = $('#solicitacaoContratoCodColigada').val();
        reloadZoomFilterValues(`itemContrato___${indexLinhaCriada}`, `parameters,CODCOLIGADA=${coligada};CODCONTRATO=${numeroContratoAtual}`);
      }

      $('#unidadeItem___' + indexLinhaCriada).val('');
      $('#descricaoCentroCustoItem___' + indexLinhaCriada).val('');
      $('#valorUnitario___' + indexLinhaCriada).val('');
      $('#valorTotal___' + indexLinhaCriada).val('');

      this.carregaFuncionalidadesTabela()

      $('[id^=collapseItemContrato___]').not(':first').collapse()
    } else {
      Util.exibirToast('Atenção:', 'Para adicionar itens é necessário selecionar um fornecedor.', 'warning');
    }
  }

  deleteItem(elementRemovido) {
    fnWdkRemoveChild(elementRemovido);
    this.carregaFuncionalidadesTabela()
    if ($('#tableAdicionarItem tr').length - 2 == 0) {
      $("#valorNotaFiscal").val('');
      $("#valorTotalNotaFiscal").val('');
    }
  }

  carregaFuncionalidadesTabela(quantidade, valorUnitario, posicaoTabela) {

    $('.real').mask('#.##0,00', {
      reverse: true,
      placeholder: '0,00'
    });

    if (!Util.estaVazio(valorUnitario)) {
      var total = quantidade * Number(valorUnitario);

      $("#valorTotal___" + posicaoTabela).val(total.toLocaleString('pt-br', {
        minimumFractionDigits: 2
      }));

      let valorTotalNota = 0;
      $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))

      if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
        valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })) : $('#valorTotalNota').val('0,00');
        valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })) : $('#valorTotalNota').val('0,00');
      }

      $('#valorUnitario___' + posicaoTabela).val(!isNaN(parseFloat(valorUnitario)) ? parseFloat(valorUnitario).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).replace('R$', '') : '0,00');

      $('#quantidade___' + posicaoTabela).attr('readonly', false);
      $('#valorUnitario___' + posicaoTabela).attr('readonly', false);
    }

    $.makeArray($('input[id^="valorUnitario__"]')).forEach(input => {
      $(input).on("change", function (data) {

        var quantidade = $(input).parent().parent().parent().find('[id^="quantidade__"]').val();
        var valor = data.target.value;

        var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);

        $(input).parent().parent().parent().find('[name^="valorTotal__"').val(total.toLocaleString('pt-br', {
          minimumFractionDigits: 2
        }));

        let valorTotalNota = 0;
        $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))

        if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
          valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })) : $('#valorTotalNota').val('0,00');
          valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })) : $('#valorTotalNota').val('0,00');
        }

        if ($(input).parent().parent().find('[name^="valorTotal__"').val() == 'NaN') {
          $(input).parent().parent().find('[name^="valorTotal__"').val('0,00');
        }
      });
    });

    $.makeArray($('input[id^="quantidade___"]')).forEach(input => {
      $(input).on("change", function (data) {

        var valor = $(input).parent().parent().find('[name^="valorUnitario__"]').val();
        var quantidade = parseInt(data.target.value);

        var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);

        $(input).parent().parent().find('[name^="valorTotal__"').val(total.toLocaleString('pt-br', {
          minimumFractionDigits: 2
        }));

        let valorTotalNota = 0;
        $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))

        if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
          valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })) : $('#valorTotalNota').val('0,00');
          valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })) : $('#valorTotalNota').val('0,00');
        }

        if ($(input).parent().parent().find('[name^="valorTotal__"').val() == 'NaN') {
          $(input).parent().parent().find('[name^="valorTotal__"').val('0,00');
        }
      });
    });

    let valorTotalNota = 0;
    $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))
    if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
      valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
        minimumFractionDigits: 2
      })) : $('#valorTotalNota').val('0,00');
      valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', {
        minimumFractionDigits: 2
      })) : $('#valorTotalNota').val('0,00');
    }


    $.makeArray($('input[id^="unidadeItem_"]')).forEach(function (element, index) {
      $(element).parent().parent().parent().find('legend[id^="itemTabela"]').text("Item " + (index + 1));
    });
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

    inputs[`jsonPastas___${indiceLinhaAdicionada}`] = $("#jsonPastas").val();

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
      if ($(row).find("input[id^='painelHistorico1___']").val() == "Painel Assinatura") {

        let htmlPainelAssinatura = `
				<div class="panel panel-primary" id="painelAssinaturaEletronica___${indexHistorico}">
				<div class="panel-heading">
				<h4 class="panel-title">
				<a class="collapse-icon" data-toggle="collapse" href="#collapseAssinaturaEletronica___${indexHistorico}">
				<b>${indexHistorico}. Assinatura Eletrônica | ${$(row).find("input[id^='nomeSolicitanteHistorico___']").val()}</b>
				</a>
				</h4>
				</div>
				<div id="collapseAssinaturaEletronica___${indexHistorico}" class="panel-collapse collapse in">
				<div class="panel-body">
				<div class="row">
				<div class="tabelaAssinaturas___${indexHistorico}" id="tabelaAssinaturas___${indexHistorico}"></div>
				</div>
				</div>
				</div>
				</div>
				`

        /** INSERE PAINEL DE HISTÓRICO LOGO APÓS O PAINEL ORIGINAL DE SOLICITAÇÃO */
        $(htmlPainelAssinatura).insertAfter("#painelSolicitante")

        /** CHAMA MÉTODO PARA MONTAR TABLE DE ASSINANTES */
        let jsonAssinantes = JSON.parse($(row).find("input[id^='valuesCamposHistorico___']").val());
        Assinatura.carregarTabelaAssinaturasHistorico(jsonAssinantes, indexHistorico)

      } else {


        /** INSERE PAINEL DE HISTÓRICO LOGO APÓS O PAINEL ORIGINAL DE SOLICITAÇÃO */
        $(`<div class="panel panel-primary" id="idPainelHistorico___${indexHistorico}">` + $(row).find("input[id^='painelHistorico1___']").val() +
            $(row).find("input[id^='painelHistorico2___']").val() + $(row).find("input[id^='painelHistorico3___']").val() +
            $(row).find("input[id^='painelHistorico4___']").val() + "</div>")
          .insertAfter("#painelSolicitante")

        var valuesInputs = JSON.parse($(row).find("input[id^='valuesCamposHistorico___']").val())

        /** REMOVE CLASSES QUE FAZEM CONTROLE DA VISUALIZAÇÃO DO PAINEL */
        if (classesRemover.length > 0) {
          classesRemover.forEach(classe => {
            if (classe == `panel-info`) {
              $(`.panel-info`, $(`#idPainelHistorico___${indexHistorico}`)).addClass(`panel-primary`);
            }
            $(`#idPainelHistorico___${indexHistorico}`).find(`.${classe}`).removeClass(classe);
          });
        }

        /** ATUALIZA O VALOR DO HREF DOS COLLAPSES PARA QUE NÃO HAJA CONFLITO COM O PAINEL ORIGINAL */
        let hrefCollpase = $(`#idPainelHistorico___${indexHistorico}`).find("[href^='#collapse']").attr("href")
        $(`#idPainelHistorico___${indexHistorico}`).find("[href^='#collapse']").attr("href", "#" + (indexHistorico) + "_" + (hrefCollpase.split("#")[1]))

        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("[href^='#panel']")).forEach(fieldset => {
          let hrefFieldset = $(fieldset).attr("href");
          $(fieldset).attr("href", "#" + (indexHistorico) + "_" + (hrefFieldset.split("#")[1]))
        })

        /** ATUALIZA HEADER DO PAINEL HISTÓRICO, ADICIONANDO O INDICE, NOME DO SOLICITANTE E A DATA  */
        $(`#idPainelHistorico___${indexHistorico}`).find(`[href^='#${indexHistorico}_collapse']`).find("b")
          .before(`<b>${$(row).find("input[id^='indiceHistorico___']").val()}. </b>`)
          .after(`<span>  |  ${$(row).find("input[id^='nomeSolicitanteHistorico___']").val()} ${$(row).find("input[id^='dataHistorico___']").val()}</span>`)

        /** REMOVE BOTÕES DE ANEXAR E DE EXCLUIR ANEXO */
        $(`#idPainelHistorico___${indexHistorico}`).find(".laranja-cncoop").remove()

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

        /** Remove atributo detailname de todas as TR's */
        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("tr")).forEach(el => {
          $(el).removeAttr("detailname");
        });

        $(".bootstrap-tagsinput:not(.bootstrap-tagsinput-max)").each(function (key, element) {
          var a = $(element)[0].previousSibling
          $(a).show()
        });
        $(".bootstrap-tagsinput:not(.bootstrap-tagsinput-max)").hide()

        /** ALTERA CHAMADA VISUALIZAÇÃO DOS ANEXOS PARA O JSONPASTAS DO HISTÓRICO */
        let jsonPastasHist = valuesInputs[`jsonPastas___${indexHistorico}`]
        //jsonPastasHist = JSON.stringify(jsonPastasHist).replace(/\n/g, "\n").replace(/\r/g, "\r").replace(/\t/g, "\t");
        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find(`button[id^='${indexHistorico}_visualizar']`)).forEach(btn => {
          let categoria = $(btn).attr("onclick").split("'")[1]
          var idArquivo = null

          if (jsonPastasHist != "{}") {
            idArquivo = this.obterIdUltimoArquivoHistorico(jsonPastasHist, categoria)
          }

          if (idArquivo != null) {
            $(btn).on("onclick", function () {
              formController.visualizarArquivoCategoriaHistorico($("#jsonPastas").val(), categoria)
            })
          } else {
            $(btn).hide()
          }
        })

       

        $(`#idPainelHistorico___${indexHistorico}`).find(`div[id^='${indexHistorico}_field']`).removeAttr("style")
        $(`#idPainelHistorico___${indexHistorico}`).find(`fieldset[id^='${indexHistorico}_fieldset']`).removeAttr("style")
        $(`#idPainelHistorico___${indexHistorico}`).find(`table[id^='tablePaiFilho']`).removeAttr("style")
      }
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