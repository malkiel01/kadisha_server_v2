// מלאי ההרשאות, כרגע לא מתקבל מהשרת
const allPermission = [
    [
        'setCemetery', 'setCemeteries','getCemeteryById','getCemeteries','updateCemetery','updateCemeteries','removeCemetery','deleteCemeteries',
        'setBlock', 'setBlocks','getBlockById','getBlocks','updateBlock','updateBlocks','removeBlock','deleteBlocks',
        'setPlot', 'setPlots','getPlotById','getPlots','updatePlot','updatePlots','removePlot','deletePlots',
        'setAreaGrave', 'setAreaGraves','getAreaGraveById','getAreaGraves','updateAreaGrave','updateAreaGraves','removeAreaGrave','deleteAreaGraves',
        'getCustomers', 'setCustomers',
        'getPurchases', 'setPurchases',
        'getBurials', 'setBurials'
    ],[
        'setCemetery',
        'getCemeteryById','getCemeteries','updateCemetery','updateCemeteries','deleteCemetery','deleteCemeteries'    
    ],[
        'setCemetery'
    ]
]

// בדיקת ערך בתוך מערך
const isValueInArray = (array, value) => {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === value) {
        return true; // הערך נמצא במערך
      }
    }
    return false; // הערך לא נמצא במערך
  }

// בדיקת הרשאה מותאמת לשאילתא
const checkPermission = (permission, res) => {
    if (!permission[1].permission) {
        return true
    } else {
        if (allPermission.length >= permission[1].permission) {
            return isValueInArray(allPermission[permission[1].permission],permission[0])  
        }
        return false
    }
}

module.exports = {
    checkPermission
}