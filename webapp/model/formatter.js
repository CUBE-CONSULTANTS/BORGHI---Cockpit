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
      debugger
      const date = new Date(ms); // ms è UTC ma Date lo converte in locale
      const hours = date.getHours(); 
      const minutes = date.getMinutes(); 
      const seconds = date.getSeconds(); 

      const timezoneOffset = -date.getTimezoneOffset(); // in minuti
      const sign = timezoneOffset >= 0 ? '+' : '-';
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const timezoneFormatted = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${timezoneFormatted}`;
    },
    formatDateString: function (dateString) {
      if (!dateString) return ""; 
      const timestampMatch = dateString.match(/\d+/);
      if (!timestampMatch) return "";
      const timestamp = parseInt(timestampMatch[0], 10);
      const date = new Date(timestamp);
      return date
    },
    parseDate: function (dateStr) {
      let parts = dateStr.split("/");
      return new Date(parts[2], parts[1] - 1, parts[0]);
    },
    convertiDataInTimestampSAP(dataString) {
      let year = dataString.substring(0, 4);
          let month = dataString.substring(4, 6);
          let day = dataString.substring(6, 8);
          let formattedDate = new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
          return formattedDate;
    },
    formatDateToYYYYMMDD(dateString) {
      const date = new Date(dateString);
      const formattedDate = date.getFullYear().toString() +
                            String(date.getMonth() + 1).padStart(2, '0') +
                            String(date.getDate()).padStart(2, '0');
      return formattedDate;
    },
    returnDate: function (sVal,inpPatForm,OutPatForm){
      if (sVal === "" || sVal === undefined || sVal === null || sVal === "00000000") {
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
    formattedPerc:function (val){
      if (typeof val === 'string' && val.endsWith('-')) {
        let numVal = parseFloat(val.slice(0, -1)) * -1;
        let formatted = numVal.toFixed(2);
        return formatted + ' %';
      } else {  
        let numVal = parseFloat(val);
        if (isNaN(numVal)) {
          return 'N/A %'; 
        }
        let formatted = numVal.toFixed(2);
        return formatted + ' %';
      }
    },
    convertNegative: function(value) {
      if (typeof value === "string" && value.endsWith("-")) {
        return (-parseFloat(value.slice(0, -1))).toFixed(2)
      }
      return parseFloat(value).toFixed(2)
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