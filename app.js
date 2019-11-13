var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0){
    this.percentage = Math.round(this.value / totalIncome * 100);
    }
    else this.percentage = -1;
  }

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0
    data.allItems[type].forEach(element => {
      sum+=element.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    budget: 0,
    percentage: -1,
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
      ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
          ID = 0;
      }

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);


      return newItem;
    },

    deleteItem: function(type, ID) {

      for (var i=0;i<data.allItems[type].length; i++)
      {
        if (data.allItems[type][i].id === ID){
        data.allItems[type].splice(i, 1);
        break;
        }
      }
      
    },

    calculateBudget: function () {
      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
      
      }
    },

    getBudget: function () {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalExp: data.totals.exp,
        totalInc: data.totals.inc
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(element => {
        element.calcPercentage(data.budget);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      })
      return allPerc;
    },

    testing: function() {
        return data;
    }
  };
})();

var uiController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: '.container',
    itemPercentage: '.item__percentage',
    dateLabel: '.budget__title--month'
    
    
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,3);
    }

    type === 'exp' ? sign = '-' : sign = '+';

    return (type === 'exp' ?  '- ' :  '+ ') + int + '.' + dec;
  
  };

  var nodeListForEach = function(list, callback) {
    for (var i=0; i<list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
        var html, element;
        // Create HTML with placeholder
        if (type=== 'inc')
        {
            element = DOMstrings.incomeContainer;
            html = `<div class="item clearfix" id="inc-${obj.id}"> <div class="item__description">${obj.description}</div> <div class="right clearfix"> <div class="item__value">${formatNumber(obj.value, 'inc')}</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>`;
        }
        else if (type === 'exp')
        {
            element = DOMstrings.expenseContainer;
            html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${formatNumber(obj.value, 'exp')}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
        }


        // Replace placeholder with data

        // Insert HTML -> DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', html); 
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArray;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      
      fieldsArray = Array.prototype.slice.call(fields);
      
      fieldsArray.forEach(element => {
        element.value = "";
      });

      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

      if (obj.percentage>0)
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      else
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.itemPercentage);


      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0)
          current.textContent = percentages[index] + '%';
        else
          current.textContent = '---';  
      });
    }, 

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();

      month = now.toLocaleString('en-us', { month: 'long' });
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
    },

    changeType: function() {
      var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });
    },


    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

var controller = (function(budgetCtrl, uiCtrl) {
  var setupEventListeners = function() {
    var DOMstrings = uiCtrl.getDOMstrings();
    document
      .querySelector(DOMstrings.inputButton)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOMstrings.inputType).addEventListener('change', uiController.changeType);
  };
  var updateBudget = function() {
    // 1. Calculate the budget
    budgetController.calculateBudget();
    // 2. Return the budget
    var budget = budgetController.getBudget();
    // 3. Display the budget on the UI
    uiController.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. Calculate
    budgetController.calculatePercentages();

    // 2. read from budget

    var percentages = budgetController.getPercentages();
    // 3. update UI

    uiController.displayPercentages(percentages);
  }

  var ctrlAddItem = function() {
    var input, newItem;  

    // 1. Get data
    input = uiController.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
    // 2. Add item to budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    // 3. Add item to UI
    uiController.addListItem(newItem, input.type);
    uiController.clearFields();
    // 4. Calculate and update budget
    updateBudget();
    updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]); 

      // 1. Delete from Data
      budgetController.deleteItem(type, ID);
      // 2. Delete from UI
      uiController.deleteListItem(itemID);
      // 3. Update and show new budget
      updateBudget();
      //updatePercentages();
    }
  }

  return {
    init: function() {
      uiController.displayMonth();
      uiController.displayBudget({
        budget: 0,
        percentage: 0,
        totalExp: 0,
        totalInc: 0  
      })
      console.log("Started");
      setupEventListeners();
    }
  };
})(budgetController, uiController);

controller.init();
