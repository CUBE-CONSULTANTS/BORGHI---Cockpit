sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "../model/API",
    "../model/models",
    "sap/ui/core/format/DateFormat",
  ],
  function (
    BaseController,
    JSONModel,
    Sorter,
    CoreLibrary,
    Fragment,
    MessageBox,
    API,
    models,
    DateFormat
  ) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return BaseController.extend("programmi.consegne.edi.controller.Master3", {
      onInit: function () {
        this.oRouter = this.getOwnerComponent().getRouter();
        this.onFilterSelect(null, "01");
        this.setModel(models.createEdiFiltersModel(), "filtersModel");
        this._bAscendente 
      },
      _onObjectMatched: function (oEvent) {
        this.onFilterSelect(null, "01");
      },
      onFilterSelect: async function (oEvent, key) {
        this.showBusy(0);
        var selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        let oModel;
        let metadata;
        switch (selectedKey) {
          case "01":
            oModel = this.getOwnerComponent().getModel("modelloV2");
            await this.callData(oModel, "/Testata", [], ["posizioni,posizioni/schedulazioni,posizioni/log"],key)
            
            this.onFiltersBuilding(oEvent, key);
            break;
          case "02":
            oModel = this.getOwnerComponent().getModel("calloffV2");
            metadata = await API.getEntity(
              oModel,
              "/Testata",
              [],
              ["posizioni"]
            );

            break;
          case "03":
            var oMaster3Model = new JSONModel(
              sap.ui.require.toUrl(
                "programmi/consegne/edi/mockdata/dataMaster3.json"
              )
            );
            this.getOwnerComponent().setModel(oMaster3Model, "master3");
            // this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "04":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            this.byId("idDataConsegna").setProperty(
              "label",
              "Data di uscita merci"
            );
            this.byId("idDataConsegna").setProperty(
              "name",
              "Data di uscita merci"
            );
            break;
          case "05":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "06":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "07":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
        }
        this.hideBusy(0);
      },

      sortCategories: function (oEvent) {
        let oTable;
        let oBinding;
        let aSorters = [];
        let bAscendente = this._bAscendente || true;
        if (this.getView().byId("idIconTabBar").getSelectedKey() === "01") {
          let oSorterSeller = new sap.ui.model.Sorter("codice_seller", false);
          let oSorterNumProg = new sap.ui.model.Sorter(
            "numero_progressivo_invio",
            false
          );
          aSorters = [oSorterSeller, oSorterNumProg];
          oTable = this.byId("treetableMain");
          oBinding = oTable.getBinding("rows");
          oBinding.sort(aSorters);
          this._bAscendente = !bAscendente;
        }
      },
      deletePress: function (oEvent) {
        this.getView().byId("table");
      },
      onPressRow: function (oEvent) {
        var index = oEvent.getParameter("rowIndex");
        if (index === 0) {
          this.getView().byId("buttonDelete").setProperty("enabled", false);
        } else {
          this.getView().byId("buttonDelete").setProperty("enabled", true);
        }
      },

      navToHome: function () {
        this.oRouter.navTo("home");
      },

      onProcessaButton: function (oEvent) {
        debugger;
        // let indici = oEvent
        //   .getSource()
        //   .getParent()
        //   .getParent()
        //   .getSelectedIndices();
        // let data = this.getView().getModel("master3").getData().Master3;
        // let selected = [];
        // indici.forEach((x) => {
        //   selected.push(data[x]);
        // });
        // let flag = 0;
        // selected.forEach((y) => {
        //   if (y.Stato == "KO") {
        //     flag++;
        //   }
        // });
        // if (flag > 0) {
        //   console.log("errori nel processo");
        // } else {
        //   if (!this._oDialog) {
        //     Fragment.load({
        //       id: this.getView().getId(),
        //       name: "programmi.consegne.edi.view.fragments.linkDialogMaster3",
        //       controller: this,
        //     }).then(
        //       function (oDialog) {
        //         this._oDialog = oDialog;
        //         this.getView().addDependent(this._oDialog);
        //         this._oDialog.open();
        //       }.bind(this)
        //     );
        //   } else {
        //     this._oDialog.open();
        //   }
        // }

        let table = this.getView().byId("treetableMain");
        let indices = this.getView().byId("treetableMain").getSelectedIndices();
        let selectedOBJS = [];
        let self = this;

        if (indices) {
          indices.forEach((element) => {
            debugger;
            let obj = self
              .getView()
              .byId("treetableMain")
              .getContextByIndex(element)
              .getObject();

            if (obj.hasOwnProperty("DelforTestata")) {
              MessageBox.alert(
                "Essendo stata selezionata una riga di testata verranno processate tutte le posizioni collegate"
              );
              selectedOBJS = obj.DelforPosizioni;
            } else {
              selectedOBJS.push(obj);
            }
          });

          debugger;
          let textMessage = "";
          selectedOBJS.forEach((item) => {
            textMessage += `Progressivo invio: ${item.progressivo_invio}; Codice cliente: ${item.codice_cliente_materiale}; Materiale: ${item.descrizione_materiale}; Destinatario: ${item.destinatario} \n`;
          });

          MessageBox.confirm(textMessage, {
            title: "Riepilogo",
            onClose: (oAction) => {
              if (oAction === sap.m.MessageBox.Action.OK) {
                if (!this._oDialog) {
                  Fragment.load({
                    id: this.getView().getId(),
                    name: "programmi.consegne.edi.view.fragments.linkDialogMaster3",
                    controller: this,
                  }).then(
                    function (oDialog) {
                      this._oDialog = oDialog;
                      this.getView().addDependent(this._oDialog);
                      this._oDialog.open();
                    }.bind(this)
                  );
                } else {
                  this._oDialog.open();
                }
              } else {
                console.log("Annullato");
              }
            },
          });
        } else {
          MessageBox.alert("Si prega di selezionare almeno una posizione");
        }
      },

      onclose: function (oEvent) {
        oEvent.getSource().getParent().close();
      },

      importaPress: function (oEvent) {
        if (!this._oDialog2) {
          Fragment.load({
            id: this.getView().getId(),
            name: "programmi.consegne.edi.view.fragments.importMaster3",
            controller: this,
          }).then(
            function (oDialog2) {
              this._oDialog2 = oDialog2;
              this.getView().addDependent(this._oDialog2);
              this._oDialog2.open();
            }.bind(this)
          );
        } else {
          this._oDialog2.open();
        }
      },
      rowDetailPress: function (detailPath) {
        // var detailPath = oEvent.getParameter("rowBindingContext").getPath()
        let detailRowIndex = detailPath.split("/").slice(-1).pop();
        let detail = this.getView()
          .getModel("master3")
          .getProperty(`/Master3/${detailRowIndex}/DelforTestata/id`);
        let oNextUIState;
        this.getOwnerComponent()
          .getHelper()
          .then(
            function (oHelper) {
              oNextUIState = oHelper.getNextUIState(1);
              this.oRouter.navTo("detailMaster3", {
                product: detail,
                layout: oNextUIState.layout,
              });
            }.bind(this)
          );
      },
      dettaglioNav: function (oEvent) {
        debugger;
        let level = oEvent
          .getSource()
          .getParent()
          .getBindingContext("master3")
          .getPath()
          .includes("posizioni");
        // let detailSched = oEvent.getSource().getParent().getBindingContext("master3").getObject().DelforSchedulazioni
        let detailPath = oEvent
          .getSource()
          .getParent()
          .getBindingContext("master3")
          .getPath();
        let detail = this.getView()
          .getModel("master3")
          .getProperty(`${detailPath}`);

        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/testata", detail);
        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/posizioni", detail.posizioni);
        if (level) {
          debugger;
          let oNextUIState;
          this.getOwnerComponent()
            .getHelper()
            .then(
              function (oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                this.oRouter.navTo("Detail2Master3", {
                  product: detail.id,
                  layout: oNextUIState.layout,
                });
              }.bind(this)
            );
        } else {
          let path = oEvent
            .getSource()
            .getParent()
            .getBindingContext("master3")
            .getPath();
          this.oRouter.navTo("detailMaster3", {
            product: detail.id,
            layout: "OneColumn",
          });
        }
      },

      statoButtonPress: function (oEvent) {
        debugger;
        MessageBox.error("Errori nel processamento delle posizioni.", {
          title: "Error",

          details: "<p><strong>This can happen if:</strong></p>",
          contentWidth: "100px",
          dependentOn: this.getView(),
        });
      },

      onCollapseAll: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.collapseAll();
      },

      onCollapseSelection: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.collapse(oTreeTable.getSelectedIndices());
      },

      onExpandFirstLevel: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.expandToLevel(1);
      },

      onExpandSelection: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.expand(oTreeTable.getSelectedIndices());
      },

      navToAPP: function (oEvent) {
        debugger;
        let level = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getBindingContext("master3")
          .getPath();
        if (level.includes("DelforPosizioni")) {
          this.getRouter().navTo("master");
        } else {
          this.getRouter().navTo("master2");
        }
      },

      prova2: function (oEvent) {
        debugger;
        let table = this.byId("treetableMain");
        let row = oEvent.getParameter("rowContext").getObject();
      },
      // loadFragment: function (oEvent) {
      //   if (!this._oMyFragment) {
      //     this._oMyFragment = sap.ui.xmlfragment(
      //       // this.getView().getId(),
      //       "programmi.consegne.edi.view.fragments.deliveryMaster3",
      //       this
      //     );

      //     // this.getView()
      //     //   .getContent()[0]
      //     //   .getContent()
      //     //   .getContent()[0]
      //     //   .addContent(this._oMyFragment.oFragment);
      //     // this.getView()
      //     //   .getContent()[0]
      //     //   .getContent()
      //     //   .getContent()
      //     //   .addContent(this._oMyFragment.oFragment);

      //     this.getView()
      //       .getContent()[0]
      //       .getContent()
      //       .addDependent(this._oMyFragment.oFragment);
      //   }
      // },
    });
  }
);
