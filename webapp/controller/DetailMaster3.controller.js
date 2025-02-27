sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/MetadataHelper",
    "sap/ui/model/Sorter",
    "sap/ui/core/library",
    "../model/formatter"
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,
    Engine,
    SelectionController,
    SortController,
    GroupController,
    MetadataHelper,
    Sorter,
    CoreLibrary,
    formatter
  ) {
    "use strict";

    return BaseController.extend(
      "programmi.consegne.edi.controller.DetailMaster3",
      {
        formatter: formatter,
        onInit: function () {
          this.getRouter().getRoute("detailMaster3").attachPatternMatched(this._onProductMatched, this);
        },
        _onProductMatched: function (oEvent) {
          debugger;
          this._product =
            oEvent.getParameter("arguments").product || this._product || "0";
          ///prova anthea binding su table
          // let datiElementoSelect=this.getOwnerComponent().getModel("master3").getProperty(`/Master3/${this._product}`)
          let datiElementoSelect = this.getOwnerComponent()
            .getModel("master3")
            .getProperty("/")
            .find((x) => (x.id = this._product));
          // datiElementoSelect.DelforPosizioni =
          //   datiElementoSelect.DelforPosizioni.flat();
          this.getView().setModel(
            new sap.ui.model.json.JSONModel(),
            "detailData"
          );
          this.getView()
            .getModel("detailData")
            .setProperty("/DettaglioMaster3", datiElementoSelect);
          // this.getView().bindElement({
          // 	path: "/ProductCollection/" + this._product,
          // 	model: "products"
          // });

          this._registerForP13n(oEvent);
        },
        onProcessaButton: function (oEvent) {
          debugger;
          let indici = this.getView()
            .byId("tablePos")
            .getSelectedIndices();
          let data = this.getView().getModel("master3").getData().Master3;
          let selected = [];
          indici.forEach((x) => {
            selected.push(data[x]);
          });
          let flag = 0;
          selected.forEach((y) => {
            if (y.Stato == "KO") {
              flag++;
            }
          });
          if (flag > 0) {
            console.log("errori nel processo");
          } else {
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

        _registerForP13n: function (oEvent) {
          debugger
          let oTable = this.byId("tablePos")
          this.oMetadataHelper = new MetadataHelper([
            {
              key: "destinatario_col",
              label: "Destinatario",
              path: "destinatario",
            },
            {
              key: "codice_cliente_materiale_col",
              label: "Codice cliente materiale",
              path: "codice_cliente_materiale",
            },
            {
              key: "codice_materiale_fornitore_col",
              label: "Codice materiale fornitore",
              path: "codice_materiale_fornitore",
            },
            {
              key: "descrizione_materiale_col",
              label: "Descrizione materiale",
              path: "descrizione_materiale",
            },
            {
              key: "punto_scarico_col",
              label: "Punto di scarico",
              path: "punto_scarico",
            },
            {
              key: "destinazione_interna_col",
              label: "Destinazione interna",
              path: "destinazione_interna",
            },
            {
              key: "testo_riga_col",
              label: "Testo riga",
              path: "testo_riga",
            },
            {
              key: "data_inizio_calc_quantita_cumulata_col",
              label: "Data inizio calcolo quantità cumulata",
              path: "data_inizio_calc_quantita_cumulata",
            },
            {
              key: "progressivo_invio_col",
              label: "Progressivo invio",
              path: "progressivo_invio",
            },
            {
              key: "data_progressivo_invio_col",
              label: "Data progressivo invio",
              path: "data_progressivo_invio",
            },
            {
              key: "numero_ultima_schedulazione_ricevuta_col",
              label: "Numero Ultima Schedulazione Ricevuta",
              path: "numero_ultima_schedulazione_ricevuta",
            },
            {
              key: "data_numero_ultima_schedulazione_ricevuta_col",
              label: "Data Numero Ultima Schedulazione Ricevuta",
              path: "data_numero_ultima_schedulazione_ricevuta",
            },
            {
              key: "numero_ordine_acquisto_col",
              label: "Numero ordine di acquisto",
              path: "numero_ordine_acquisto",
            },
            {
              key: "ultima_quantita_spedita_col",
              label: "Ultima quantità spedita",
              path: "ultima_quantita_spedita",
            },
            {
              key: "numero_ultima_bolla_ricevuta_cliente_col",
              label: "Numero Ultima bolla ricevuta dal cliente",
              path: "numero_ultima_bolla_ricevuta_cliente",
            },
            {
              key: "data_ultima_bolla_ricevuta_col",
              label: "Data ultima bolla ricevuta",
              path: "data_ultima_bolla_ricevuta",
            },
            {
              key: "quantita_cumulativa_ricevuta_col",
              label: "Quantità cumulativa ricevuta",
              path: "quantita_cumulativa_ricevuta",
            },
            {
              key: "ultima_quantita_ordinata_col",
              label: "Ultima quantità ordinata",
              path: "",
            },
            {
              key: "release_number_col",
              label: "Release number",
              path: "",
            },
            {
              key: "quantita_cumulativa_precedente_col",
              label: "Quantità cumulativa precedente",
              path: "",
            },
            {
              key: "quantita_in_backorder_col",
              label: "Quantità in backorder",
              path: "",
            },
            {
              key: "quantita_ricevuta_e_accettata_col",
              label: "Quantità ricevuta e accettata",
              path: "",
            },
            {
              key: "contatto_cliente_col",
              label: "Contatto cliente",
              path: "contatto_cliente",
            },
            {
              key: "informazioni_contatto_email_col",
              label: "Info contatto email",
              path: "informazioni_contatto_email",
            },
            {
              key: "informazioni_contatto_telefonico_col",
              label: "Info contatto telefonico",
              path: "informazioni_contatto_telefonico",
            },
            {
              key: "informazioni_contatto_fax_col",
              label: "Info contatto fax",
              path: "informazioni_contatto_fax",
            },
          ]);
          debugger;
          this._mIntialWidth = {
            firstName_col: "11rem",
            lastName_col: "11rem",
            city_col: "11rem",
            size_col: "11rem",
          };

          Engine.getInstance().register(oTable, {
            helper: this.oMetadataHelper,
            controller: {
              Columns: new SelectionController({
                targetAggregation: "columns",
                control: oTable,
              }),
              Sorter: new SortController({
                control: oTable,
              }),
              Groups: new GroupController({
                control: oTable,
              }),
            },
          });

          Engine.getInstance().attachStateChange(
            this.handleStateChange.bind(this)
          );
        },

        openPosizioniDialog: function (oEvent) {
          let oTable = this.byId("tablePos")
          Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
            contentHeight: "35rem",
            contentWidth: "32rem",
            source: oEvent.getSource(),
          });
        },

        _getKey: function (oControl) {
          return oControl.data("p13nKey");
        },

        handleStateChange: function (oEvt) {
          debugger;
          const oTable = oEvt.getSource();
          const oState = oEvt.getParameter("state");

          if (!oState) {
            return;
          }

          oTable.getColumns().forEach(
            function (oColumn) {
              const sKey = this._getKey(oColumn);
              const sColumnWidth = oState.ColumnWidth[sKey];

              oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);

              oColumn.setVisible(false);
              oColumn.setSortOrder(CoreLibrary.SortOrder.None);
            }.bind(this)
          );

          oState.Columns.forEach(
            function (oProp, iIndex) {
              const oCol = this.byId("tablePos")
                .getColumns()
                .find((oColumn) => oColumn.data("p13nKey") === oProp.key);
              oCol.setVisible(true);

              oTable.removeColumn(oCol);
              oTable.insertColumn(oCol, iIndex);
            }.bind(this)
          );

          const aSorter = [];
          oState.Sorter.forEach(
            function (oSorter) {
              const oColumn = this.byId("tablePos")
                .getColumns()
                .find((oColumn) => oColumn.data("p13nKey") === oSorter.key);

              oColumn.setSorted(true);
              oColumn.setSortOrder(
                oSorter.descending
                  ? CoreLibrary.SortOrder.Descending
                  : CoreLibrary.SortOrder.Ascending
              );
              aSorter.push(
                new Sorter(
                  this.oMetadataHelper.getProperty(oSorter.key).path,
                  oSorter.descending
                )
              );
            }.bind(this)
          );
          oTable.getBinding("rows").sort(aSorter);
        },

      }
    );
  }
);
