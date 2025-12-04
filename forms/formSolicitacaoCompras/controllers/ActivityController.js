class Activity {
  static get INICIO() {
    return 4;
  }
  static get INICIO_PADRAO() {
    return 0;
  }
  static get APROVACAO() {
    return 5;
  }
  static get CORRIGIR() {
    return 11;
  }
  static get INTEGRACAO_PROTHEUS() {
    return 15;
  }
  static get VERIFICA_INTEGRACAO_PROTHEUS() {
    return 17;
  }
  static get ATUALIZA_APROVACAO() {
    return 21;
  }
  static get VERIFICA_ATUALIZA_APROVACAO() {
    return 23;
  }
  static get VERIFICA_APROVADORES() {
    return 37;
  }
  static get FIM() {
    return 7;
  }
  static get CANCELADO() {
    return 44;
  }
}

class ActivityController {
  constructor(type, currentActivity) {
    this._activityController = {
      [Activity.INICIO]: this._controllerActivityInicio,
      [Activity.INICIO_PADRAO]: this._controllerActivityInicio,
      [Activity.APROVACAO]: this._controllerActivityAprovacao,
      [Activity.CORRIGIR]: this._controllerActivityCorrigir,
      [Activity.FIM]: this._controllerActivityFim,
      [Activity.CANCELADO]: this._controllerActivityFim,
      [Activity.INTEGRACAO_PROTHEUS]: this._controllerActivityFim,
      [Activity.VERIFICA_INTEGRACAO_PROTHEUS]: this._controllerActivityFim,
      [Activity.VERIFICA_APROVADORES]: this._controllerActivityFim,
      [Activity.ATUALIZA_APROVACAO]: this._controllerActivityFim,
      [Activity.VERIFICA_ATUALIZA_APROVACAO]: this._controllerActivityFim,
    }

    this._activityView = {
      [Activity.INICIO]: this._viewActivityInicio,
      [Activity.INICIO_PADRAO]: this._viewActivityInicio,
      [Activity.CORRIGIR]: this._viewActivityCorrigir,
      [Activity.APROVACAO]: this._viewActivityAprovacao,
      [Activity.FIM]: this._viewActivityFim,
      [Activity.CANCELADO]: this._viewActivityFim,
      [Activity.INTEGRACAO_PROTHEUS]: this._viewActivityFim,
      [Activity.VERIFICA_INTEGRACAO_PROTHEUS]: this._viewActivityFim,
       [Activity.VERIFICA_APROVADORES]: this._viewActivityFim,
      [Activity.ATUALIZA_APROVACAO]: this._viewActivityFim,
      [Activity.VERIFICA_ATUALIZA_APROVACAO]: this._viewActivityFim,
    }

    this._activityValidate = {
      [Activity.INICIO]: this._validateActivityInicio,
      [Activity.INICIO_PADRAO]: this._validateActivityInicio,
      [Activity.APROVACAO]: this._validateActivityAprovacao,
      [Activity.CORRIGIR]: this._validateActivityCorrigir,
      [Activity.FIM]: this._validateActivityFim,
      [Activity.CANCELADO]: this._validateActivityFim,
      [Activity.INTEGRACAO_PROTHEUS]: this._validateActivityFim,
      [Activity.VERIFICA_INTEGRACAO_PROTHEUS]: this._validateActivityFim,
      [Activity.VERIFICA_APROVADORES]: this._validateActivityFim,
      [Activity.ATUALIZA_APROVACAO]: this._validateActivityFim,
      [Activity.VERIFICA_ATUALIZA_APROVACAO]: this._validateActivityFim,
    }

    this._accessFormType = type;
    this._activity = currentActivity;

    window['beforeSendValidate'] = (numState, nextState) => this._activityValidate[this._activity](numState, nextState);
  }

  _controllerActivityInicio(formMode, atividade, formView, formController) {

    // Reforçar para manter a div de cancelar oculta
    $("#divCancelarDecisao").addClass('hidden');

    window.rowIndex['tbItens'] > 0 ? $("#tbItens tr").not(':first').not(':first').show() : ""
    if (atividade == 11) {
      formController.carregaFuncionalidadesTabela()
      formView.ocultarPainel(
        Painel.APROVACAO_GERENTE);
    } else {
      formView.ocultarPainel(
        Painel.HISTORICO_APROVACOES,
        Painel.APROVACAO_GERENTE);
    }

    Util.destacarAtividadeAtual('#painelSolicitacao');
  }

