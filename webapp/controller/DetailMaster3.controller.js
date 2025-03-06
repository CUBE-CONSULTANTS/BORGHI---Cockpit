sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/formatter",
    "sap/m/MessageBox",
    "../model/API",
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,  
    formatter,
    MessageBox,
    API,
  ) {
    "use strict";

    return BaseController.extend(
      "programmi.consegne.edi.controller.DetailMaster3",
      {
        formatter: formatter,
        onInit: function () {
          this.getRouter()
            .getRoute("detailMaster3")
            .attachPatternMatched(this._onProductMatched, this);
        },
        _onProductMatched: async function (oEvent) {
          debugger;
          this._id = oEvent.getParameter("arguments").id || this._id || "0";
          this._idMaster = oEvent.getParameter("arguments").idmaster || this._id || "0";
          try {
            this.showBusy(0)
            let dettaglio = await API.readByKey( this.getOwnerComponent().getModel("modelloV2"), "/Testata", {id: this._id, id_master: this._idMaster}, [], [
              "posizioni($filter=stato ne '53'),posizioni($expand=log,schedulazioni,testata),master",
            ])
            // dettaglio.master.data_ricezione = formatter.formatDateString(dettaglio.master.data_ricezione)
            let detailModel = new JSONModel(dettaglio);
            detailModel.getProperty("/posizioni/results").forEach((pos) => {  
              pos.log = Object.values(pos.log.results);
            });
            this.setModel(detailModel,"detailData");
            this._registerForP13n(oEvent, "tablePos")
          } catch (error) {
            MessageBox.error("Errore durante la ricezione dei Dati")
          } finally {
            this.hideBusy(0)
          }  
        },
        onProcessaButton: function (oEvent) {
          debugger;

          let table = this.getView().byId("tablePos");
          let indices = table.getSelectedIndices();
          let items = [];
          let self = this;

          if (indices.length != 0) {
            items = indices.map(function (iIndex) {
              return table.getContextByIndex(iIndex).getObject();
            });
            let itemList = items
              .map(
                (item) =>
                  `Codice cliente materiale: ${item.codice_cliente_materiale} - ID: ${item.id} - Codice materiale fornitore: ${item.codice_materiale_fornitore}\n`
              )
              .join("");
            let message = `Vuoi continuare con questi elementi? \n ${itemList}`;
            sap.m.MessageBox.confirm(message, {
              icon: sap.m.MessageBox.Icon.WARNING,
              title: "Riepilogo",
              actions: [
                sap.m.MessageBox.Action.YES,
                sap.m.MessageBox.Action.NO,
              ],
              emphasizedAction: sap.m.MessageBox.Action.YES,
              onClose: async function (oAction) {
                if (oAction == "YES") {
                  let payload = [];
                  items.forEach((x) => {
                    payload.push(x.id);
                  });

                  let obj = { id: payload };

                  let oModel = this.getOwnerComponent().getModel("modelloV2");
                  this.showBusy(0);
                  try {
                    let res = await API.createEntity(
                      oModel,
                      "/Processamento",
                      obj
                    );
                  } catch (error) {
                    console.log(error);
                  } finally {
                    this.hideBusy(0);
                  }

                  debugger;

                  let modelloReport = new JSONModel({
                    successo: "",
                    errore: "",
                  });
                  this.setModel(modelloReport, "modelloReport");
                  let success = [];
                  let error = [];
                  res.results.forEach((x) => {
                    if (x.status === "51") {
                      debugger;
                      let el = items.find((y) => x.id === y.id);
                      success.push(el);
                    } else {
                      let el = items.find((y) => x.id === y.id);
                      error.push(el);
                    }
                  });

                  this.getModel().setProperty("/successo", success);
                  this.getModel().setProperty("/errore", error);
                  debugger;

                  if (!this._fragment) {
                    Fragment.load({
                      name: "programmi.consegne.edi.view.fragments.reportDelfor",
                      controller: this,
                    }).then(
                      function (oFragment) {
                        this._fragment = oFragment;
                        this._fragment.setModel(modelloReport);
                        this.getView().addDependent(this._fragment);

                        this._fragment.open();
                      }.bind(this)
                    );
                  } else {
                    this._fragment.setModel(modelloReport);
                    this._fragment.open();
                  }
                } else {
                  
                }
              }.bind(this),
            });
          } else {
            MessageBox.alert("Si prega di selezionare almeno una posizione");
          }
        },

        buttonDetailSched: function (oEvent) {
          debugger;
          let detailPath = oEvent
            .getSource()
            .getParent()
            .getBindingContext("detailData")
            .getPath();

          let detail = this.getView()
            .getModel("detailData")
            .getProperty(`${detailPath}`);

          this.getOwnerComponent()
            .getModel("datiAppoggio")
            .setProperty("/schedulazioni", detail.schedulazioni.results);

          this.getOwnerComponent()
            .getModel("datiAppoggio")
            .setProperty("/posizioneCorrente", detail);

          let oNextUIState;
          this.getOwnerComponent()
            .getHelper()
            .then(
              function (oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                this.getRouter().navTo("Detail2Master3", {
                  product: detail.id,
                  layout: oNextUIState.layout,
                });
              }.bind(this)
            );
        },
      }
    );
  }
);
