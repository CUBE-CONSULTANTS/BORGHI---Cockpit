sap.ui.define(
	["sap/ui/model/json/JSONModel", "sap/ui/model/BindingMode", "sap/ui/Device"],
	function (JSONModel, BindingMode, Device) {
		"use strict";

		return {
			createUserModel: function () {
				return new JSONModel({
					username: "",
				});
			},
			createLayoutModel: function () {
				return new JSONModel({
					layout: "OneColumn"
				});
			},
			createDeviceModel: function () {
				let oModel = new JSONModel(Device);
				oModel.setDefaultBindingMode(BindingMode.OneWay);
				return oModel;
			},
			createMainModel: function () {
				return new JSONModel({
					visibility: false,
					editable: false,
					enabled: false,
					busy: false,
					selected: false,
          backToMon: false,
          backToArch: false
				});
			},
      createCountModel: function () {
				return new JSONModel({
					delivery: "",
          calloff: "",
          selfbilling: "",
				});
			},
      createPaginationModel: function(){
        return new JSONModel({
          pageSize: 20,
          currentPage: 0,
          totalCount: 0,
          isLoading: false,
          hasMore: true 
        })
      },
			createEdiFiltersModel: function () {
				return new JSONModel({
					delivery: {
            dataRic : null,
            numProg: {
							value: null,
							items: [],
						},
            cliente: {
							value: null,
							items: [],
						},
            descrcliente: {
              value: null,
              items: [],
            },
            materiale: {
							value: null,
							items: [],
						},
            stato: {
							value: null,
							items: [],
						},
            messaggio: {
							value: null,
							items: [],
						}
          },
          callOff : {
            dataRic : null,
            clienti : {
							value: null,
							items: [],
						},
            descrcliente:{
              value: null,
              items: [],
            },
            materiale : {
							value: null,
							items: [],
						},
            reason : {
							value: null,
							items: [],
						},
          },
          selfBilling: {
            dataRic : null,
            clienti : {
							value: null,
							items: [],
						},
            descrClienti: {
              value: null,
              items: [],
            },
            fornitori:{
              value: null,
              items: [],
            },
            fatture: {
              value: null,
              items: [],
            }
          },
          desadv: {
           
            numiDoc: {
              value: null,
              items: [],
            },
            numConsegna: {
              value: null,
              items: [],
            },
            numDDTCliente: {
              value: null,
              items: [],
            },
            bp: {
              value: null,
              items: [],
            },
            dataCreaDoc: null
          },
          invoice: {
            numiDoc: {
              value: null,
              items: [],
            },
            numFattVend: {
              value: null,
              items: [],
            },
            dataFattura : null,
            numDocCont: {
              value: null,
              items: [],
            },
            bp: {
              value: null,
              items: [],
            },
            dataDocCont: null
          },
          scartati: {
            dataRic : null,
            nomeFile : {
							value: null,
							items: [],
						},
          }
				});
			},
 
		};
	}
);