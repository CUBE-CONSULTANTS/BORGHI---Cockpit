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
              controller: self,
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
        onCollapseAll: function () {
          let oTable;
          let selectedKey = this.getView()
            .byId("idIconTabBar")
            .getSelectedKey();
          !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
          switch (selectedKey) {
            case "01":
              oTable = this.byId("treetableMain");
              oTable.collapseAll();
              break;
            case "02":
              oTable = this.byId("treetableCallOff");
              oTable.collapseAll();
              break;
            case "03":
              oTable = this.byId("treetableSB");
              oTable.collapseAll();
              break;
            default:
          }
        },
        onExpandFirstLevel: function () {
          let oTable;
          let selectedKey = this.getView()
            .byId("idIconTabBar")
            .getSelectedKey();
          !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
          switch (selectedKey) {
            case "01":
              oTable = this.byId("treetableMain");
              oTable.expandToLevel(1);
              break;
            case "02":
              oTable = this.byId("treetableCallOff");
              oTable.expandToLevel(1);
              break;
            case "03":
              oTable = this.byId("treetableSB");
              oTable.expandToLevel(1);
              break;
            default:
          }
        },
        navToAPP: function (oEvent) {
          let level = oEvent
            .getSource()
            .getParent()
            .getParent()
            .getBindingContext("master3")
            .getPath();

          if (level.includes("posizioni")) {
            this.getRouter().navTo("master", {
              prevApp: this.getOwnerComponent()
                .getModel("datiAppoggio")
                .getProperty("/currentPage"),
            });
          } else {
            this.getRouter().navTo("master2", {
              prevApp: this.getOwnerComponent()
                .getModel("datiAppoggio")
                .getProperty("/currentPage"),
            });
          }
        },
        _getCounters: async function (filterVal) {
          this.showBusy(0);
          try {
            let del = await API.getEntity(
              this.getOwnerComponent().getModel("modelloV2"),
              "/Testata/$count",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  filterVal
                ),
              ],
              []
            );
            this.getModel("count").setProperty("/delivery", del.results);
            let cal = await API.getEntity(
              this.getOwnerComponent().getModel("calloffV2"),
              "/Testata/$count",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  filterVal
                ),
              ],
              []
            );
            this.getModel("count").setProperty("/calloff", cal.results);
            let selfb = await API.getEntity(
              this.getOwnerComponent().getModel("selfBillingV2"),
              "/Testata/$count",
              [],
              // new sap.ui.model.Filter(
              //   "archiviazione",
              //   sap.ui.model.FilterOperator.EQ,
              //   true
              // )
              []
            );
            this.getModel("count").setProperty("/selfbilling", selfb.results);
            let fileScart = await API.getEntity(
              this.getOwnerComponent().getModel("fileScartatiV2"),
              "/FileScartati/$count",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  filterVal
                ),
              ],

              []
            );
            this.getModel("count").setProperty(
              "/fileScartati",
              fileScart.results
            );
          } catch (error) {
            MessageBox.error("Errore durante il recupero dei Dati");
          } finally {
            this.hideBusy(0);
          }
        },

        onFiltersBuilding: function (oEvent, key) {
          if (key === "01") {
            let aData = this.getModel("master3").getProperty("/");
            debugger
            let aStato = [
              ...new Set(
                  aData.flatMap((item) => 
                      item.posizioni.map((pos) => {
                          debugger
                          if (pos.stato === '51') {
                              return "In Errore";
                          } else if (pos.stato === '53') {
                              return "Elaborato Positivamente";
                          } else if (pos.stato === null) {
                              return "Non Elaborato";
                          }
                          return pos.stato; // Mantieni il valore originale per altri casi
                      })
                  )
              )
            ];
          
            let aClienti = [
              ...new Set(aData.map((item) => item.codice_cliente)),
            ];
            let aNumProgInvio = [
              ...new Set(aData.map((item) => item.numero_progressivo_invio)),
            ];
            let aMateriali = [];
            let aMessaggi = [];
            aData.forEach((item) => {
              if (item.posizioni) {
                item.posizioni.forEach((pos) => {
                  if (pos.codice_cliente_materiale) {
                    aMateriali.push(pos.codice_cliente_materiale);
                  }
                  if (pos.log) {
                    pos.log.results.forEach((res) =>
                      aMessaggi.push(res.messaggio)
                    );
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
          } else if (key === "02") {
            let aData = this.getModel("master3CO").getProperty("/");
            let aClienti = [
              ...new Set(aData.map((item) => item.codice_terre_cliente)),
            ];
            let aReason = [];
            let aMateriali = [];
            aData.forEach((item) => {
              if (item.posizioni_testata) {
                item.posizioni_testata.forEach((pos) => {
                  if (pos.posizione_6_28) {
                    aMateriali.push(pos.posizione_6_28);
                  }
                  if (pos.posizione_43_44) {
                    aReason.push(pos.posizione_43_44);
                  }
                });
              }
            });
            aReason = [...new Set(aReason)];
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
          } else if (key === "03") {
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
            aFatture = [...new Set(aFatture)];
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
          } else if (key === "06") {
            let aData = this.getModel("master3Scart").getProperty("/");
            let aFile = [...new Set(aData.map((item) => item.filename))];
            this.getModel("filtersModel").setProperty(
              "/scartati/nomeFile/items",
              aFile.map((m) => ({ Key: m, Text: m }))
            );
          }
        },
        onFilterBarClear: async function (oEvent) {
          let operator, archivVal;
          this.getModel("datiAppoggio").getProperty("/currentPage") ===
          "archivio"
            ? (operator = "eq")
            : (operator = "ne");
          this.getModel("datiAppoggio").getProperty("/currentPage") ===
          "archivio"
            ? (archivVal = true)
            : (archivVal = false);
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
          let modelMeta;
          if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("delivery")
          ) {
            modelMeta = await this.callData(
              this.getOwnerComponent().getModel("modelloV2"),
              "/Testata",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  archivVal
                ),
              ],
              [`posizioni,posizioni($expand=log,schedulazioni,testata),master`],
              "01",false
            );
          }
          if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("callOff")
          ) {
            modelMeta = await this.callData(
              this.getOwnerComponent().getModel("calloffV2"),
              "/Testata",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  archivVal
                ),
              ],
              ["master,posizioni_testata,log_testata"],
              "02",false
            );
          }
          if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("selfBilling")
          ) {
            modelMeta = await this.callData(
              this.getOwnerComponent().getModel("selfBillingV2"),
              "/Testata",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  archivVal
                ),
              ],
              [
                "dettaglio_fattura,log_testata,dettaglio_fattura/riferimento_ddt,dettaglio_fattura/riferimento_ddt/riga_fattura",
              ],
              "03", false
            );
          }
          if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("scartati")
          ) {
            modelMeta = await this.callData(
              this.getOwnerComponent().getModel("fileScartatiV2"),
              "/FileScartati",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  archivVal
                ),
              ],
              [],
              "06",false
            );
          }
          // oBinding.filter([]);
          // oBinding.sort([]);
        },
        sortCategories: function () {
          let oTable;
          let aSorters = [];
          switch (this.getView().byId("idIconTabBar").getSelectedKey()) {
            case "01":
              oTable = this.byId("treetableMain");
              aSorters = this.sortTables(oTable, [
                "codice_seller",
                "numero_progressivo_invio",
              ]);
              break;
            case "02":
              oTable = this.byId("treetableCallOff");
              aSorters = this.sortTables(oTable, [
                "codice_terre_cliente",
                "progressivo_invio",
              ]);
              break;
            case "03":
              oTable = this.byId("treetableSB");
              aSorters = this.sortTables(oTable, [
                "customer",
                "data_ricezione",
              ]);
              break;
            case "06":
              oTable = this.byId("tableScartati");
              aSorters = this.sortTables(oTable, [
                "filename",
                "data_ricezione",
              ]);
              break;
            default:
              return;
          }
        },
        onSearchData: async function (oEvent) {
          let oFilterSet;
          let key;
          let operator;
          let filtrato = false
          this.getModel("datiAppoggio").getProperty("/currentPage") ===
          "archivio"
            ? (operator = "eq")
            : (operator = "ne");
          if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("delivery")
          ) {
            oFilterSet = this.getModel("filtersModel").getProperty("/delivery");
            let aFilters = mapper.buildFilters(
              oFilterSet,
              (key = "01"),
              operator
            );
            let filters = {
              data_ricezione: aFilters.find(
                (f) => f.sPath === "data_ricezione"
              ),
              stato: aFilters.find((f) => f.sPath === "stato"),
              messaggio: aFilters.find((f) => f.sPath === "messaggio"),
              materiale : aFilters.find((f) => f.sPath === "posizioni/codice_cliente_materiale"),
            };
            Object.keys(filters).forEach((key) => {
              if (filters[key]) {
                let index = aFilters.findIndex((f) => f.sPath === key);
                if (index !== -1) aFilters.splice(index, 1);
              }
            });
            let expandQuery = `posizioni,posizioni($expand=log,schedulazioni,testata),master`;
            if (filters.stato) {
              expandQuery = `posizioni($filter=stato eq ${filters.stato.oValue1}),posizioni($expand=log,schedulazioni,testata),master`;
            }
            if(filters.materiale) {
              filtrato = true
              expandQuery = `posizioni($filter=codice_cliente_materiale eq '${filters.materiale.oValue1}'),posizioni($expand=log,schedulazioni,testata),master`;
            }
            if (filters.messaggio) {
              filtrato = true
              expandQuery = `posizioni,posizioni($expand=log($filter=messaggio eq '${filters.messaggio.oValue1}'),schedulazioni,testata),master`;
            }
            if (filters.data_ricezione) {
              expandQuery = `posizioni,posizioni($expand=log,schedulazioni,testata),master($filter=data_ricezione eq '${filters.data_ricezione.oValue1}')`;
            }
            if (filters.stato && filters.messaggio && filters.data_ricezione) {
              expandQuery = `posizioni($filter=stato eq '${filters.stato.oValue1}'),posizioni($expand=log($filter=messaggio eq '${filters.messaggio.oValue1}'),schedulazioni,testata),master($filter=data_ricezione eq '${filters.data_ricezione.oValue1}')`;
            }
           
            await this.callData(
              this.getOwnerComponent().getModel("modelloV2"),
              "/Testata",
              aFilters,
              [expandQuery],
              "01", filtrato
            );
          } else if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("callOff")
          ) {
            oFilterSet = this.getModel("filtersModel").getProperty("/callOff");
            let aFilters = mapper.buildFilters(oFilterSet, (key = "02"));
            await this.callData(
              this.getOwnerComponent().getModel("calloffV2"),
              "/Testata",
              aFilters,
              ["master,posizioni_testata,log_testata"],
              "02", false
            );
          } else if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("selfBilling")
          ) {
            oFilterSet =
              this.getModel("filtersModel").getProperty("/selfBilling");
            let aFilters = mapper.buildFilters(oFilterSet, (key = "03"));
            await this.callData(
              this.getOwnerComponent().getModel("selfBillingV2"),
              "/Testata",
              aFilters,
              [
                "dettaglio_fattura,log_testata,dettaglio_fattura/riferimento_ddt,dettaglio_fattura/riferimento_ddt/riga_fattura",
              ],
              "03",false
            );
          } else if (
            oEvent
              .getParameters()
              .selectionSet[0].getBindingInfo("value")
              .parts[0].path.includes("scartati")
          ) {
            oFilterSet = this.getModel("filtersModel").getProperty("/scartati");
            let aFilters = mapper.buildFilters(oFilterSet, (key = "06"));
            await this.callData(
              this.getOwnerComponent().getModel("fileScartatiV2"),
              "/FileScartati",
              aFilters,
              [],
              "06",false
            );
          }
        },

        callData: async function (oModel, entity, aFilters, Expands, key, filtrato) {
          let metadata, modelMeta;
          try {
            metadata = await API.getEntity(oModel, entity, aFilters, Expands);
            if (key === "01") {
              let datiFiltrati = metadata.results.filter(
                x => x.master !== null && x.posizioni.results.length > 0 );

              if(filtrato){
                datiFiltrati = metadata.results.filter(x => x.master !== null) .map(x => ({
                  ...x, 
                  posizioni: { 
                    results: x.posizioni.results.filter(res => res.log.results.length > 0) 
                  } 
                }))
                .filter(x => x.posizioni.results.length > 0);
              }
              modelMeta = new JSONModel(datiFiltrati);
              modelMeta.getProperty("/").forEach((testata) => {
                testata.posizioni = Object.values(testata.posizioni.results);
                
              });

              this.getOwnerComponent().setModel(modelMeta, "master3");
              this.getModel("master3").setSizeLimit(1000000);
            } else if (key === "02") {
              modelMeta = new JSONModel(metadata.results);
              modelMeta.getProperty("/").forEach((testata) => {
                testata.posizioni_testata = Object.values(
                  testata.posizioni_testata.results
                );
              });
              this.getOwnerComponent().setModel(modelMeta, "master3CO");
              this.getModel("master3CO").setSizeLimit(1000000);
            } else if (key === "03") {
              modelMeta = new JSONModel(metadata.results);
              modelMeta.getProperty("/").forEach((testata) => {
                testata.dettaglio_fattura = Object.values(
                  testata.dettaglio_fattura.results
                );
              });
              this.getOwnerComponent().setModel(modelMeta, "master3SB");
              this.getModel("master3SB").setSizeLimit(1000000);
            } else if (key == "06") {
              modelMeta = new JSONModel(metadata.results);
              this.getOwnerComponent().setModel(modelMeta, "master3Scart");
              this.getModel("master3Scart").setSizeLimit(1000000);
            }
          } catch (error) {
            MessageBox.error("Errore durante la ricezione dei dati");
          } finally {
            this.hideBusy(0);
          }
        },
        sortTables: function (table, aSortFields) {
          let oBinding = table.getBinding("rows");
          let aCurrentSorters = oBinding.aSorters || [];
          let bDescending =
            aCurrentSorters.length > 0
              ? !aCurrentSorters[0].bDescending
              : false;
          let aSorters = aSortFields.map(
            (field) => new sap.ui.model.Sorter(field, bDescending)
          );
          oBinding.sort(aSorters);
        },
        downloadExcelFileDett: function (oEvent) {
          let oModel = this.getModel("detailData");
          let aData = oModel.getProperty("/");
          if (!aData || aData.length === 0) {
            MessageToast.show("Nessun dato disponibile per l'esportazione");
            return;
          }
          this.buildSpreadSheet(aData);
        },
        buildSpreadSheet: function (aExportData) {
          let exportData = Array.isArray(aExportData)
            ? aExportData
            : [aExportData];

          let flatExportData;
          if (!aExportData.RFFON) {
            flatExportData = mapper._formatExcelData(exportData);
          } else {
            flatExportData = mapper._formatCumulativi(exportData);
          }

          let oSpreadsheet = new Spreadsheet({
            dataSource: flatExportData,
            workbook: {
              columns: this._getExcelColumns(flatExportData),
              hierarchyLevel: "Level",
            },
            fileName: "Export",
            showProgress: true,
            worker: true,
          });
          oSpreadsheet.build().then(function () {
            MessageToast.show("Esportazione completata!");
          });
        },
        _getExcelColumns: function (aExportData) {
          let columns = [];
          let fields = new Set();

          aExportData.forEach((item) => {
            Object.keys(item).forEach((field) => fields.add(field));

            let positions = item.posizioni || [];
            positions.forEach((position) => {
              Object.keys(position).forEach((field) => fields.add(field));
              let schedules = position.schedulazioni.results || [];
              schedules.forEach((schedule) => {
                Object.keys(schedule).forEach((field) => fields.add(field));
              });
            });
          });

          fields.forEach((field) => {
            columns.push({
              label: field.replace(/_/g, " "),
              property: field,
              type: "Edm.String",
            });
          });
          return columns;
        },
        onDeletePosition: async function (oEvent) {
          let oTable = oEvent.getSource().getParent().getParent();
          try {
            let arrayToProcess = await this._returnPayload(oTable);
            if (arrayToProcess.length > 0) {
              this.showBusy(0);
              let payload = arrayToProcess.map((x) => {
                return {
                  id_testata: x.id_testata,
                  id_posizione: x.id,
                };
              });
              let obj = { id: payload };
              let oModel = this.getOwnerComponent().getModel("modelloV2");
              let res = await API.createEntity(oModel, "/DeletePosizioni", obj);
              if (res.results.length > 0) {
                MessageBox.success("Operazione andata a buon fine.", {
                  title: "Operazione completata",
                  onClose: async () => {
                    let selectedKey;
                    this.getView().byId("idIconTabBar")
                      ? (selectedKey = this.getView()
                          .byId("idIconTabBar")
                          .getSelectedKey())
                      : undefined;
                    if (selectedKey !== undefined) {
                      await this._refreshData(selectedKey);
                    } else {
                      await this._refreshDetailData();
                    }
                  },
                });
              }
            }
          } catch (error) {
            MessageBox.error("Errore durante l'eliminazione delle posizioni.");
          } finally {
            this.hideBusy(0);
          }
        },
        _returnPayload: async function (table) {
          let indices = table.getSelectedIndices();
          let testate = [];
          let selectedPos = [];
          let flag = false;

          if (indices.length !== 0) {
            let aSelectedItems = indices.map(function (iIndex) {
              return table.getContextByIndex(iIndex).getObject();
            });

            aSelectedItems.forEach((element) => {
              if (element.hasOwnProperty("posizioni")) {
                testate.push(element);
                flag = true;
              } else {
                selectedPos.push(element);
              }
            });

            if (flag) {
              return new Promise((resolve) => {
                MessageBox.confirm(
                  "Verranno processate tutte le posizioni della Testata selezionata, continuare?",
                  {
                    title: "Continuare?",
                    onClose: (oAction) => {
                      if (oAction === sap.m.MessageBox.Action.OK) {
                        testate.forEach((x) => {
                          x.posizioni.forEach(
                            (pos) =>
                              (pos["numero_progressivo_invio"] =
                                x.numero_progressivo_invio)
                          );
                          selectedPos = selectedPos.concat(x.posizioni);
                        });
                        let uniqueArray = selectedPos.reduce(
                          (acc, currentValue) => {
                            if (
                              !acc.some((item) => item.id === currentValue.id)
                            ) {
                              acc.push(currentValue);
                            }
                            return acc;
                          },
                          []
                        );
                        resolve(uniqueArray);
                      } else {
                        resolve([]);
                      }
                    },
                  }
                );
              });
            } else {
              return selectedPos;
            }
          } else {
            MessageBox.alert("Selezionare almeno una posizione");
            return [];
          }
        },
        // refresh data dopo post
        _refreshData: async function (selectedKey) {
          this.showBusy(0);
          try {
            await this._getCounters(false);
            switch (selectedKey) {
              case "01":
                await this.onFilterSelect(null, "01");
                break;
              case "02":
                await this.onFilterSelect(null, "02");
                break;
              case "03":
                await this.onFilterSelect(null, "03");
                break;
              case "06":
                await this.onFilterSelect(null, "06");
                break;

              default:
                console.warn(
                  "Chiave della tabella non riconosciuta:",
                  selectedKey
                );
                break;
            }
          } catch (error) {
            console.error("Errore durante il refresh dei dati:", error);
          } finally {
            this.hideBusy(0);
          }
        },
        _refreshDetailData: async function () {
          this.showBusy(0);
          try {
            if (this.getView().getControllerName().includes("Master3")) {
              let dettaglio = await API.readByKey(
                this.getOwnerComponent().getModel("modelloV2"),
                "/Testata",
                { id: this._id, id_master: this._idMaster },
                [],
                [
                  "posizioni($filter=stato ne '53'),posizioni($expand=log,schedulazioni,testata),master",
                ]
              );
              let detailModel = this.getModel("detailData");
              detailModel.setData(dettaglio);
              detailModel.getProperty("/posizioni/results").forEach((pos) => {
                pos.log = Object.values(pos.log.results);
              });
            }
          } catch (error) {
            MessageBox.error("Errore durante il recupero dei dati dettaglio");
          } finally {
            this.hideBusy(0);
          }
        },
        //engine dinamico
        _registerForP13n: function (oEvent, tableId) {
          let columnConfig = mapper.getColumnConfig(tableId);
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
            this.handleStateChange.bind(this, tableId)
          );
        },
        openPosizioniDialog: function (oEvent) {
          let tableId = oEvent
            .getSource()
            .getParent()
            .getParent()
            .getId()
            .split("--")
            .pop();
          let oTable = this.byId(tableId);
          Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
            contentHeight: "35rem",
            contentWidth: "32rem",
            source: oEvent.getSource(),
          });
        },
        _getKey: function (oControl) {
          let aCustomData = oControl.getCustomData();
          let sKey = aCustomData.find((data) => data.getKey() === "p13nKey");
          return sKey ? sKey.getValue() : null;
        },

        handleStateChange: function (tableId, oEvt) {
          const oTable = this.getView().byId(tableId);
          const oState = oEvt.getParameter("state");

          if (!oState) {
            return;
          }

          oTable.getColumns().forEach((oColumn) => {
            const sKey = this._getKey(oColumn);
            const sColumnWidth = oState.ColumnWidth
              ? oState.ColumnWidth[sKey]
              : undefined;
            oColumn.setWidth(
              sColumnWidth || this._mIntialWidth[sKey] || "10rem"
            );
            oColumn.setVisible(false);
            oColumn.setSortOrder(CoreLibrary.SortOrder.None);
          });

          oState.Columns.forEach((oProp, iIndex) => {
            const oCol = oTable
              .getColumns()
              .find((oColumn) => this._getKey(oColumn) === oProp.key);
            if (oCol) {
              oCol.setVisible(true);
              oTable.removeColumn(oCol);
              oTable.insertColumn(oCol, iIndex);
            }
          });
          if (oState.Sorter) {
            const aSorter = [];
            oState.Sorter.forEach((oSorter) => {
              const oColumn = oTable
                .getColumns()
                .find((oColumn) => this._getKey(oColumn) === oSorter.key);

              if (oColumn) {
                oColumn.setSorted(true);
                oColumn.setSortOrder(
                  oSorter.descending
                    ? CoreLibrary.SortOrder.Descending
                    : CoreLibrary.SortOrder.Ascending
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
        downloadEdi: async function (oEvent) {
          let oBindingContext;
          if (oEvent.getSource().getBindingContext("master3") !== undefined) {
            oBindingContext = oEvent.getSource().getBindingContext("master3");
          } else if (
            oEvent.getSource().getBindingContext("master3CO") !== undefined
          ) {
            oBindingContext = oEvent.getSource().getBindingContext("master3CO");
          }
          let objId = oBindingContext.getObject().id;
          try {
            this.showBusy(0);
            let base64Edi = await API.readByKey(
              this.getOwnerComponent().getModel("modelloV2"),
              "/GetFileEdi",
              { id_testata: objId },
              [],
              []
            );
            const blob = this.base64ToBlob(
              base64Edi.contenuto_base64,
              "text/plain"
            );
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = base64Edi.nome_file;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          } catch (error) {
            MessageBox.error("Errore durante il download del File");
          } finally {
            this.hideBusy(0);
          }
        },
        base64ToBlob: function (base64, mimeType) {
          base64 = base64.replaceAll("-", "+").replaceAll("_", "/");
          const binaryString = window.atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; ++i) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new Blob([bytes], { type: mimeType });
        },
        getReportCumulativi: async function (dest, numIdoc, rffon) {
          try {
            this.showBusy(0);
            let oModel = this.getOwnerComponent().getModel("modelloV2");
            let res = await API.getEntity(
              oModel,
              `/DELFOR_CUMULATIVI(IdocNum='${numIdoc}',Stabilimento='${dest}', RFFON ='${rffon}')`
            );
            console.log(res);
            this.buildSpreadSheet(res.results);
          } catch (error) {
            MessageBox.error("Errore durante il download del Report");
          } finally {
            this.hideBusy(0);
          }
        },
        moveToArchive: async function (oEvent) {
          // UPDATE X ARCHIVIO CHIAMATA IN CHIAVE /ENTITY(KEY ES: ID = 'CICCIO')
          //  BODY  { ARCHIVIAZIONE : TRUE , DATA_ARCHIVIAZIONE : NEW dATE() }

          let tableID;
          let oModel;
          let part = oEvent
            .getSource()
            .getParent()
            .getParent()
            .getParent()
            .getParent()
            .getParent()
            .getSelectedKey();
          if (part === "06") {
            tableID = "tableScartati";
            oModel = this.getOwnerComponent().getModel("fileScartatiV2");
          } else if (part === "05") {
            tableID = "tableInvoice";
          } else if (part === "04") {
            tableID = "treetableSB";
          }
          let table = this.getView().byId(tableID);
          let indices = this.getView().byId(tableID).getSelectedIndices();

          if (indices.length > 0) {
            let aSelectedItems = indices.map(function (iIndex) {
              return table.getContextByIndex(iIndex).getObject();
            });
            let promises = [];
            aSelectedItems.forEach((el) => {
              promises.push(
                new Promise((resolve, reject) =>
                  resolve(
                    API.updateEntity(
                      oModel,
                      `/FileScartati(id=${el.id})`,
                      { archiviazione: true, data_archiviazione: new Date() },
                      "PUT"
                    )
                  )
                )
              );
            });
            let out = await Promise.allSettled(promises);
            let flag = false;
            out.forEach((x) => {
              if (x.status != "fulfilled") {
                flag = true;
              }
            });
            let that = this;
            if (flag) {
              MessageBox.error("Errore nell'archiviazione dei file");
            } else {
              MessageBox.success("File archiviati con successo", {
                onClose: async () => {
                  let selectedKey;
                  that.byId("idIconTabBar")
                    ? (selectedKey = that.byId("idIconTabBar").getSelectedKey())
                    : undefined;
                  if (selectedKey !== undefined) {
                    table.clearSelection();
                    await that._refreshData(selectedKey);
                  }
                },
              });
            }
          } else {
            MessageBox.error("Selezionare almeno un elemento");
          }
        },
        dettaglioNav: function (oEvent) {
          let level, detailPath, detail;
          if (
            oEvent.getSource().getParent().getBindingContext("master3") !==
            undefined
          ) {
            level = oEvent
              .getSource()
              .getParent()
              .getBindingContext("master3")
              .getPath()
              .includes("posizioni");
            detailPath = oEvent
              .getSource()
              .getParent()
              .getBindingContext("master3")
              .getPath();
            detail = this.getView()
              .getModel("master3")
              .getProperty(`${detailPath}`);
            this.getOwnerComponent()
              .getModel("datiAppoggio")
              .setProperty("/testata", detail);
            this.getOwnerComponent()
              .getModel("datiAppoggio")
              .setProperty("/posizioni", detail.posizioni);
            if (level) {
              this.getOwnerComponent()
                .getModel("datiAppoggio")
                .setProperty("/posizioneCorrente", detail);
              this.getOwnerComponent()
                .getModel("datiAppoggio")
                .setProperty("/schedulazioni", detail.schedulazioni.results);
              this.getOwnerComponent()
                .getModel("datiAppoggio")
                .setProperty(
                  "/testata",
                  this.getModel("master3").getProperty(
                    `${detailPath[0] + detailPath[1]}`
                  )
                );
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
            } else {
              detailPath = oEvent
                .getSource()
                .getParent()
                .getBindingContext("master3")
                .getPath();
              this.getRouter().navTo("detailMaster3", {
                id: detail.id,
                idmaster: detail.id_master,
                layout: "OneColumn",
              });
            }
          } else if (
            oEvent.getSource().getParent().getBindingContext("master3CO") !==
            undefined
          ) {
            detailPath = oEvent
              .getSource()
              .getParent()
              .getBindingContext("master3CO")
              .getPath();
            detail = this.getView()
              .getModel("master3CO")
              .getProperty(`${detailPath}`);
            this.getRouter().navTo("dettCallOff", {
              id: detail.id,
              idmaster: detail.id_master,
              layout: "OneColumn",
            });
          } else if (
            oEvent.getSource().getParent().getBindingContext("master3SB") !==
            undefined
          ) {
            detailPath = oEvent
              .getSource()
              .getParent()
              .getBindingContext("master3SB")
              .getPath();
            detail = this.getModel("master3SB").getProperty(`${detailPath}`);
            this.getRouter().navTo("dettSelfBilling", {
              id: detail.id,
              layout: "OneColumn",
            });
          }
        },
        navToHome: function () {
          this.getRouter().navTo("home");
        },
        handleCloseDetail: function () {
          this.getRouter().navTo("master3");
        },
        navToArchive: function () {
          this.getRouter().navTo("archivio");
        },
        onClose: function (oEvent) {
          oEvent.getSource().getParent().close();
        },
      }
    );
  }
);
