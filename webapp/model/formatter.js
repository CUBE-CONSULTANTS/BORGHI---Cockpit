sap.ui.define([
  "sap/ui/core/format/DateFormat" 
], function (DateFormat) {
  "use strict";

	return {
		formatValue: function (value) {
			return value && value.toUpperCase();
		},
    formatDate: function (date) {
      debugger
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
    returnDate: function (sVal,inpPatForm,OutPatForm){
      if (sVal === "" || sVal === undefined || sVal === null) {
          return "";
        }      
        let inputFormat = DateFormat.getDateInstance({
            pattern: inpPatForm
        });
        let inputDate = inputFormat.parse(sVal);
        let outputFormat = DateFormat.getDateInstance({
          pattern: OutPatForm
        });
        return outputFormat.format(inputDate);   
    },
    checkValidExt: function(ext){
      const extUpperCase = ext.toUpperCase();
      if(extUpperCase === "DOC" || extUpperCase === "JPG" || extUpperCase === "PNG" || extUpperCase ==="XLS" || extUpperCase === "ZIP" || extUpperCase === "PDF"){
        return true
      }
      return false
    }
	};
});