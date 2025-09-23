class Painel {
  static get SOLICITACAO() {
    return "painelSolicitacao";
  }

  static get APROVACAO_GERENTE() {
    return "panelAprovacao";
  }

  static get HISTORICO_APROVACOES() {
    return "painelHistoricoAprovacoes";
  }

}

class TipoExibicaoPainel {
  static get MOSTRAR_BLOQUEAR() {
    return 'mostrarBloquear';
  }
  static get OCULTAR() {
    return 'ocultar';
  }
}

class FormView {
  constructor() {
    this.formController = null;
    this.paineis = {
      [Painel.SOLICITACAO]: {
        [TipoExibicaoPainel.MOSTRAR_BLOQUEAR]: this._bloquearMostrarSolicitacao,
      },
      [Painel.APROVACAO_GERENTE]: {
        [TipoExibicaoPainel.MOSTRAR_BLOQUEAR]: this._bloquearMostrarAprovGerente,
      },
      [Painel.HISTORICO_APROVACOES]: {
        [TipoExibicaoPainel.MOSTRAR_BLOQUEAR]: this._bloquearMostrarHistoricoAprovacoes,
      },
    }
  }

  _bloquearMostrarSolicitacao() {}
  _bloquearMostrarAprovGerente() {}
  _bloquearMostrarHistoricoAprovacoes() {}

  setFormController(formController) {
    this.formController = formController;
  }

  mostrarBloquearCampos(...paineis) {
    console.log("AAA: ",TipoExibicaoPainel.MOSTRAR_BLOQUEAR);
    console.log("BBB: ",this.formController);
    console.log("CCC: ",paineis);
    for (const painel of paineis) {
      this.paineis[painel][TipoExibicaoPainel.MOSTRAR_BLOQUEAR](this.formController);
    }
  }

  ocultarPainel(...paineis) {
    for (const painel of paineis) {
      $(`#${painel}`).hide();
    }
  }

}