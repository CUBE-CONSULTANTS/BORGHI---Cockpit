sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    "sap/m/PDFViewer",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/format/DateFormat",
  ],
  function (
    Controller,
    UIComponent,
    History,
    Fragment,
    JSONModel,
    MessageBox,
    MessageToast,
    Sorter,
    PDFViewer,
    Spreadsheet,
    DateFormat
  ) {
    "use strict";

    return Controller.extend(
      "programmi.consegne.edi.controller.BaseController",
      {
        /**
         * Convenience method for accessing the component of the controller's view.
         * @returns {sap.ui.core.Component} The component of the controller's view
         */
        getOwnerComponent: function () {
          return Controller.prototype.getOwnerComponent.call(this);
        },
        /**
         * Convenience method to get the components' router instance.
         * @returns {sap.m.routing.Router} The router instance
         */
        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },
        /**
         * Convenience method for getting the i18n resource bundle of the component.
         * @returns {sap.base.i18n.ResourceBundle} The i18n resource bundle of the component
         */
        getResourceBundle: function () {
          let oComponent;
          this.getOwnerComponent() === undefined
            ? (oComponent = this._oComponent)
            : (oComponent = this.getOwnerComponent());
          return oComponent.getModel("i18n").getResourceBundle();
        },
        getBundleText: function (i18nID) {
          return this.getResourceBundle().getText(i18nID);
        },
        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @param {string} [sName] The model name
         * @returns {sap.ui.model.Model} The model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },
        /**
         * Convenience method for setting the view model in every controller of the application.
         * @param {sap.ui.model.Model} oModel The model instance
         * @param {string} [sName] The model name
         * @returns {sap.ui.core.mvc.Controller} The current base controller instance
         */
        setModel: function (oModel, sName) {
          this.getView().setModel(oModel, sName);
          return this;
        },
        /**
         * Convenience method for triggering the navigation to a specific target.
         * @public
         * @param {string} sName Target name
         * @param {object} [oParameters] Navigation parameters
         * @param {boolean} [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
         */
        navTo: function (sName, oParameters, bReplace) {
          this.getRouter().navTo(sName, oParameters, undefined, bReplace);
        },
        /**
         * Convenience event handler for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the main route.
         */
        onNavBack: function () {
          var sPreviousHash = History.getInstance().getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getRouter().navTo("main", {}, undefined, true);
          }
        },
        showBusy: function (delay) {
          // sap.ui.core.BusyIndicator.show(delay || 0);
          sap.ui.core.BusyIndicator.show(delay);
        },
        hideBusy: function (delay) {
          // sap.ui.core.BusyIndicator.hide(delay || 0);
          sap.ui.core.BusyIndicator.hide(delay);
        },
        onOpenDialog: function (dialName, fragmName, self, ...oModel) {
          let oView = this.getView();
          dialName = self.dialName;
          if (!dialName) {
            dialName = Fragment.load({
              id: oView.getId(),
              name: fragmName,
              controller: self,
            }).then((oValueHelpDialog) => {
              oView.addDependent(oValueHelpDialog);
              oValueHelpDialog.setModel(this.getModel(...oModel));
              return oValueHelpDialog;
            });
            dialName.then(function (oValueHelpDialog) {
              oValueHelpDialog.open();
            });
          } else {
            self.dialName.open();
          }
        },
        onFiltersBuilding: function (oEvent, key) {
          if (key === "01") {
            //clienti/materiali/num Progr invio
            let aData = this.getModel("master3").getProperty("/");
            let aClienti = [
              ...new Set(aData.map((item) => item.codice_seller)),
            ];
            let aNumProgInvio = [
              ...new Set(aData.map((item) => item.numero_progressivo_invio)),
            ];
            let aMateriali = [];
            aData.forEach((item) => {
              if (item.posizioni) {
                item.posizioni.forEach((pos) => {
                  if (pos.codice_materiale_fornitore) {
                    aMateriali.push(pos.codice_materiale_fornitore);
                  }
                });
              }
            });
            aMateriali = [...new Set(aMateriali)];
            this.getModel("filtersModel").setProperty(
              "/delivery/cliente/items",
              aClienti.map((c) => ({ Key: c, Text: c }))
            );
            this.getModel("filtersModel").setProperty(
              "/delivery/materiale/items",
              aMateriali.map((m) => ({ Key: m, Text: m }))
            );
            this.getModel("filtersModel").setProperty(
              "/delivery/numProg/items",
              aNumProgInvio.map((n) => ({ Key: n, Text: n }))
            );
          }
        },
        onFilterBarClear: function (oEvent) {
          let oFilterData = this.getModel("filtersModel").getData();
          for (let sView in oFilterData) {
            if (oFilterData.hasOwnProperty(sView)) {
              let oFilters = oFilterData[sView];
              for (let sKey in oFilters) {
                if (oFilters.hasOwnProperty(sKey)) {
                  let oFilter = oFilters[sKey];
                  if (
                    oFilter &&
                    typeof oFilter === "object" &&
                    oFilter.hasOwnProperty("value")
                  ) {
                    oFilters[sKey].value = null;
                  } else {
                    oFilters[sKey] = null;
                  }
                }
              }
            }
          }
          this.getModel("filtersModel").refresh(true);
          let oBinding;
          if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("delivery")
          ) {
            oBinding = this.getView().byId("treetableMain").getBinding("rows");
          }
          oBinding.filter([]);
          oBinding.sort([]);
        },
        onSearchData: function (oEvent) {
          //ricerca filtrata
          let aFilters = [];
          let oFilterSet;
          if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("delivery")
          ) {
            oFilterSet = this.getModel("filtersModel").getProperty("/delivery");
            if (oFilterSet.dataRic) {
              let oDate = oFilterSet.dataRic;
              let dateString;

              if (oDate instanceof Date) {
                let day = oDate.getDate().toString().padStart(2, "0");
                let month = (oDate.getMonth() + 1).toString().padStart(2, "0");
                let year = oDate.getFullYear();
                dateString = day + "/" + month + "/" + year;
              } else {
                dateString = oDate;
              }
              aFilters.push(
                new sap.ui.model.Filter(
                  "data_ricezione",
                  sap.ui.model.FilterOperator.EQ,
                  dateString
                )
              );
            }
            if (oFilterSet.numProg && oFilterSet.numProg.value) {
              aFilters.push(
                new sap.ui.model.Filter(
                  "numero_progressivo_invio",
                  sap.ui.model.FilterOperator.EQ,
                  oFilterSet.numProg.value
                )
              );
            }
            if (oFilterSet.cliente && oFilterSet.cliente.value) {
              aFilters.push(
                new sap.ui.model.Filter(
                  "codice_seller",
                  sap.ui.model.FilterOperator.EQ,
                  oFilterSet.cliente.value
                )
              );
            }
            if (oFilterSet.materiale && oFilterSet.materiale.value) {
              aFilters.push(
                new sap.ui.model.Filter(
                  "codice_materiale_fornitore",
                  sap.ui.model.FilterOperator.EQ,
                  oFilterSet.materiale.value
                )
              );
            }
            let oTreeTable = this.getView().byId("treetableMain");
            let oBinding = oTreeTable.getBinding("rows");
            oBinding.filter(aFilters, sap.ui.model.FilterType.Application);
          }
        },
        formatData: function (date) {
          debugger;
          if (date) {
            var oDateFormat = DateFormat.getDateTimeInstance({
              pattern: "dd/MM/yyyy",
            });
            return oDateFormat.format(new Date(date));
          }
          return "";
        },
        parseDate: function (dateStr) {
          let parts = dateStr.split("/");
          return new Date(parts[2], parts[1] - 1, parts[0]);
        },
        // formatDate: function (dateString) {
        //   if (!dateString) return "";
        //   let match = dateString.match(/^(\d{4})(\d{2})(\d{2})$/);
        //   if (!match) {
        //     console.log("Formato data non valido:", dateString);
        //     return "";
        //   }
        //   let [, year, month, day] = match;
        //   let oDate = new Date(year, month - 1, day);
        //   let oDateFormat = DateFormat.getInstance({
        //     pattern: "dd/MM/yyyy",
        //   });

        //   return oDateFormat.format(oDate);
        // },

        formatDate: function (date) {
          debugger;
          if (date) {
            var oDateFormat = DateFormat.getDateTimeInstance({
              pattern: "dd/MM/yyyy",
            });
            return oDateFormat.format(new Date(date));
          }
          return "";
        },
      }
    );
  }
);
