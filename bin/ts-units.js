"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractTsUnit = (function () {
    function AbstractTsUnit(name) {
        this.annotations = [];
        this.name = name;
    }
    AbstractTsUnit.prototype.addAnnotation = function (annot) {
        var args = "";
        annot.args.forEach(function (arg) {
            if (args) {
                args += ", ";
            }
            args += "(name = " + arg.name + ", value = " + arg.value + ")";
        });
        this.annotations.push(annot);
    };
    return AbstractTsUnit;
}());
exports.AbstractTsUnit = AbstractTsUnit;
var TopLevelTsUnit = (function (_super) {
    __extends(TopLevelTsUnit, _super);
    function TopLevelTsUnit(name) {
        var _this = _super.call(this, name) || this;
        _this.functions = [];
        _this.interfaces = [];
        _this.classes = [];
        _this.modules = [];
        _this.enums = [];
        return _this;
    }
    TopLevelTsUnit.prototype.addFunction = function (unit) {
        this.functions.push(unit);
    };
    TopLevelTsUnit.prototype.addInterface = function (unit) {
        this.interfaces.push(unit);
    };
    TopLevelTsUnit.prototype.addClass = function (unit) {
        this.classes.push(unit);
    };
    TopLevelTsUnit.prototype.addModule = function (unit) {
        this.modules.push(unit);
    };
    TopLevelTsUnit.prototype.addEnum = function (unit) {
        this.enums.push(unit);
    };
    return TopLevelTsUnit;
}(AbstractTsUnit));
exports.TopLevelTsUnit = TopLevelTsUnit;
var TsParameter = (function () {
    function TsParameter(name, type) {
        this.name = name;
        this.type = type;
    }
    return TsParameter;
}());
exports.TsParameter = TsParameter;
var TsFunction = (function (_super) {
    __extends(TsFunction, _super);
    function TsFunction(name, parameters, returnType) {
        var _this = _super.call(this, name) || this;
        _this.parameters = parameters;
        _this.returnType = returnType;
        return _this;
    }
    return TsFunction;
}(AbstractTsUnit));
exports.TsFunction = TsFunction;
var TsEnum = (function (_super) {
    __extends(TsEnum, _super);
    function TsEnum(name, options) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        _this.options = options;
        return _this;
    }
    return TsEnum;
}(AbstractTsUnit));
exports.TsEnum = TsEnum;
var TsEnumOption = (function () {
    function TsEnumOption(name, id) {
        this.name = name;
        this.id = id;
    }
    return TsEnumOption;
}());
exports.TsEnumOption = TsEnumOption;
var TsInterface = (function (_super) {
    __extends(TsInterface, _super);
    function TsInterface() {
        return _super.apply(this, arguments) || this;
    }
    return TsInterface;
}(TopLevelTsUnit));
exports.TsInterface = TsInterface;
var TsModule = (function (_super) {
    __extends(TsModule, _super);
    function TsModule() {
        return _super.apply(this, arguments) || this;
    }
    return TsModule;
}(TopLevelTsUnit));
exports.TsModule = TsModule;
var TsClass = (function (_super) {
    __extends(TsClass, _super);
    function TsClass() {
        return _super.apply(this, arguments) || this;
    }
    return TsClass;
}(TopLevelTsUnit));
exports.TsClass = TsClass;
//# sourceMappingURL=ts-units.js.map