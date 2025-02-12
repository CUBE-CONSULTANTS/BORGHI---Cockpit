sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",

    "sap/m/p13n/MetadataHelper",
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,
    Engine,
    SelectionController,
    SortController,
    MetadataHelper
  ) {
    "use strict";

    return BaseController.extend(
      "sap.ui.demo.fiori2.controller.DetailMaster3",
      {
        onInit: function () {
          this.oOwnerComponent = this.getOwnerComponent();

          this.oRouter = this.oOwnerComponent.getRouter();
          this.oModel = this.oOwnerComponent.getModel();

          this.oRouter
            .getRoute("master3")
            .attachPatternMatched(this._onProductMatched, this);
          this.oRouter
            .getRoute("detailMaster3")
            .attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
          debugger;
          this._product =
            oEvent.getParameter("arguments").product || this._product || "0";
          ///prova anthea binding su table
          // let datiElementoSelect=this.getOwnerComponent().getModel("master3").getProperty(`/Master3/${this._product}`)
          let datiElementoSelect = this.getOwnerComponent()
            .getModel("master3")
            .getProperty("/Master3")
            .find((x) => (x.DelforTestata.id = this._product));
          datiElementoSelect.DelforPosizioni =
            datiElementoSelect.DelforPosizioni.flat();
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

          // this._registerForP13n();
        },

        onEditToggleButtonPress: function () {
          var oObjectPage = this.getView().byId("ObjectPageLayout"),
            bCurrentShowFooterState = oObjectPage.getShowFooter();

          oObjectPage.setShowFooter(!bCurrentShowFooterState);
        },

        handleFullScreen: function () {
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/fullScreen"
          );
          this.oRouter.navTo("detailMaster3", {
            layout: sNextLayout,
            product: this._product,
          });
        },

        handleExitFullScreen: function () {
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/exitFullScreen"
          );
          this.oRouter.navTo("detailMaster3", {
            layout: sNextLayout,
            product: this._product,
          });
        },

        handleClose: function () {
          // var sNextLayout = this.oModel.getProperty(
          //   "/actionButtonsInfo/midColumn/closeColumn"
          // );
          // this.oRouter.navTo("master3", { layout: sNextLayout });
          this.oRouter.navTo("master3");
        },

        onExit: function () {
          this.oRouter
            .getRoute("master3")
            .detachPatternMatched(this._onProductMatched, this);
          this.oRouter
            .getRoute("detailMaster3")
            .detachPatternMatched(this._onProductMatched, this);
        },

        onCollapseAll: function () {
          const oTreeTable = this.byId("treetableDetail");
          oTreeTable.collapseAll();
        },

        onCollapseSelection: function () {
          const oTreeTable = this.byId("treetableDetail");
          oTreeTable.collapse(oTreeTable.getSelectedIndices());
        },

        onExpandFirstLevel: function () {
          const oTreeTable = this.byId("treetableDetail");
          oTreeTable.expandToLevel(1);
        },

        onExpandSelection: function () {
          const oTreeTable = this.byId("treetableDetail");
          oTreeTable.expand(oTreeTable.getSelectedIndices());
        },

        importaPress: function (oEvent) {
          if (!this._oDialog2) {
            Fragment.load({
              id: this.getView().getId(),
              name: "sap.ui.demo.fiori2.view.fragments.importMaster3",
              controller: this,
            }).then(
              function (oDialog2) {
                this._oDialog2 = oDialog2;
                this.getView().addDependent(this._oDialog2);
                this._oDialog2.open();
              }.bind(this)
            );
          } else {
            this._oDialog.open();
          }
        },

        onclose: function (oEvent) {
          oEvent.getSource().getParent().close();
        },

        onProcessaButton: function (oEvent) {
          debugger;
          let indici = this.getView()
            .byId("treetableDetail")
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
                name: "sap.ui.demo.fiori2.view.fragments.linkDialogMaster3",
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

          let oNextUIState;
          this.getOwnerComponent()
            .getHelper()
            .then(
              function (oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                this.oRouter.navTo("Detail2Master3", {
                  product: JSON.stringify(detail),
                  layout: oNextUIState.layout,
                });
              }.bind(this)
            );
        },

        // _registerForP13n: function () {
        //   const oTable = this.byId("persoTable");

        //   this.oMetadataHelper = new MetadataHelper([
        //     {
        //       key: "firstName_col",
        //       label: "First Name",
        //       path: "firstName",
        //     },
        //     {
        //       key: "lastName_col",
        //       label: "Last Name",
        //       path: "lastName",
        //     },
        //     {
        //       key: "city_col",
        //       label: "City",
        //       path: "city",
        //     },
        //     {
        //       key: "size_col",
        //       label: "Size",
        //       path: "size",
        //     },
        //   ]);

        //   this._mIntialWidth = {
        //     firstName_col: "11rem",
        //     lastName_col: "11rem",
        //     city_col: "11rem",
        //     size_col: "11rem",
        //   };

        //   Engine.getInstance().register(oTable, {
        //     helper: this.oMetadataHelper,
        //     controller: {
        //       Columns: new SelectionController({
        //         targetAggregation: "columns",
        //         control: oTable,
        //       }),
        //       Sorter: new SortController({
        //         control: oTable,
        //       }),
        //       Groups: new GroupController({
        //         control: oTable,
        //       }),
        //       ColumnWidth: new ColumnWidthController({
        //         control: oTable,
        //       }),
        //     },
        //   });

        //   Engine.getInstance().attachStateChange(
        //     this.handleStateChange.bind(this)
        //   );
        // },

        // openPosizioniDialog: function (oEvt) {
        //   const oTable = this.byId("tablePos");

        //   Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
        //     contentHeight: "35rem",
        //     contentWidth: "32rem",
        //     source: oEvt.getSource(),
        //   });
        // },

        openPosizioniDialog: function (oEvt) {
          const oTable = this.byId("tablePos");

          // Crea un'istanza di SelectionController
          var oSelectionController = new sap.m.p13n.SelectionController({
            control: oTable,
          });

          // Usa MetadataHelper per ottenere le colonne e fare ulteriori operazioni
          var oMetadataHelper = new sap.m.p13n.MetadataHelper();
          var aColumns = oTable.getColumns();

          // Puoi usare aColumns per personalizzare ulteriormente le colonne

          // Apri la dialog per la selezione delle colonne
          oSelectionController.open({
            source: oEvt.getSource(),
            contentHeight: "35rem",
            contentWidth: "32rem",
          });
        },
      }
    );
  }
);
