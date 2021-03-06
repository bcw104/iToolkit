riot.tag('super-form', '<form onsubmit="{ submit }" > <yield> </form>', function(opts) {

    var self = this;
    var EL = self.root;
    var config = self.opts.opts || self.opts;
    var keyWords = [
        'insertTip',
        'ajaxSubmit',
        'submit',
        'removeTips',
        'insertTip',
        'removeTip',
        'loadData',
        'getData',
        'setData'
    ];   //保留字，不被覆盖

    var NUMBER_REGEXP = {
        NON_NEGATIVE_INT: /^0$|^-[1-9]\d*$/,                            //非负整数（正整数 + 0） 
        POSITIVE_INT: /^[1-9]\d*$/,                                     //正整数 
        NON_POSITIVE_INT: /^[1-9]\d*$|^0$/,                             //非正整数（负整数 + 0） 
        NEGATIVE_INT: /^-[1-9]\d*$/,                                    //负整数 
        INT: /^-?[1-9]\d*$|^0$/,                                        //整数 
        NON_NEGATIVE_FLOAT: /^(\d)(\.\d+)?$|^([1-9]\d*)(\.\d+)?$|^0$/,  //非负浮点数（正浮点数 + 0） 
        POSITIVE_FLOAT: /^(\d)(\.\d+)?$|^([1-9]\d*)(\.\d+)?$/,          //正浮点数 
        NON_POSITIVE_FLOAT: /^(-\d)(\.\d+)?$|^(-[1-9]\d*)(\.\d+)?$|^0$/,//非正浮点数（负浮点数 + 0） 
        NEGATIVE_FLOAT: /^(-\d)(\.\d+)?$|^(-[1-9]\d*)(\.\d+)?$/,        //负浮点数 
        FLOAT: /^(-?\d)(\.\d+)?$|^(-?[1-9]\d*)(\.\d+)?$|^0$/            //浮点数
    };

    self.presentWarning = '必填';
    self.emailWarning = '邮箱格式错误';
    self.mobileWarning = '手机格式错误';
    self.urlWarning = '网址格式错误';
    self.successTips = '通过';
    self.regWarning = '字段不符合验证规则';
    self.numWarning = '数字格式错误';

    self.passClass = config.passClass || 'valid-pass';
    self.failedClass = config.failedClass || 'valid-failed';

    
    var comparator = function (type) {
        return {
            handler: function (min, max, dom, value, validArr, name) {
                switch (type) {
                    case 'number':
                        return numComparator(min, max, dom, value, validArr, name);
                    case 'string':
                    default:
                        return strCompatator(min, max, dom, value, validArr, name);
                }
            }
        };
    };

    
    function strCompatator(min, max, dom, value, validArr, name) {
        var nMin = isNaN(min);
        var nMax = isNaN(max);
        var len = value.length;
        if (!nMin && !nMax) {
            if (len > max || len < min) {
                validArr.push(name);
                self.onValidRefuse(dom, self.bpWarning(min, max));
            }
            else {
                self.onValidPass(dom, self.successTips);
            }
        }
        else {
            if (!nMin) {
                if (len < min) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.minWarning(min));
                }
                else {
                    self.onValidPass(dom, self.successTips);
                }
            }
            if (!nMax) {
                if (len > max) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.maxWarning(max));
                }
                else {
                    self.onValidPass(dom, self.successTips);
                }
            }
            if (nMax && nMin) {
                self.onValidPass(dom, self.successTips);
            }
        }
    }

    
    function numComparator(min, max, dom, value, validArr, name) {
        var nMin = isNaN(min);
        var nMax = isNaN(max);
        var value = +value;
        if (!nMin && !nMax) {
            if (value > max || value < min) {
                validArr.push(name);
                self.onValidRefuse(dom, self.numBpWarning(min, max));
            }
            else {
                self.onValidPass(dom, self.successTips);
            }
        }
        else {
            if (!nMin) {
                if (value < min) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.minNumWarning(min));
                }
                else {
                    self.onValidPass(dom, self.successTips);
                }
            }
            if (!nMax) {
                if (value > max) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.maxNumWarning(max));
                }
                else {
                    self.onValidPass(dom, self.successTips);
                }
            }
            if (nMax && nMin) {
                self.onValidPass(dom, self.successTips);
            }
        }
    }

    self.one('mount', function() {
        EL.style.display = 'block';
        if (config.realTime && config.valid) {
            var elems = self.root.getElementsByTagName('form')[0].elements;
            for (var i = 0, len = elems.length; i < len; i ++) {
                var type = elems[i].type;
                if (type !== 'submit' || type !== 'button') {
                    elems[i].addEventListener('input', valueOnChange, false);
                    if (type === 'checkbox' || type === 'radio') {
                        elems[i].addEventListener('change', valueOnChange, false);
                        
                    }
                    elems[i].addEventListener('input', valueOnChange, false);
                }
                
            }
        }
    });

    
    function valueOnChange(e) {
        doCheck([], this);
    }

    function isType(obj) {
        return toString.call(obj).match(/\ (.*)\]/)[1];
    }

    function dif(obj) {
        var constructor = isType(obj);
        if (constructor === 'Null' || constructor === 'Undefined' || constructor === 'Function') {
            return obj;
        }
        return new window[constructor](obj);
    }

    EL.loadData = function(newData, colName){
        if (utils.isObject(newData)) {
            for(var i in newData) {
                newData[i] = dif(newData[i]);
            }
        }
        else {
            newData = dif(newData);
        }
        colName = colName || 'data';
        self[colName] = newData;





        self.update();
    };

    EL.setData = function(newData, name){
        self.data[name] = dif(newData);
        self.update();
    };

    self.checkExistKey = function(obj, key, value) {
        if (obj.hasOwnProperty(key)) {
            if (utils.isArray(obj[key])) {
                obj[key].push(value);
            }
            else {
                var arr = [];
                arr.push(obj[key]);
                arr.push(value)
                obj[key] = arr;
            }                  
        }
        else {
            obj[key] = value;
        }
    }

    self.getData = EL.getData = function(){
        var elems = self.root.getElementsByTagName('form')[0].elements;
        var params = {};
        for (var i = 0; i < elems.length; i++) {
            if (elems[i].name) {
                if (elems[i].tagName === "SELECT") {
                    var selected = elems[i].selectedOptions;
                    for (j = 0; j < selected.length; j++) {
                        value = selected[j].value;
                        self.checkExistKey(params, elems[i].name, encodeURIComponent(value));
                    }
                } 
                else if (elems[i].type === "checkbox" || elems[i].type === "radio"){
                    if (elems[i].checked) {
                        value = elems[i].value;
                        self.checkExistKey(params, elems[i].name, encodeURIComponent(value));
                    }
                }
                else {
                    value = elems[i].value;
                    self.checkExistKey(params, elems[i].name, encodeURIComponent(value));
                }
            }
        }
        return params;
    }
    
    

    for (i in config) {
        if (keyWords.indexOf(i) < 0) {
            self[i] = config[i];
        }
    }
    self.data = config.data;

    self.submitingText = config.submitingText || '提交中...';
    if (config.valid === undefined) {
        config.valid = true;
    }
    
    self.maxWarning = config.maxWarning || function(n) {
        return '不得超过' + n + '个字符';
    }
    self.minWarning = config.minWarning || function(n) {
        return '不得小于' + n + '个字符';
    }

    self.bpWarning = config.bpWarning || function (min, max) {
        return '只允许' + min + '-' + max + '个字符';
    }

    self.minNumWarning = config.minNumWarning || function (n) {
        return '不得小于' + n;
    }
    self.maxNumWarning = config.maxNumWarning || function (n) {
        return '不得大于' + n;
    }
    self.numBpWarning = config.numBpWarning || function (min, max) {
        return '输入数字应在' + min + '-' + max + '之间';
    }

    
    self.removeTips = EL.removeTips = function() {
        var root = self.root;
        var elems = root.getElementsByTagName('form')[0].elements;
        var tips = root.getElementsByClassName('tip-container');
        if (tips && tips.length) {
            del();
        }

        function del() {
            for (i = 0; i < tips.length; i++) {
                tips[i].parentNode.removeChild(tips[i]);                
                if (tips.length) {
                    del();
                }
            }
        }

        for (var i = 0; i < elems.length; i++) {
            utils.removeClass(elems[i], self.passClass);
            utils.removeClass(elems[i], self.failedClass);
        }
    }
    
    
    self.removeTip = EL.removeTip = function(dom){
        var tip = dom.nextElementSibling;
        if (tip && tip.className.match(/tip-container/)) {
            dom.parentNode.removeChild(tip);
        }
        utils.removeClass(dom, self.passClass);
        utils.removeClass(dom, self.failedClass);
    };

    self.insertTip = EL.insertTip = function(dom, message, className){
        var tip = dom.nextElementSibling;
        if (tip && tip.className.match(/tip-container/)) {
            dom.parentNode.removeChild(tip);
        }
        var tipContainer = document.createElement('span');
        tipContainer.className = className;
        tipContainer.innerHTML = message;
        utils.insertAfterText(tipContainer, dom);
    };

    self.onValidRefuse = EL.onValidRefuse = config.onValidRefuse || function(dom, errorTips) {
        self.insertTip(dom, errorTips, 'tip-container');
        utils.removeClass(dom, self.passClass);
        utils.addClass(dom, self.failedClass);
    };

    self.onValidPass = EL.onValidPass = config.onValidPass || function(dom, successTips) {
        self.insertTip(dom, successTips, 'tip-container success');
        utils.removeClass(dom, self.failedClass);
        utils.addClass(dom, self.passClass);
    };

    
    self.ajaxSubmit = function(elems, url) {
        var params = '';
        for (var i = 0; i < elems.length; i++) {
            if (elems[i].name) {
                if (elems[i].tagName === "SELECT") {
                    var selected = elems[i].selectedOptions;
                    for (j = 0; j < selected.length; j++) {
                        value = selected[j].value;
                        params += elems[i].name + "=" + encodeURIComponent(value) + "&";
                    }
                } 
                else if (elems[i].type === "checkbox" || elems[i].type === "radio"){
                    if (elems[i].checked) {
                        value = elems[i].value;
                        params += elems[i].name + "=" + encodeURIComponent(value) + "&";
                    }
                }
                else {
                    value = elems[i].value;
                    params += elems[i].name + "=" + encodeURIComponent(value) + "&";
                }
            }
            if (elems[i].type === "submit") {
                if (elems[i].tagName === 'BUTTON') {
                    var submitbtn = elems[i];
                    var submitText = submitbtn.innerHTML;
                    submitbtn.disabled = 'disabled';
                    submitbtn.innerHTML = self.submitingText;
                }
                else {
                    var submitbtn = elems[i];
                    var submitText = submitbtn.value;
                    submitbtn.disabled = 'disabled';
                    submitbtn.value = self.submitingText;
                }
            }
        }
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(params);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4) {
                self.removeTips();
                if (submitbtn.tagName === 'BUTTON') {
                    submitbtn.innerHTML = submitText;
                }
                else {
                    submitbtn.value = submitText;
                }
                submitbtn.disabled = false;
                if (config.complete && typeof config.complete === 'function') {
                    config.complete();
                }
                if (xmlhttp.status === 200) {
                    try {
                        var result = JSON.parse(xmlhttp.responseText);
                        config.callback && config.callback(result);
                        EC.trigger('submit_success', result);
                    }catch(e){
                        throw new Error(e.message);
                    }
                }
                else {
                    config.errCallback && config.errCallback(params);
                    EC.trigger('submit_error', params);
                }
            } 
        };
    }
    
    
    this.submit = function(e) {
        var validArr = [];
        var elems = self.root.getElementsByTagName('form')[0].elements;
        var action = self.action || self.root.getAttribute('action');
        var url = action;

        if (config.valid) {
            for (var i = 0; i < elems.length; i++) {
                doCheck(validArr, elems[i]);
            }
        }

        if (!validArr.length) {
            try {
                config.beforeSubmit && config.beforeSubmit(validArr);
            }
            catch (e) {
                validArr.push(e);
            }
        }

        if (!validArr.length) {

            if (config.normalSubmit) {
                self.root.firstChild.setAttribute('action', action);
                return true;
            }
            else {
                e.preventDefault();
                self.ajaxSubmit(elems, url);
            }
        }
        else {
            return false;
        }
    }.bind(this);

    
    function doCheck(validArr, elem) {
        var elem = elem;
        var valid = elem.getAttribute('valid');
        var customValid = elem.getAttribute('customValid');
        var vr = elem.getAttribute('vr');
        var orient = elem.getAttribute('orient');
        var max = parseInt(elem.getAttribute('max'), 10);
        var min = parseInt(elem.getAttribute('min'), 10);
        var type = elem.type;
        var allowEmpty = elem.getAttribute('allowEmpty');
        var v = elem.value; 
        var name = elem.name;
        var dom = elem;

        if (
            allowEmpty === null
            && isNaN(max)
            && isNaN(min)
            && valid === null
            && customValid === null
            && vr === null
            && orient === null
        ) {
            return;
        }
        if (allowEmpty && (v === '' || typeof v !== 'string')) {
            self.onValidPass(dom, self.successTips);
            return;
        }
        if (name && valid) {
            if (valid === 'email') {
                if (!v.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/)) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.emailWarning);
                }
                else {
                    self.onValidPass(dom, self.successTips); 
                }
            }
            else if (valid === 'mobile') {
                if (!v.match(/^1[3|4|5|8][0-9]\d{4,8}$/)) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.mobileWarning);
                }
                else {
                    self.onValidPass(dom, self.successTips); 
                }
            }
            else if (valid === 'url') {
                if (!v.match(/((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/)) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.urlWarning);
                }
                else {
                    self.onValidPass(dom, self.successTips); 
                }
            }
            else if (valid === 'present') {
                v = v.replace(' ', '');
                if (!v.length) {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.presentWarning);
                }
                else {
                    comparator('string').handler(min, max, dom, v, validArr, name);
                }
            }
            else if (valid.match(/^\/\S+\/$/)) {
                valid = valid.replace(/^\//, '');
                valid = valid.replace(/\/$/, '');
                var reg = new RegExp(valid);
                if (reg.test(v)) {
                    comparator('string').handler(min, max, dom, v, validArr, name);
                }
                else {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.regWarning);
                }
            }
            else if (NUMBER_REGEXP[valid.toUpperCase()]) {
                var reg = NUMBER_REGEXP[valid.toUpperCase()];
                if (reg.test(v)) {
                    comparator('number').handler(min, max, dom, v, validArr, name);
                }
                else {
                    validArr.push(name);
                    self.onValidRefuse(dom, self.numWarning);
                }
            }
        }
        else if (name && !valid) {
            if (customValid) {
                if (window[customValid]) {
                    var reg = window[customValid].regExp;
                    var tips = window[customValid].message || self.regWarning;
                    if (reg && reg.test(v)) {
                        comparator('string').handler(min, max, dom, v, validArr, name); 
                    }
                    else {
                        validArr.push(name);
                        self.onValidRefuse(dom, tips);
                    }
                }
            }
            else {
                if (type === 'text') {
                    comparator('string').handler(min, max, dom, v, validArr, name);
                }
            }
        }
        if (orient) {
            var newEle = EL.querySelector(orient);
            if (elem === newEle || !newEle) {
                return;
            }
            elem = newEle;
            vr = elem.getAttribute('vr');
        }
        if (!validArr.length && vr) {
            var arr = vr.split('::');
            var method = arr[0];
            var params = arr[1] ? arr[1].split(',') : undefined;
            var flag = false;
            try {
                if (iToolkit[method]) {
                    flag = iToolkit[method].apply(elem, params);
                }
            }
            catch (e) {
                flag = false;
                throw e;
            }
            if (!flag) {
                validArr.push('fail');
            }
        }
    }


});