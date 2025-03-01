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
        _onProductMatched: function (oEvent) {
          debugger;
          this._product =
            oEvent.getParameter("arguments").product || this._product || "0";
          if (this.getOwnerComponent().getModel("master3") !== undefined) {
            let datiElementoSelect = this.getOwnerComponent()
              .getModel("master3")
              .getProperty("/")
              .find((x) => (x.id = this._product));
            this.getView().setModel(
              new sap.ui.model.json.JSONModel(),
              "detailData"
            );
            this.getView()
              .getModel("detailData")
              .setProperty("/DettaglioMaster3", datiElementoSelect);
            // this._registerForP13n(oEvent);
            this._registerForP13n(oEvent, "tablePos");
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

            // MessageBox.confirm(message, {
            //   title: "Riepilogo",
            //   onClose: (oAction) => {
            //     debugger;
            //     if (oAction === sap.m.MessageBox.Action.OK) {
            //       debugger;
            //     }
            //   },
            // });

            //prova
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
