function FindObjects(array, propertyName, value) {
    let newArray = [];
    value = value.toString();
    for (let i = 0; i < array.length; i++) {
        let propertyValue = array[i][propertyName].toString();
        if (value.startsWith('*') && value.endsWith('*')) {
            if (propertyValue.includes(value.slice(1, -1))) {
                newArray.push(array[i]);
            }
        } else if (value.startsWith('*')) {
            if (propertyValue.endsWith(value.slice(1))) {
                newArray.push(array[i]);
            }
        } else if (value.endsWith('*')) {
            if (propertyValue.startsWith(value.slice(0, -1))) {
                newArray.push(array[i]);
            }
        } else if (propertyValue === value) {
            newArray.push(array[i]);
        }
    }
    return newArray;
}
function SortObjects(array, propertyName, isDesc = false) {
    
    return array.sort((a, b) => {
        let valueA = a[propertyName];
        let valueB = b[propertyName];

        if (isNaN(valueA) || isNaN(valueB)) {
            valueA = valueA.toString().toLowerCase();
            valueB = valueB.toString().toLowerCase();

            if (isDesc) {
                return valueB.localeCompare(valueA);
            } else {
                return valueA.localeCompare(valueB);
            }
        }
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
        if (isDesc) {
            return valueB - valueA;
        } else {
            return valueA - valueB;
        }
    });
}
function fielteredArray(array, propertiesNames) {
    let newArray = [];
    for (let i = 0; i < array.length; i++)
    {
        let item = {}
        propertiesNames.forEach(propertyName => {
            if (array[i][propertyName]) {
                item[propertyName] = array[i][propertyName];
            }
        });
        newArray.push(item);
    }
    return removeDuplicateObjects(newArray);
}
function removeDuplicateObjects(array) {
    let uniqueObjects = [];
    let seenObjects = {};
    
    for (let obj of array) {
      let stringified = JSON.stringify(obj);
      if (!seenObjects[stringified]) {
        seenObjects[stringified] = true;
        uniqueObjects.push(obj);
      }
    }
  
    return uniqueObjects;
}
function SortedWithOffsetAndLimit(array, limit, offset) {
    limit = parseInt(limit);
    offset = parseInt(offset);
    let newArray = [];
    offset *= limit;
    for (let i = 0; i < limit; i++) {
        let item = array[i + offset];
        if (item != null) {
            newArray.push(item);
        }
    }
    return newArray;
}
export default class CollectionFilter {
    constructor(objects, params = {}, model) {
        this.objects = objects;
        this.params = params;
        this.model = model;
    }

    get() {
        for (let param in this.params) {
            let value = this.params[param]
            if (this.model.isMember(param)) {
                this.objects = FindObjects(this.objects, param, value);
            }
            if (param == "sort") {
                let isDesc = value.endsWith(",desc");
                if (isDesc) {
                    value = value.slice(0, -5);
                }
                if (this.model.isMember(value)) {
                    this.objects = SortObjects(this.objects, value, isDesc);
                }
            }
        }
        if (this.params && this.params.limit && this.params.offset) {
            this.objects = SortedWithOffsetAndLimit(this.objects, this.params.limit, this.params.offset);
        }
        if (this.params && this.params.fields) {
            let fields = this.params.fields.split(",");
            this.objects = fielteredArray(this.objects, fields);
        }
        return this.objects;
    }
}