  _viewActivityInicio(formMode, atividade, formView, formController) {
    if (atividade == 11) {
      formView.ocultarPainel(
        Painel.APROVACAO_GERENTE);
    } else {
      formView.ocultarPainel(
        Painel.HISTORICO_APROVACOES,
        Painel.APROVACAO_GERENTE);
    }
  }

  _validateActivityInicio(numState, nexState) {
    let errorMsg = '';
    let endOfLine = '</br>';
    $('.has-error').removeClass('has-error');
    try {

      

      if (Util.estaVazio($("#hidden_codComprador").val())) {
        $("#hidden_codComprador").parent('div').addClass('has-error');
        errorMsg += 'Informe o Comprador.' + endOfLine;
      }

      if (Util.estaVazio($("#hidden_filialEntrega").val())) {
        $("#hidden_filialEntrega").parent('div').addClass('has-error');
        errorMsg += 'Informe a Filial de Entrega.' + endOfLine;
      }

      if (Util.estaVazio($("#justificativaSC").val())) {
        $("#justificativaSC").parent('div').addClass('has-error');
        errorMsg += 'Informe a Justificativa.' + endOfLine;
      }

      if (window.rowIndex['tbItens'] == 0) {
        $('#botaoAdicionarProduto').removeClass('btn-info');
        $('#botaoAdicionarProduto').addClass('btn-danger');
        errorMsg += 'Adicione pelo menos um Item da SC.' + endOfLine;
      } else {
        $('#tbItens').each((key, linhaTabela) => {
          let elementInput = $(linhaTabela).find('[name^="hidden_produto_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe o Produto na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="hidden_contaContabil_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe a Conta Contábil na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="hidden_centroCusto_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe o Centro de Custo na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="quantidade_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe a Quantidade na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="valorUn___"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe o Valor Unitário na posição nº: ' + (key + 1) + endOfLine;
          }
        })
      }

    } catch (error) {
      if (errorMsg != '') {
        throw errorMsg;
      } else {
        throw 'Erro interno do servidor, recarregue a página utilizando a tecla "F5" e tente novamente. Caso o erro persista informe ao TI quais passos você tomou e a seguinte mensagem: ' + error;
      }
    }

    if (errorMsg != '') {
      throw errorMsg;
    }



    if (errorMsg != '') {
      throw errorMsg;
    } else {
      if (WKNumState == 11) {
        FormController.salvarPainelHistorico('painelSolicitacao', 'dataCorrecao', 'nomeCorrecao')
      } else FormController.salvarPainelHistorico('painelSolicitacao', 'dataHoraSolic', 'solicitanteNome')
    };
  }


   _controllerActivityCorrigir(formMode, atividade, formView, formController) {

    // Tornar a div de cancelar visível na correção
    $("#divCancelarDecisao").removeClass('hidden');

    $("#hidden_decisao_cancelar").val("")
    $("[name=decisaoCancelar]").prop("checked", false)

    $("[name='decisaoCancelar']").on("click", function (event) {
      $("#hidden_decisao_cancelar").val($(this).val())
    })

    window.rowIndex['tbItens'] > 0 ? $("#tbItens tr").not(':first').not(':first').show() : ""
    if (atividade == 11) {
      formController.carregaFuncionalidadesTabela()
      formView.ocultarPainel(
        Painel.APROVACAO_GERENTE);
    } else {
      formView.ocultarPainel(
        Painel.HISTORICO_APROVACOES,
        Painel.APROVACAO_GERENTE);
    }

    Util.destacarAtividadeAtual('#painelSolicitacao');
  }

  _viewActivityCorrigir(formMode, atividade, formView, formController) {
    if (atividade == 11) {
      formView.ocultarPainel(
        Painel.APROVACAO_GERENTE);
    } else {
      formView.ocultarPainel(
        Painel.HISTORICO_APROVACOES,
        Painel.APROVACAO_GERENTE);
    }
  }

