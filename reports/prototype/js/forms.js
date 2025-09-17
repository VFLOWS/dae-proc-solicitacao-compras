var translation = {
    PT_BR: {
        filterColumns: "Filtrar colunas",
        apply: "Aplicar",
        maximumSelectionLength: "Voc\u00EA s\u00F3 pode selecionar {0} items."
    },
    ES: {
        filterColumns: "Filtrar columnas",
        apply: "Aplicar",
        maximumSelectionLength: "S\u00F3lo puede seleccionar {0} artículos."
    },
    EN_US: {
        filterColumns: "Filter columns",
        apply: "Apply",
        maximumSelectionLength: "You can only select {0} items"
    }
};
function getUserLang() {
    var language = "PT_BR";
    if (window.parent.WCMAPI) {
        language = window.parent.WCMAPI.locale.toUpperCase()
    } else {
        if (navigator.language) {
            if (navigator.language.includes("BR")) {
                language = "PT_BR"
            } else {
                if (navigator.language.includes("es")) {
                    language = "ES"
                } else {
                    language = "EN_US"
                }
            }
        }
    }
    return language
}
var userLang = getUserLang();
var MaskEvent = {
    init: function(event) {
        if (typeof fluigjQuery === "undefined" || fluigjQuery === true) {
            if (typeof jQuery != "undefined") {
                this.initFormJs()
            } else {
                var js = document.createElement("script");
                js.type = "text/javascript";
                js.src = "/portal/resources/js/jquery/jquery.js";
                js.onload = importFormJs;
                document.body.appendChild(js)
            }
        } else {
            if (typeof console != "undefined") {
                console.warn("A vari\u00E1vel fluigjQuery foi definida como false! O Jquery n\u00E3o ser\u00E1 importado pelo fluig e funcionalidades como mascar\u00E1 de campos do Fluig estar\u00E3o desabilitadas!")
            }
        }
    },
    initFormJs: function(e) {
        var _this = this;
        var maskInputs = [];
        var inputs = $("[mask]");
        $.each(inputs, function(k, o) {
            maskInputs.push(o)
        });
        if (maskInputs.length) {
            if (!jQuery().mask) {
                loadJs("/portal/resources/js/jquery.mask.min.js", function() {
                    _this.initMask(maskInputs)
                })
            } else {
                _this.initMask(maskInputs)
            }
        }
    },
    initMask: function(inputs) {
        $.each(inputs, function(i, obj) {
            var inputMask = $(obj);
            var inputID = inputMask.attr("id");
            var inputName = inputMask.attr("name");
            var maskAttr = inputMask.attr("mask");
            var options = {};
            if (maskAttr.indexOf("#") > -1) {
                options.maxlength = false;
                options.reverse = true
            }
            if (inputID) {
                $("#" + inputID).mask(maskAttr, options)
            } else {
                if (inputName) {
                    $("input[type='text'][name='" + inputName + "']").mask(maskAttr, options)
                }
            }
            inputMask.blur(function() {
                var options = {};
                if (maskAttr.indexOf("#") > -1) {
                    options.maxlength = false;
                    options.reverse = true
                }
                inputMask.mask(maskAttr, options)
            })
        })
    }
};
var maxZoomColumns = 4;
function loadJs(src, callback) {
    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = src;
    if (callback) {
        js.onload = callback
    }
    document.body.appendChild(js)
}
function loadCss() {
    var css = '<link rel="stylesheet" type="text/css" href="/style-guide/css/fluig-style-guide-select.min.css" />';
    $("head").append(css)
}
function loadjQuery(callback) {
    if (!window.fluigjQuery || window.fluigjQuery === true) {
        if (window.jQuery) {
            callback()
        } else {
            loadJs("/portal/resources/js/jquery/jquery.js", callback)
        }
    }
}
function hasZoom() {
    if (location.origin == undefined) {
        location.origin = window.location.protocol + "//" + window.location.host
    }
    var inputs = document.getElementsByTagName("input")
      , hasZoom = false;
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].getAttribute("type") == "zoom") {
            hasZoom = true;
            break
        }
    }
    if (hasZoom) {
        loadjQuery(function() {
            loadCss();
            executeAfterLoadStyleGuide(function() {
                loadZoom()
            })
        })
    }
}
function hasRicheditor() {
    if (location.origin == undefined) {
        location.origin = window.location.protocol + "//" + window.location.host
    }
    var inputs = document.getElementsByTagName("textarea")
      , hasRicheditor = false;
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].getAttribute("type") == "richeditor") {
            hasRicheditor = true;
            break
        }
    }
    if (hasRicheditor) {
        loadjQuery(function() {
            loadCss();
            executeAfterLoadStyleGuide(function() {
                loadRicheditor()
            })
        })
    }
}
var callbacksAfterLoad = new Array();
function executeAfterLoadStyleGuide(callback) {
    var isFLUIGCLoaded = !(typeof FLUIGC === "undefined");
    var isSelectLoaded = isFLUIGCLoaded && !(typeof FLUIGC.select === "undefined");
    var isRicheditorLoaded = isFLUIGCLoaded && !(typeof FLUIGC.richeditor === "undefined");
    if (!isFLUIGCLoaded || !isSelectLoaded || !isRicheditorLoaded) {
        callbacksAfterLoad.push(callback)
    } else {
        callback()
    }
    if (callbacksAfterLoad.length == 1) {
        if (!isFLUIGCLoaded) {
            $.getScript(location.origin + "/style-guide/js/fluig-style-guide.min.js", function() {
                loadDependencesStyleGuide()
            })
        } else {
            if (!isSelectLoaded || !isRicheditorLoaded) {
                loadDependencesStyleGuide()
            }
        }
    }
}
function loadDependencesStyleGuide() {
    $.when($.getScript(location.origin + "/style-guide/js/fluig-style-guide-select.min.js"), $.getScript(location.origin + "/style-guide/js/fluig-style-guide-richeditor.min.js")).done(function() {
        for (var i = 0; i < callbacksAfterLoad.length; i++) {
            callbacksAfterLoad[i]()
        }
        callbacksAfterLoad = new Array()
    })
}
function loadRicheditorTablename(tablename) {
    executeAfterLoadStyleGuide(function() {
        $('textarea[type="richeditor"]', '[tablename="' + tablename + '"]').each(function() {
            loadRicheditorForInput(this)
        })
    })
}
function loadZoomTablename(tablename) {
    executeAfterLoadStyleGuide(function() {
        $('input[type="zoom"]', '[tablename="' + tablename + '"]').each(function() {
            loadZoomForInput(this)
        })
    })
}
function loadZoom() {
    String.prototype.replaceAll = String.prototype.replaceAll || function(needle, replacement) {
        return this.split(needle).join(replacement)
    }
    ;
    $('input[type="zoom"]').each(function() {
        if (!$(this).prop("readonly")) {
            loadZoomForInput(this)
        } else {
            $(this).prop("type", "text").addClass("form-control")
        }
    })
}
function loadRicheditor() {
    String.prototype.replaceAll = String.prototype.replaceAll || function(needle, replacement) {
        return this.split(needle).join(replacement)
    }
    ;
    $('textarea[type="richeditor"]').each(function() {
        loadRicheditorForInput(this)
    })
}
function isValidField(index, columnsVisible) {
    return columnsVisible[index] == "true"
}
function returnColumnSize(dataSize) {
    switch (dataSize) {
    case 1:
        return "12";
        break;
    case 2:
        return "6";
        break;
    case 3:
        return "4";
        break;
    case 4:
    default:
        return "3";
        break
    }
}
function getColumnTemplate(column, value, columnSize) {
    var columnTemplate = '<div class="col-sm-' + columnSize + ' col-xs-6">';
    columnTemplate += '<div class="row ">';
    columnTemplate += '<div class="col-sm-12 fs-text-uppercase" style="font-size:10px;color:gray;">' + column + "</div>";
    columnTemplate += "</div>";
    columnTemplate += '<div class="row">';
    columnTemplate += '<div class="col-sm-12 fs-word-break"><strong>' + value + "</strong></div>";
    columnTemplate += "</div>";
    columnTemplate += "</div>";
    return columnTemplate
}
function getSelectItemTemplate(data) {
    if (data.loading) {
        return data.text
    } else {
        if (data.header) {
            var $element = data.data.$element;
            var id = $element.attr("id");
            var labelFilterColumns = translation[userLang].filterColumns;
            var html = '<div class="fluig-style-guide"><div class="row fs-no-margin">';
            html += '<div class="col-xs-12 col-sm-12 fs-cursor-pointer text-center" onclick="openFilterZoom(\'' + id + "')\">";
            html += '<span class="text-right fluigicon fluigicon-pointer-down">';
            html += '</span><small style="padding-left:5px"><strong> ' + labelFilterColumns + "</strong></small></div>";
            html += "</div></div>";
            return html
        }
    }
    return getTemplateColumns(data)
}
function openFilterZoom(elementId) {
    $zoomElement = $("#" + elementId);
    elementName = $zoomElement.attr("name");
    var dataZoomInstance = "data-zoom_" + elementName;
    var zoomOptions = window[dataZoomInstance];
    var labelFilterColumns = translation[userLang].filterColumns;
    if (zoomOptions.resultsZoom) {
        $resultsZoom = zoomOptions.resultsZoom
    } else {
        $resultsZoom = $("#select2-" + elementId + "-results");
        zoomOptions.resultsZoom = $resultsZoom
    }
    if (zoomOptions.zoomFilter) {
        $zoomFilter = zoomOptions.zoomFilter;
        $zoomFilter.show()
    } else {
        $zoomFilter = $resultsZoom.clone(false).insertBefore($resultsZoom);
        $zoomFilter.css("overflow-x", "hidden");
        zoomOptions.zoomFilter = $zoomFilter
    }
    var fieldsZoom = zoomOptions.fields;
    var htmlFilter = '<div id="zoomFilter_' + elementId + '" class="fluig-style-guide" style="padding:6px"><div class="row fs-no-margin">';
    htmlFilter += '<div class="col-xs-12 col-sm-12 fs-cursor-pointer text-center" onclick="closeFilterZoom(\'' + dataZoomInstance + "')\">";
    htmlFilter += '<span class="text-right fluigicon fluigicon-pointer-up" style="padding-bottom: 10px">';
    htmlFilter += '</span><small style="padding-left:5px"><strong> ' + labelFilterColumns + "</strong></small></div></div>";
    htmlFilter += '<div class="class="table-responsive"><table class="table">';
    for (var i in zoomOptions.fields) {
        var column = zoomOptions.fields[i];
        var columnLabel = column.label ? column.label : column.field;
        var checked = (!column.visible || column.visible == "true") ? "checked" : "";
        var columnHeader = "";
        if (column.field == zoomOptions.displayKey) {
            columnHeader = '<span class="fluigicon fluigicon-star fluigicon-xs"></span>'
        }
        htmlFilter += "<tr>";
        if (column.field == zoomOptions.displayKey) {
            htmlFilter += '<td width="85%" class="text-success"><strong>' + columnLabel + "</strong></td>"
        } else {
            htmlFilter += '<td width="85%">' + columnLabel + columnHeader + "</td>"
        }
        htmlFilter += '<td><input id="zoomFilterField_' + column.field + '" type="checkbox" data-on-color="success" ' + checked + "></td>";
        htmlFilter += "</tr>"
    }
    htmlFilter += "</table></div>";
    if (FLUIGC.utilities.checkDevice().isMobile) {
        htmlFilter += '<div class="row fs-no-margin"><div class="col-xs-12 fs-cursor-pointer">'
    } else {
        htmlFilter += '<div class="row fs-no-margin"><div style="width:100px; float:right; margin-right:8px; cursor:pointer;">'
    }
    var labelApply = translation[userLang].apply;
    htmlFilter += '<button type="button" class="fs-full-width btn btn-primary" onclick="applyFilter(\'' + elementId + "','" + elementName + "')\">" + labelApply + "</button>";
    htmlFilter += "</div></div></div>";
    $resultsZoom.hide();
    $zoomFilter.html(htmlFilter);
    FLUIGC.switcher.initAll("#zoomFilter_" + elementId)
}
function closeFilterZoom(dataZoomInstance) {
    var zoomOptions = window[dataZoomInstance];
    $resultsZoom = zoomOptions.resultsZoom;
    $zoomFilter = zoomOptions.zoomFilter;
    $zoomFilter.hide();
    $resultsZoom.show()
}
function applyFilter(inputIdZoom, inputNameZoom) {
    var dataZoomInstance = "data-zoom_" + inputNameZoom;
    var zoomOptions = window[dataZoomInstance];
    var zoomFilterId = "zoomFilter_" + inputIdZoom;
    var fieldOptions = {};
    $("#" + zoomFilterId + " input").each(function() {
        fieldOptions[$(this).attr("id")] = $(this).prop("checked")
    });
    for (var i in zoomOptions.fields) {
        var field = zoomOptions.fields[i];
        zoomOptions.fields[i].visible = fieldOptions["zoomFilterField_" + field.field].toString()
    }
    closeFilterZoom(dataZoomInstance);
    delete zoomOptions.resultsZoom;
    delete zoomOptions.zoomFilter;
    var settings = createSettings(zoomOptions);
    window[dataZoomInstance] = zoomOptions;
    window[inputNameZoom].destroy();
    window[inputNameZoom] = FLUIGC.select("#" + inputIdZoom, settings)
}
function getTemplateColumns(data) {
    var totalRecords = 1;
    var html = '<div class="fluig-style-guide">';
    if (data.dataSize) {
        var column = 1;
        var columnSize = returnColumnSize(data.dataSize);
        var columnsVisible = data.columnsVisible;
        delete data.columnsVisible;
        $.each(data, function(index, value) {
            if (isValidField(index, columnsVisible)) {
                if (column == 1) {
                    html += '<div class="row fs-no-margin">'
                }
                html += getColumnTemplate(index, value, columnSize);
                if (column == maxZoomColumns || totalRecords == data.dataSize) {
                    column = 0;
                    html += "</div>"
                }
                column++;
                totalRecords++
            }
        })
    }
    html += "</div>";
    return html
}
function getSelectedItemTemplate(data) {
    return data.id
}
function loadRicheditorForInput(el) {
    var $richeditor = $(el);
    if ($richeditor.parents("[tablename]").length > 0 && $richeditor.closest("tr").index() < 1) {
        return
    }
    var richeditorOptions = JSON.parse($richeditor.data("richeditor").split("'").join('"'));
    var richeditorName = $richeditor.attr("name");
    if (window[richeditorName] && window[richeditorName].editor) {
        return
    }
    $richeditor.removeAttr("data-richeditor");
    var dataRicheditorInstance = "data-richeditor_" + $richeditor.attr("name");
    richeditorOptions.inputId = $richeditor.attr("id");
    richeditorOptions.inputName = $richeditor.attr("name");
    window[dataRicheditorInstance] = richeditorOptions;
    var settings = createSettingsRicheditor(richeditorOptions);
    window[richeditorName] = FLUIGC.richeditor(el, settings);
    window[richeditorName].editor.on("change", function() {
        var elTarget = document.getElementsByName(this.name)[0];
        var elHiddenTarget = document.getElementsByName("hidden_" + this.name)[0];
        var textContent = window[this.name].editor.document.getBody().getText();
        if (textContent && textContent.trim()) {
            elHiddenTarget.value = cleanString(textContent);
            elTarget.value = window[this.name].getData()
        } else {
            elHiddenTarget.value = "";
            elTarget.value = ""
        }
    });
    var inputValue = $richeditor.val();
    if (inputValue) {
        window[richeditorName].setData(inputValue)
    }
}
function cleanString(input) {
    var output = "";
    for (var i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) <= 127) {
            output += input.charAt(i)
        } else {
            output += " "
        }
    }
    return output
}
function loadZoomForInput(input) {
    if ($(input).parents("[tablename]").length > 0 && $(input).closest("tr").index() < 1) {
        return
    }
    var $zoom = $(input)
      , zoomOptions = JSON.parse($zoom.data("zoom").split("'").join('"'));
    $zoom.removeAttr("data-zoom");
    var dataZoomInstance = "data-zoom_" + $zoom.attr("name");
    var elTarget = "#" + $zoom.attr("name");
    var inputHiddenValue = $(input).attr("zoomvalue");
    var hasInputHidden = typeof (inputHiddenValue) != "undefined";
    if (hasInputHidden) {
        var codeColumn = {
            field: inputHiddenValue,
            label: inputHiddenValue,
            visible: "false"
        };
        zoomOptions.fields.push(codeColumn)
    }
    zoomOptions.inputId = $zoom.attr("id");
    zoomOptions.inputName = $zoom.attr("name");
    window[dataZoomInstance] = zoomOptions;
    var zoomName = $zoom.attr("name");
    var settings = createSettings(zoomOptions);
    var referenceName = "input[name=" + zoomName + "]";
    $(referenceName).replaceWith(function() {
        var selectAttributes = {
            name: zoomName,
            id: zoomName,
            type: $zoom.attr("type"),
            "class": "form-control",
            "filter-instance": zoomName,
            multiple: "multiple"
        };
        return $("<select />", selectAttributes)
    });
    window[zoomName] = FLUIGC.select(elTarget, settings);
    $(elTarget).on("select2:select", function(event) {
        var params = event.params.data;
        var zoomSetting = window["data-zoom_" + event.target.name];
        if (zoomSetting) {
            var maximumSelectionLength = zoomSetting.maximumSelectionLength ? Number.parseInt(zoomSetting.maximumSelectionLength) : 1;
            if (event.target.length > maximumSelectionLength) {
                var options = $(event.target).find("option").get();
                if (options && options.length) {
                    options.forEach(function(option) {
                        var id = event.params.data.id || event.params.data.text;
                        if (id && id === option.value) {
                            $(option).remove()
                        }
                    })
                }
                $(event.params.originalEvent.currentTarget).attr("aria-selected", false);
                var warningMessage = translation[userLang].maximumSelectionLength.replace("{0}", maximumSelectionLength);
                FLUIGC.toast({
                    title: warningMessage,
                    message: "",
                    type: "warning"
                })
            }
        }
        if (hasInputHidden) {
            $("#hidden_" + zoomName).val(params[inputHiddenValue])
        }
        if (typeof (setSelectedZoomItem) === "function") {
            setSelectedZoomItem(params)
        }
    });
    $(elTarget).on("select2:unselect", function(event) {
        var params = event.params.data;
        if (hasInputHidden) {
            $("#hidden_" + zoomName).val("")
        }
        if (event.params.data.element) {
            $(event.params.data.element).remove()
        } else {
            var options = $(event.target).find("option").get();
            if (options && options.length) {
                options.forEach(function(option) {
                    var id = event.params.data.id || event.params.data.text;
                    if (id && id === option.value) {
                        $(option).remove()
                    }
                })
            }
        }
        if (typeof (removedZoomItem) === "function") {
            if (!params.inputId) {
                params.inputId = zoomName
            }
            if (!params.inputName) {
                params.inputName = zoomName
            }
            removedZoomItem(params)
        }
    });
    var inputValue = $(input).val();
    if (inputValue != "") {
        values = inputValue.split(String.fromCharCode(24));
        window[zoomName].setValues(values)
    }
}
function reloadZoomFilterValues(inputName, filterValues) {
    executeAfterLoadStyleGuide(function() {
        reloadZoomFilterValuesImpl(inputName, filterValues)
    })
}
function reloadZoomFilterValuesImpl(inputName, filterValues) {
    var dataZoomInstance = "data-zoom_" + inputName;
    var zoomOptions = window[dataZoomInstance];
    zoomOptions.filterValues = filterValues;
    var searchField = "";
    var settings = createSettings(zoomOptions);
    window[inputName].destroy();
    window[inputName] = FLUIGC.select("#" + inputName, settings)
}
function createSettingsRicheditor(richeditorOptions) {
    var config = {};
    config.toolbar = [{
        name: "clipboard",
        items: ["Undo", "Redo"]
    }, {
        name: "basicstyles",
        items: ["Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript", "RemoveFormat"]
    }, {
        name: "colors",
        items: ["TextColor", "BGColor"]
    }, {
        name: "paragraph",
        items: ["NumberedList", "BulletedList", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"]
    }, {
        name: "styles",
        items: ["Styles", "Format", "Font", "FontSize"]
    }];
    config.resize_enabled = false;
    config.height = richeditorOptions.height || 100;
    config.width = richeditorOptions.width || "auto";
    config.language = "pt-br";
    config.removePlugins = "elementspath,sourcearea";
    config.disableNativeSpellChecker = false;
    return config
}
function createSettings(zoomOptions) {
    var resultFields, header;
    if (zoomOptions.displayKey) {
        searchField = zoomOptions.displayKey
    } else {
        searchField = zoomOptions.fields[0].field
    }
    var orderField = "";
    if (zoomOptions.fields) {
        resultFields = [];
        header = [];
        for (var i in zoomOptions.fields) {
            var column = zoomOptions.fields[i];
            resultFields.push(column.field);
            var columnHeader = {
                title: column.label
            };
            if (column.standard) {
                columnHeader.standard = Boolean(column.standard);
                orderField = column.field + "_ASC"
            }
            header.push(columnHeader)
        }
    }
    var fieldsName = {};
    var fieldsId = {};
    var columnsVisible = {};
    var columnsCode = {};
    $.each(zoomOptions.fields, function(index, field) {
        var indexcolumnsVisible = field.label ? field.label : field.field;
        if (!columnsVisible[indexcolumnsVisible]) {
            if (field.label) {
                fieldsName[field.field] = field.label;
                columnsVisible[field.field] = "false";
                columnsCode[field.label] = field.field
            }
            columnsVisible[indexcolumnsVisible] = field.visible ? field.visible : "true"
        }
    });
    var filterFields = [];
    if (zoomOptions.filterValues) {
        var filterValues = zoomOptions.filterValues.split(",");
        if (filterValues && filterValues.length >= 2) {
            for (var j = 0; j < filterValues.length; j = j + 2) {
                filterFields.push(filterValues[j]);
                filterFields.push(filterValues[j + 1])
            }
        }
    }
    var json = {
        searchField: searchField,
        filterFields: filterFields,
        resultFields: resultFields
    };
    var containsDisplayKey = false;
    for (i = 0; i <= resultFields.length; i++) {
        if (resultFields[i] === zoomOptions.displayKey) {
            containsDisplayKey = true
        }
    }
    if (!containsDisplayKey) {
        resultFields.push(zoomOptions.displayKey)
    }
    var link = location.origin + "/ecm/api/rest/ecm/dataset/datasetZoom/";
    if (zoomOptions.cardDatasetId) {
        json.cardDatasetId = zoomOptions.cardDatasetId
    } else {
        json.datasetId = zoomOptions.datasetId
    }
    var strJson = encodeURIComponent(JSON.stringify(json));
    link += strJson;
    var settings = {
        placeholder: zoomOptions.placeholder ? zoomOptions.placeholder : "",
        closeOnSelect: zoomOptions.closeOnSelect,
        allowClear: false,
        tags: false,
        ajax: {
            url: link,
            dataType: "json",
            delay: 250,
            data: function(params) {
                var page = params.page || 1;
                var resultLimit = zoomOptions.resultLimit ? zoomOptions.resultLimit : 300;
                var offset = (page - 1) * resultLimit;
                searchField = zoomOptions.displayKey ? zoomOptions.displayKey : searchField;
                orderField = orderField ? orderField : searchField + "_ASC";
                return {
                    limit: offset + resultLimit,
                    offset: offset,
                    orderby: orderField,
                    pattern: params.term,
                    page: params.page
                }
            },
            processResults: function(data, params) {
                params.page = params.page || 1;
                return {
                    results: $.map(data.content, function(obj) {
                        var objectReturn = {};
                        var objectSize = 0;
                        $.each(obj, function(i, el) {
                            if ($.inArray(i, resultFields) === -1) {
                                resultFields.push(i)
                            }
                        });
                        for (ind = 0; ind < resultFields.length; ind++) {
                            var index = resultFields[ind];
                            var value = obj[index];
                            var indexField = fieldsName[index] ? fieldsName[index] : index;
                            objectReturn[indexField] = value;
                            if (columnsVisible[indexField] == "true") {
                                objectSize++
                            }
                            if (columnsCode[indexField]) {
                                objectReturn[columnsCode[indexField]] = value
                            }
                        }
                        if (objectSize == 0) {
                            return null
                        }
                        objectReturn.id = obj[searchField];
                        objectReturn.text = obj[searchField];
                        objectReturn.inputId = zoomOptions.inputId;
                        objectReturn.inputName = zoomOptions.inputName;
                        objectReturn.dataSize = objectSize;
                        objectReturn.columnsVisible = columnsVisible;
                        return objectReturn
                    })
                }
            },
            cache: false,
        },
        escapeMarkup: function(markup) {
            return markup
        },
        minimumInputLength: 0,
        maximumSelectionLength: zoomOptions.maximumSelectionLength ? zoomOptions.maximumSelectionLength : 1,
        templateResult: getSelectItemTemplate,
        templateSelection: getSelectedItemTemplate
    };
    return settings
}
var _this = this;
var ECM = ECM || {};
document.addEventListener("DOMContentLoaded", function(e) {
    if (ECM.fluigForms) {
        return
    }
    ECM.fluigForms = {};
    _this.MaskEvent.init(e);
    hasZoom();
    hasRicheditor()
}, false);
importFormJs = function(e) {
    maskInputs = [];
    var inputs = document.getElementsByTagName("input");
    var count = 0;
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].hasAttribute("mask")) {
            maskInputs[count++] = inputs[i]
        }
    }
    if (maskInputs.length) {
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = "/portal/resources/js/jquery.mask.min.js";
        js.onload = loadMask;
        document.body.appendChild(js)
    }
}
;
loadMask = function(e) {
    for (var i = 0; i < maskInputs.length; i++) {
        if (maskInputs[i].id != undefined && maskInputs[i].id != "") {
            $("#" + maskInputs[i].id).mask(maskInputs[i].getAttribute("mask"))
        } else {
            if (maskInputs[i].name != undefined) {
                var mask = maskInputs[i].getAttribute("mask");
                var options = {};
                if (mask.indexOf("#") > -1) {
                    options.maxlength = false;
                    options.reverse = true
                }
                $("input[type='text'][name='" + maskInputs[i].name + "']").mask(mask, options)
            }
        }
    }
}
;
hideFields = function(fields) {
    if (Array.isArray(fields)) {
        for (var i = 0; i < fields.length; i++) {
            hideFields(fields[i])
        }
    } else {
        $("#" + fields).css("display", "none")
    }
}
;
showFields = function(fields) {
    if (Array.isArray(fields)) {
        for (var i = 0; i < fields.length; i++) {
            showFields(fields[i])
        }
    } else {
        $("#" + fields).css("display", "block")
    }
}
;
if (window.parent.WCMAPI && !window.parent.WCMAPI._isMobile()) {
    function openInputFile(elementId, parameter) {
        setTimeout(function() {
            var element = parent.document.getElementById(elementId);
            if (element && document.createEvent) {
                element.setAttribute("data-on-camera", "true");
                if (parameter) {
                    element.setAttribute("data-file-name-camera", parameter)
                }
                element.click()
            }
        }, 500)
    }
    JSInterface = {};
    JSInterface.showCamera = function(parameter) {
        var tabAttachments = parent.document.getElementById("tab-attachments");
        if (!tabAttachments) {
            return
        }
        if (tabAttachments.dataset.newForm === "true") {
            tabAttachments.children[0].click()
        } else {
            var $tabList = $(tabAttachments).parent();
            if ($tabList.hasClass("active") && !$tabList.hasClass("out")) {
                var cardViewer = parent.document.getElementById("workflowView-cardViewer");
                $(cardViewer).contents().find("body").animate({
                    scrollTop: 0
                }, "fast")
            } else {
                tabAttachments.click()
            }
        }
        if (window.parent.WCMAPI.isIe9()) {
            $(".ecm-navigation-silverlight", parent.document).show("fade").css("top", 0);
            $("#ecm-navigation-silverlight", parent.document).attr({
                "data-on-camera": "true",
                "data-file-name-camera": parameter
            });
            $(parent.document).on("keyup", this.actionKeyup)
        } else {
            openInputFile("ecm-navigation-inputFile-clone", parameter)
        }
    }
}
;