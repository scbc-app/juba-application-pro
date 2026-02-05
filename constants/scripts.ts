import {} from '../types';

const CODE_CONTROLLER = `
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(30000); 
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const body = e.postData ? JSON.parse(e.postData.contents) : {};
    return routeRequest(ss, body);
  } catch (err) {
    return ResponseBuilder.error(err.toString());
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return DataHandlers.handleGetRequest(ss);
}

function routeRequest(ss, body) {
  const action = body.action;
  const routes = {
    'login': () => AuthHandlers.handleLogin(ss, body),
    'register_user': () => AuthHandlers.handleRegisterUser(ss, body),
    'get_users': () => AuthHandlers.handleGetUsers(ss),
    'delete_user': () => AuthHandlers.handleDeleteUser(ss, body),
    'update_user': () => AuthHandlers.handleUpdateUser(ss, body),
    'manage_fleet': () => SystemHandlers.handleManageFleet(ss, body),
    'bulk_manage_fleet': () => SystemHandlers.handleBulkManageFleet(ss, body),
    'update_settings': () => SystemHandlers.handleUpdateSettings(ss, body)
  };
  if (!action || action === 'create' || !routes[action]) return DataHandlers.handleDataSubmission(ss, body);
  return routes[action]();
}`;

const CODE_AUTH = `
const AuthHandlers = {
  handleLogin: function(ss, body) {
    let userSheet = ss.getSheetByName('Users');
    if (!userSheet) return ResponseBuilder.error("No users found.");
    const data = userSheet.getDataRange().getValues();
    const username = body.username.toLowerCase();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0].toLowerCase() === username && data[i][1] === body.password) {
            return ResponseBuilder.success({ user: { username: data[i][0], name: data[i][2], role: data[i][3] } });
        }
    }
    return ResponseBuilder.error("Invalid credentials.");
  },
  handleRegisterUser: function(ss, body) {
    let sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
    sheet.appendRow([body.username.toLowerCase(), body.password, body.name, body.role, body.position, new Date().toISOString(), "{}", "TRUE"]);
    return ResponseBuilder.success();
  },
  handleGetUsers: function(ss) {
    let sheet = ss.getSheetByName('Users');
    if (!sheet) return ResponseBuilder.success({ users: [] });
    const data = sheet.getDataRange().getValues();
    const users = data.slice(1).map(r => ({ username: r[0], name: r[2], role: r[3], position: r[4], isActive: r[7] === "TRUE" }));
    return ResponseBuilder.success({ users });
  },
  handleDeleteUser: function(ss, body) {
    let sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === body.username.toLowerCase()) {
        sheet.deleteRow(i + 1);
        return ResponseBuilder.success();
      }
    }
    return ResponseBuilder.error("User not found");
  },
  handleUpdateUser: function(ss, body) {
    let sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === (body.originalUsername || body.username).toLowerCase()) {
        if (body.username) sheet.getRange(i + 1, 1).setValue(body.username);
        if (body.password) sheet.getRange(i + 1, 2).setValue(body.password);
        if (body.name) sheet.getRange(i + 1, 3).setValue(body.name);
        if (body.role) sheet.getRange(i + 1, 4).setValue(body.role);
        if (body.position) sheet.getRange(i + 1, 5).setValue(body.position);
        if (body.isActive !== undefined) sheet.getRange(i + 1, 8).setValue(body.isActive ? "TRUE" : "FALSE");
        if (body.preferences) sheet.getRange(i + 1, 7).setValue(JSON.stringify(body.preferences));
        return ResponseBuilder.success();
      }
    }
    return ResponseBuilder.error("User not found");
  }
};`;

