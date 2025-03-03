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
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/MetadataHelper",
    "sap/ui/core/library",
    "../model/formatter",
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
    Engine,
    SelectionController,
    SortController,
    GroupController,
    MetadataHelper,
    CoreLibrary,
    formatter,
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
            debugger
            let aData = this.getModel("master3").getProperty("/");
            let aStato = aData.map(item => [...new Set(item.posizioni.map(pos =>pos.stato))])
            let aClienti = [...new Set(aData.map((item) => item.codice_cliente))];
            let aNumProgInvio = [...new Set(aData.map((item) => item.numero_progressivo_invio))];
            let aMateriali = [];
            let aMessaggi = []
            aData.forEach((item) => {
              if (item.posizioni) {
                item.posizioni.forEach((pos) => {
                  if (pos.codice_cliente_materiale) {
                    aMateriali.push(pos.codice_cliente_materiale);
                  }
                  if(pos.log){
                    debugger
                    pos.log.results.forEach(res=> aMessaggi.push(res.messaggio))
                  }
                });
              }
            });
            aMateriali = [...new Set(aMateriali)];
            aMessaggi = [...new Set(aMessaggi)];
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
            this.getModel("filtersModel").setProperty(
              "/delivery/stato/items",
              aStato.map((n) => ({ Key: n, Text: n }))
            );
            this.getModel("filtersModel").setProperty(
              "/delivery/messaggio/items",
              aMessaggi.map((n) => ({ Key: n, Text: n }))
            );
          }else if(key === "02"){
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
          }else if(key === "03"){
            let aData = this.getModel("master3SB").getProperty("/");
            let aClienti = [...new Set(aData.map((item) => item.customer))];
            let aFornitori = [...new Set(aData.map((item) => item.supplier))];
            let aFatture = [];
            aData.forEach((item) => {
              if (item.dettaglio_fattura) {
                item.dettaglio_fattura.forEach((pos) => {
                  if (pos.numero_fattura) {
                    aFatture.push(pos.numero_fattura);
                  }
                });
              }
            });
            aFatture = [...new Set(aFatture)]
            this.getModel("filtersModel").setProperty(
              "/selfBilling/fatture/items",
              aFatture.map((m) => ({ Key: m, Text: m }))
            );
            this.getModel("filtersModel").setProperty(
              "/selfBilling/clienti/items",
              aClienti.map((m) => ({ Key: m, Text: m }))
            );
            this.getModel("filtersModel").setProperty(
              "/selfBilling/fornitori/items",
              aFornitori.map((m) => ({ Key: m, Text: m }))
            );
          }else if(key === "06"){
            let aData = this.getModel("master3Scart").getProperty("/");
            let aFile = [...new Set(aData.map((item) => item.filename))];
            this.getModel("filtersModel").setProperty(
              "/scartati/nomeFile/items",
              aFile.map((m) => ({ Key: m, Text: m }))
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
          let modelMeta
          if (oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("delivery")) {
            modelMeta = await this.callData(this.getOwnerComponent().getModel("modelloV2"), "/Testata", [], [`posizioni($filter=stato ne '53'),posizioni($expand=log,schedulazioni,testata),master`],"01")
          }
          if (oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("callOff")) {
            modelMeta = await this.callData(this.getOwnerComponent().getModel("calloffV2"), "/Testata", [], ["master,posizioni_testata,log_testata"],"02")
          }
          if(oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("selfBilling")){
            modelMeta = await this.callData(this.getOwnerComponent().getModel("selfBillingV2"), "/Testata", [],[ "dettaglio_fattura,log_testata,dettaglio_fattura/riferimento_ddt,dettaglio_fattura/riferimento_ddt/riga_fattura"],"03")
          }
          if(oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("fileScartati")){
            modelMeta = await this.callData(this.getOwnerComponent().getModel("fileScartatiV2"), "/FileScartati", [],[],"06")
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
            let findStato = aFilters.find(filter => filter.sPath === "posizioni/stato")
            let findMessaggio = aFilters.find(filter => filter.sPath === "posizioni/log/messaggio")
            if (findStato && findMessaggio) {
              let index = aFilters.findIndex(filter => filter.sPath === "posizioni/stato")
              aFilters.splice(index,1)
              let indexMess = aFilters.findIndex(filter => filter.sPath === "posizioni/log/messaggio")
              aFilters.splice(indexMess,1)
              await this.callData(this.getOwnerComponent().getModel("modelloV2"),"/Testata",aFilters,[`posizioni($filter=stato eq '${findStato.oValue1}'),posizioni($expand=log($filter=messaggio eq '${findMessaggio.oValue1}'),schedulazioni,testata),master`],"01")         
            }else if(findStato){
              let index = aFilters.findIndex(filter => filter.sPath === "posizioni/stato")
              aFilters.splice(index,1)
              await this.callData(this.getOwnerComponent().getModel("modelloV2"),"/Testata",aFilters,[`posizioni($filter=stato eq '${findStato.oValue1}'),posizioni($expand=log,schedulazioni,testata),master`],"01")   
            }
            else if(findMessaggio){
              let indexMess = aFilters.findIndex(filter => filter.sPath === "posizioni/log/messaggio")
              aFilters.splice(indexMess,1)
              await this.callData(this.getOwnerComponent().getModel("modelloV2"),"/Testata",aFilters,[`posizioni($filter=stato ne '53'),posizioni($expand=log($filter=messaggio eq '${findMessaggio.oValue1}'),schedulazioni,testata),master`],"01")
            }
            else{
              await this.callData(this.getOwnerComponent().getModel("modelloV2"),"/Testata",aFilters,[`posizioni($filter=stato ne '53'),posizioni($expand=log,schedulazioni,testata),master`],"01") 
            }
          }else if(oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("callOff")){
            oFilterSet = this.getModel("filtersModel").getProperty("/callOff");
            let aFilters = mapper.buildFilters(oFilterSet,key = "02")
            await this.callData(this.getOwnerComponent().getModel("calloffV2"), "/Testata", aFilters, ["master,posizioni_testata,log_testata"],"02") 
          }else if(oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("selfBilling")){
            oFilterSet = this.getModel("filtersModel").getProperty("/selfBilling");
            let aFilters = mapper.buildFilters(oFilterSet,key = "03")
            await this.callData(this.getOwnerComponent().getModel("selfBillingV2"), "/Testata",aFilters, [
                "dettaglio_fattura,log_testata,dettaglio_fattura/riferimento_ddt,dettaglio_fattura/riferimento_ddt/riga_fattura",
              ],"03") 
          }else if(oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("scartati")){
            oFilterSet = this.getModel("filtersModel").getProperty("/scartati");
            let aFilters = mapper.buildFilters(oFilterSet,key = "06")
            await this.callData(this.getOwnerComponent().getModel("fileScartatiV2"), "/FileScartati", aFilters, [],"06") 
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
                testata.master.data_ricezione = this.formatter.formatDateString(testata.master.data_ricezione)
                debugger
              });
              this.getOwnerComponent().setModel(modelMeta, "master3");
            }else if(key === "02"){
              modelMeta = new JSONModel(metadata.results);
              modelMeta.getProperty("/").forEach((testata) => {
                testata.posizioni_testata = Object.values(testata.posizioni_testata.results);
              });
              this.getOwnerComponent().setModel(modelMeta, "master3CO");
            }else if(key === '03'){
              modelMeta = new JSONModel(metadata.results);
              modelMeta.getProperty("/").forEach((testata) => {
                testata.dettaglio_fattura = Object.values(testata.dettaglio_fattura.results);
              });
              this.getOwnerComponent().setModel(modelMeta, "master3SB");
            }else if(key == "06"){
              debugger
              modelMeta = new JSONModel(metadata.results);
              this.getOwnerComponent().setModel(modelMeta, "master3Scart");
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
          let oModel = this.getModel("detailData")
          let aData = oModel.getProperty("/"); 
            if (!aData || aData.length === 0) {
              MessageToast.show("Nessun dato disponibile per l'esportazione");
              return;
            }
          this.buildSpreadSheet(aData)
        },
        buildSpreadSheet: function(aExportData){
          let exportData = Array.isArray(aExportData) ? aExportData : [aExportData]; 
          let flatExportData = mapper._formatExcelData(exportData);
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
      //engine dinamico
      _registerForP13n: function (oEvent, tableId) {
        let columnConfig = mapper.getColumnConfig(tableId)
        let oTable = this.byId(tableId); 
        this.oMetadataHelper = new MetadataHelper(columnConfig); 
        
        this._mIntialWidth = columnConfig.reduce((acc, column) => {
          acc[column.key] = column.initialWidth || "11rem"; 
          return acc;
        }, {});
      
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
          this.handleStateChange.bind(this,tableId) 
        );
      },
      openPosizioniDialog: function (oEvent) {
        debugger
        let tableId = oEvent.getSource().getParent().getParent().getId().split('--').pop()
        let oTable = this.byId(tableId);
        Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
          contentHeight: "35rem",
          contentWidth: "32rem",
          source: oEvent.getSource(),
        });
      },
      _getKey: function (oControl) {
        let aCustomData = oControl.getCustomData();
        let sKey = aCustomData.find(data => data.getKey() === "p13nKey");
        return sKey ? sKey.getValue() : null;
      },

      handleStateChange: function (tableId, oEvt){
        const oTable = this.getView().byId(tableId);
        const oState = oEvt.getParameter("state");

        if (!oState) {
          return;
        }

        oTable.getColumns().forEach(oColumn => {
          const sKey = this._getKey(oColumn);
          const sColumnWidth = oState.ColumnWidth ? oState.ColumnWidth[sKey] : undefined;
          oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey] || "10rem");
          oColumn.setVisible(false);
          oColumn.setSortOrder(CoreLibrary.SortOrder.None);
        });
      
        oState.Columns.forEach((oProp, iIndex) => {
          const oCol = oTable.getColumns().find(oColumn => this._getKey(oColumn) === oProp.key);
            if (oCol) {
              oCol.setVisible(true);
              oTable.removeColumn(oCol);
              oTable.insertColumn(oCol, iIndex);
            }
        });
        if (oState.Sorter) {
        const aSorter = [];
          oState.Sorter.forEach(oSorter => {
            const oColumn = oTable.getColumns().find(oColumn => this._getKey(oColumn) === oSorter.key);

            if (oColumn) {
              oColumn.setSorted(true);
              oColumn.setSortOrder(
                  oSorter.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending
              );

              const oProperty = this.oMetadataHelper.getProperty(oSorter.key);
                if (oProperty) {
                  aSorter.push(new Sorter(oProperty.path, oSorter.descending));
                }
            }
          });
          if (oTable.getBinding("rows")) {
            oTable.getBinding("rows").sort(aSorter);
          }
        }          
      },
      //fine configurazione Engine x tutte tabelle, da richiamare nei controller dei dettagli, 
      // dopo aver mappato le colonne in mapper e definite il custData nelle view di dettaglio
      navToHome: function () {
        this.getRouter().navTo("home");
      },
      handleCloseDetail: function () {
        this.getRouter().navTo("master3");
      },
      onClose: function (oEvent) {
        oEvent.getSource().getParent().close();
      },

      
      }
    );
  }
);
