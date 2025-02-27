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
    "../model/API",
    "../model/mapper",
    "../model/formatter"
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
    DateFormat,
    API,
    mapper,
    formatter
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
          debugger
          var sPreviousHash = History.getInstance().getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getRouter().navTo("home", {}, undefined, true);
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
        
          let oView = self.getView();
          if (!self[dialName]) {
            Fragment.load({
                id: oView.getId(),
                name: fragmName,
                controller: self
            }).then((oDialog) => {
                oView.addDependent(oDialog);
                oDialog.setModel(self.getModel(...oModel));
                self[dialName] = oDialog;
                oDialog.open();
            });
          } else {
              self[dialName].open();
          }
        },
       
        onFiltersBuilding: function (oEvent, key) {
          if (key === "01") {
            //clienti/materiali/num Progr invio
            let aData = this.getModel("master3").getProperty("/");
            let aClienti = [...new Set(aData.map((item) => item.codice_seller))];
            let aNumProgInvio = [...new Set(aData.map((item) => item.numero_progressivo_invio))];
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
          }else if(key === "02"){
            debugger
            let aData = this.getModel("master3CO").getProperty("/");
            let aClienti = [...new Set(aData.map((item) => item.codice_terre_cliente))];
            let aReason = [];
            let aMateriali = [];
            aData.forEach((item) => {
              if (item.posizioni_testata) {
                item.posizioni_testata.forEach((pos) => {
                  if (pos.posizione_6_28) {
                    aMateriali.push(pos.posizione_6_28);
                  }
                  if(pos.posizione_43_44){
                    aReason.push(pos.posizione_43_44);
                  }
                });
              }
            });
            aReason = [...new Set(aReason)]
            aMateriali = [...new Set(aMateriali)];

            this.getModel("filtersModel").setProperty(
              "/callOff/materiale/items",
              aMateriali.map((m) => ({ Key: m, Text: m }))
            );
            this.getModel("filtersModel").setProperty(
              "/callOff/reason/items",
              aReason.map((m) => ({ Key: m, Text: m }))
            );
            this.getModel("filtersModel").setProperty(
              "/callOff/clienti/items",
              aClienti.map((m) => ({ Key: m, Text: m }))
            );
          }
        },
        onFilterBarClear: async function (oEvent) {
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
          let modelMeta
          if (oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("delivery")) {
            modelMeta = await this.callData(this.getOwnerComponent().getModel("modelloV2"), "/Testata", [], ["posizioni,posizioni/schedulazioni,posizioni/log"],"01")
          }
          if (oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("callOff")) {
            modelMeta = await this.callData(this.getOwnerComponent().getModel("calloffV2"), "/Testata", [], ["master,posizioni_testata,log_testata"],"02")
          }
          // oBinding.filter([]);
          // oBinding.sort([]);
        },
        onSearchData: async function (oEvent) {
          //ricerca filtrata
          let oFilterSet;
          let key
          if (oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("delivery")) {
            oFilterSet = this.getModel("filtersModel").getProperty("/delivery");
            let aFilters = mapper.buildFilters(oFilterSet,key = "01")
            await this.callData(this.getOwnerComponent().getModel("modelloV2"),"/Testata",aFilters,["posizioni","posizioni/schedulazioni","posizioni/log"],"01") 
          }else if(oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("callOff")){
            debugger
            oFilterSet = this.getModel("filtersModel").getProperty("/callOff");
            let aFilters = mapper.buildFilters(oFilterSet,key = "02")
            await this.callData(this.getOwnerComponent().getModel("calloffV2"), "/Testata", aFilters, ["master,posizioni_testata,log_testata"],"02") 
          }
        },
        
        callData : async function(oModel,entity,aFilters,Expands, key){
          debugger
          let metadata, modelMeta
          try {
            metadata = await API.getEntity(oModel,entity,aFilters,Expands);
            if(key === '01'){
              modelMeta = new JSONModel(metadata.results);
              modelMeta.getProperty("/").forEach((testata) => {
                testata.posizioni = Object.values(testata.posizioni.results);
              });
              this.getOwnerComponent().setModel(modelMeta, "master3");
            }else if(key === "02"){
              modelMeta = new JSONModel(metadata.results);
              modelMeta.getProperty("/").forEach((testata) => {
                testata.posizioni_testata = Object.values(testata.posizioni_testata.results);
                testata.master
              });
              this.getOwnerComponent().setModel(modelMeta, "master3CO");
            }
          } catch (error) {
            MessageBox.error("Errore durante la ricezione dei dati")
          }finally {
            this.hideBusy(0)
          }
        },
        sortTables: function(table,aSortFields) {
          let oBinding = table.getBinding("rows");
          let aCurrentSorters = oBinding.aSorters || [];
          let bDescending = aCurrentSorters.length > 0 ? !aCurrentSorters[0].bDescending : false;
          let aSorters = aSortFields.map(field => new sap.ui.model.Sorter(field, bDescending));
          oBinding.sort(aSorters)
        },
        downloadExcelFileDett: function (oEvent){
          debugger
          let oModel = this.getModel("detailData")
          let aData = oModel.getProperty("/DettaglioMaster3"); 
            if (!aData || aData.length === 0) {
              MessageToast.show("Nessun dato disponibile per l'esportazione");
              return;
            }
          this.buildSpreadSheet(aData)
        },
        buildSpreadSheet: function(aExportData){
          debugger
          let flatExportData = mapper.flatData(aExportData);
          let oSpreadsheet = new Spreadsheet({
            dataSource: flatExportData,
            workbook: {
            columns: this._getExcelColumns(flatExportData),
            hierarchyLevel: 'Level'
            },
            fileName: "Export",
            showProgress: true,
            worker: true
          });
          oSpreadsheet.build().then(function () {
            MessageToast.show("Esportazione completata!");
          });  
        },
        _getExcelColumns: function(aExportData) {
        debugger;
        let columns = [];
        let fields = new Set();  
        aExportData.forEach(item => {
          Object.keys(item).forEach(field => fields.add(field));
        });
        aExportData.forEach(item => {
          let positions = item.posizioni || [];
          positions.forEach(position => {
          Object.keys(position).forEach(field => fields.add(field));
          });
        });
        aExportData.forEach(item => {
          let positions = item.posizioni || [];
            positions.forEach(position => {
              let schedules = position.schedulazioni.results || [];
              schedules.forEach(schedule => {
                Object.keys(schedule).forEach(field => fields.add(field));
              });
            });
          });
          fields.forEach(field => {
              columns.push({
                  label: field.replace(/_/g, " "), 
                  property: field,  
                  type: "Edm.String"
              });
          });
          return columns;
      },
      handleCloseDetail: function () {
        // var sNextLayout = this.oModel.getProperty(
        //   "/actionButtonsInfo/midColumn/closeColumn"
        // );
        // this.oRouter.navTo("master3", { layout: sNextLayout });
        this.oRouter.navTo("master3");
      },
      onClose: function (oEvent) {
        oEvent.getSource().getParent().close();
      },

        // _formatExcelData: function(aData) {
        //   debugger;
        //   let aExportData = [];
        //     aData.forEach(item => {
        //         let row = {};
        //         Object.keys(item).forEach(key => {
        //             row[key] = item[key];  
        //         });
        //         let positions = item.posizioni || [];
        //         positions.forEach(position => {
        //             let positionRow = { ...row }; 
        //             Object.keys(position).forEach(key => {
        //                 positionRow[key] = position[key];  
        //             });

        //             let schedules = position.schedulazioni.results || [];
        //             schedules.forEach(schedule => {
        //                 let scheduleRow = { ...positionRow }; 
        //                 Object.keys(schedule).forEach(key => {
        //                     scheduleRow[key] = schedule[key];  
        //                 });
        //                 aExportData.push(scheduleRow); 
        //             });

        //             aExportData.push(positionRow); 
        //         });

        //         aExportData.push(row); 
        //     });

        //     return aExportData;
        // },
      }
    );
  }
);