const CODE_CORE_OPS = `
const DataHandlers = {
  handleDataSubmission: function(ss, body) {
    let sheet = ss.getSheetByName(body.sheet) || ss.insertSheet(body.sheet);
    if (sheet.getLastRow() === 0 && body.headers) sheet.appendRow(body.headers);
    sheet.appendRow(body.row);
    return ResponseBuilder.success();
  },
  handleGetRequest: function(ss) {
    const data = {};
    ss.getSheets().forEach(sheet => {
      const name = sheet.getName();
      const lastRow = sheet.getLastRow();
      if (lastRow === 0) { data[name] = []; return; }
      if (name === 'Validation_Data') {
         const values = sheet.getDataRange().getValues();
         const columns = {};
         if (values.length > 0) {
             const headers = values[0];
             headers.forEach((h, idx) => {
                 columns[h] = values.slice(1).map(r => r[idx]).filter(v => v !== "");
             });
         }
         data[name] = columns;
      } else {
         data[name] = sheet.getDataRange().getValues();
      }
    });
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
};

const SystemHandlers = {
  handleManageFleet: function(ss, body) {
    let sheet = ss.getSheetByName('Validation_Data') || ss.insertSheet('Validation_Data');
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow(["Driver_Name","Inspector_Name","Location","Position","Misc1","Misc2","Misc3","Truck_Reg_No","Trailer_Reg_No"]);
      sheet.setFrozenRows(1);
    }
    
    const colIdx = body.type === 'truck' ? 8 : 9; 
    const range = sheet.getRange(1, colIdx, Math.max(1, sheet.getLastRow()), 1);
    const colValues = range.getValues().flat();
    const firstEmpty = colValues.indexOf("");
    const targetRow = firstEmpty === -1 ? sheet.getLastRow() + 1 : firstEmpty + 1;
    
    sheet.getRange(targetRow, colIdx).setValue(body.value);
    return ResponseBuilder.success({ message: "Asset added" });
  },

  handleBulkManageFleet: function(ss, body) {
    let sheet = ss.getSheetByName('Validation_Data') || ss.insertSheet('Validation_Data');
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow(["Driver_Name","Inspector_Name","Location","Position","Misc1","Misc2","Misc3","Truck_Reg_No","Trailer_Reg_No"]);
      sheet.setFrozenRows(1);
    }
    
    const trucks = body.trucks || [];
    const trailers = body.trailers || [];

    const getFirstEmptyInCol = (col) => {
        const vals = sheet.getRange(1, col, Math.max(1, sheet.getLastRow()), 1).getValues().flat();
        const idx = vals.indexOf("");
        return idx === -1 ? sheet.getLastRow() + 1 : idx + 1;
    };

    if (trucks.length > 0) {
        const startRow = getFirstEmptyInCol(8);
        sheet.getRange(startRow, 8, trucks.length, 1).setValues(trucks.map(t => [t]));
    }
    
    if (trailers.length > 0) {
        const startRow = getFirstEmptyInCol(9);
        sheet.getRange(startRow, 9, trailers.length, 1).setValues(trailers.map(t => [t]));
    }

    return ResponseBuilder.success({ message: "Bulk import complete" });
  },

  handleUpdateSettings: function(ss, body) {
    let sheet = ss.getSheetByName('System_Settings') || ss.insertSheet('System_Settings');
    const row = [
      body.companyName, 
      body.managerEmail, 
      new Date(), 
      "Admin", 
      body.companyLogo || "", 
      body.mobileApkLink || "", 
      body.webAppUrl || "", 
      body.maintenanceMode ? "TRUE" : "FALSE", 
      body.maintenanceMessage || ""
    ];
    if (sheet.getLastRow() < 2) sheet.appendRow(["A","B","C","D","E","F","G","H","I"]);
    sheet.getRange(2, 1, 1, row.length).setValues([row]);
    return ResponseBuilder.success();
  }
};`;

const CODE_LIB = `const ResponseBuilder = {
  success: function(data = {}) { return this.build({ status: "success", ...data }); },
  error: function(message) { return this.build({ status: "error", message: message }); },
  build: function(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
};`;

export const BACKEND_FILES: Record<string, string> = {
    '1_Controller.gs': CODE_CONTROLLER,
    '2_Auth.gs': CODE_AUTH,
    '3_Core.gs': CODE_CORE_OPS,
    '5_Utils.gs': CODE_LIB
};

export const BACKEND_SCRIPT_TEMPLATE = Object.values(BACKEND_FILES).join('\n\n');