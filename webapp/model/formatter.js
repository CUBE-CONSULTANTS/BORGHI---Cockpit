sap.ui.define([
  "sap/ui/core/format/DateFormat" 
], function (DateFormat) {
  "use strict";

	return {
		formatValue: function (value) {
			return value && value.toUpperCase();
		},
    formatDate: function (date) {
      if (date) {
        var oDateFormat = DateFormat.getDateTimeInstance({
          pattern: "dd/MM/yyyy",
        });
        return oDateFormat.format(new Date(date));
      }
      return "";
    },
    formatTime: function(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
  
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
    formatMs: function(ms) {
      debugger
      
      let newDate = new Date(ms)
      let Time = newDate.toISOString().slice(11, 19)
      return Time
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