  _validateActivityCorrigir(numState, nexState) {
    let errorMsg = '';
    let endOfLine = '</br>';
    $('.has-error').removeClass('has-error');
    try {

      

      if (Util.estaVazio($("#hidden_codComprador").val())) {
        $("#hidden_codComprador").parent('div').addClass('has-error');
        errorMsg += 'Informe o Comprador.' + endOfLine;
      }

      if (Util.estaVazio($("#hidden_filialEntrega").val())) {
        $("#hidden_filialEntrega").parent('div').addClass('has-error');
        errorMsg += 'Informe a Filial de Entrega.' + endOfLine;
      }

      if (Util.estaVazio($("#justificativaSC").val())) {
        $("#justificativaSC").parent('div').addClass('has-error');
        errorMsg += 'Informe a Justificativa.' + endOfLine;
      }

      // Validação da decisão de cancelamento
      if (Util.estaVazio($("#hidden_decisao_cancelar").val())) {
        $("[name='decisaoCancelar']").closest('.vf-decisao-group').addClass('has-error');
        errorMsg += 'Informe se deseja cancelar a solicitação.' + endOfLine;
      }

      if (window.rowIndex['tbItens'] == 0) {
        $('#botaoAdicionarProduto').removeClass('btn-info');
        $('#botaoAdicionarProduto').addClass('btn-danger');
        errorMsg += 'Adicione pelo menos um Item da SC.' + endOfLine;
      } else {
        $('#tbItens').each((key, linhaTabela) => {
          let elementInput = $(linhaTabela).find('[name^="hidden_produto_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe o Produto na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="hidden_contaContabil_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe a Conta Contábil na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="hidden_centroCusto_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe o Centro de Custo na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="quantidade_"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe a Quantidade na posição nº: ' + (key + 1) + endOfLine;
          }
          elementInput = $(linhaTabela).find('[name^="valorUn___"]');
          if (Util.estaVazio($(elementInput).val())) {
            $(elementInput).parent().addClass('has-error');
            errorMsg += 'Informe o Valor Unitário na posição nº: ' + (key + 1) + endOfLine;
          }
        })
      }

    } catch (error) {
      if (errorMsg != '') {
        throw errorMsg;
      } else {
        throw 'Erro interno do servidor, recarregue a página utilizando a tecla "F5" e tente novamente. Caso o erro persista informe ao TI quais passos você tomou e a seguinte mensagem: ' + error;
      }
    }

    if (errorMsg != '') {
      throw errorMsg;
    }



    if (errorMsg != '') {
      throw errorMsg;
    } else {
      if (WKNumState == 11) {
        FormController.salvarPainelHistorico('painelSolicitacao', 'dataCorrecao', 'nomeCorrecao')
      } else FormController.salvarPainelHistorico('painelSolicitacao', 'dataHoraSolic', 'solicitanteNome')
    };
  }


  _controllerActivityAprovacao(formMode, atividade, formView, formController) {

    formView.ocultarPainel(
      Painel.SOLICITACAO);

    $("[name=decisao]").prop("checked", false)
    $("label[for=justificativaAprov]").html('Observação:');
    $("#hidden_decisao").val("")
    $("#justificativaAprov").val("")


    $("[name='decisao']").on("click", function (event) {
      $("#hidden_decisao").val($(this).val())
      if ($(this).val() == "APROVAR") {
        $("label[for=justificativaAprov]").html('Observação:').removeClass("required");
      } else {
        $("label[for=justificativaAprov]").html('Justificativa:').addClass("required")
      }
    })

    Util.destacarAtividadeAtual('#panelAprovacao');
  }

  _viewActivityAprovacao(formMode, atividade, formView, formController) {
    formView.ocultarPainel(
      Painel.SOLICITACAO);
  }

  _validateActivityAprovacao(numState, nexState) {

    let errorMsg = '';
    let endOfLine = '</br>';
    $('.has-error').removeClass('has-error');
    try {
      if (Util.estaVazio($("#hidden_decisao").val())) {
        $("[id^='decisao_']").parent('div').addClass('has-error');
        errorMsg += 'Informe se a solicitação está aprovada.' + endOfLine;
      } else {
        if ($("#hidden_decisao").val() == 'REPROVAR') {
          if (Util.estaVazio($("#justificativaAprov").val())) {
            $("#justificativaAprov").parent('div').addClass('has-error');
            errorMsg += 'Observação da reprovação precisa ser adicionada.' + endOfLine;
          }

        }

      }

    } catch (error) {
      if (errorMsg != '') {
        throw errorMsg;
      } else {
        throw 'Erro interno do servidor, recarregue a página utilizando a tecla "F5" e tente novamente. Caso o erro persista informe ao TI quais passos você tomou e a seguinte mensagem: ' + error;
      }
    }

    if (errorMsg != '') {
      throw errorMsg;
    }

    if (errorMsg != '') {
      throw errorMsg;
    } else {
      FormController.salvarPainelHistorico('panelAprovacao', 'dataHoraAprov', 'aprovadorNome')
    };
  }


  _controllerActivityFim(formMode, atividade, formView, formController) {
    formView.ocultarPainel(
      Painel.SOLICITACAO,
      Painel.APROVACAO_GERENTE
    );
  }

  _viewActivityFim(formMode, atividade, formView, formController) {
    formView.ocultarPainel(
      Painel.SOLICITACAO,
      Painel.APROVACAO_GERENTE
    );
  }

  _validateActivityFim(numState, nexState) { }

}