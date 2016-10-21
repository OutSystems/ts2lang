"use strict";
var TsAnyType = (function () {
    function TsAnyType() {
    }
    Object.defineProperty(TsAnyType.prototype, "isBasic", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsAnyType.prototype, "name", {
        get: function () {
            return "any";
        },
        enumerable: true,
        configurable: true
    });
    return TsAnyType;
}());
exports.TsAnyType = TsAnyType;
var TsArrayType = (function () {
    function TsArrayType(inner) {
        this.inner = inner;
    }
    Object.defineProperty(TsArrayType.prototype, "isBasic", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsArrayType.prototype, "name", {
        get: function () {
            return this.inner.name + "[]";
        },
        enumerable: true,
        configurable: true
    });
    TsArrayType.prototype.getInner = function () {
        return this.inner;
    };
    return TsArrayType;
}());
exports.TsArrayType = TsArrayType;
var TsBasicType = (function () {
    function TsBasicType(name) {
        this.innerName = name;
    }
    Object.defineProperty(TsBasicType.prototype, "isBasic", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsBasicType.prototype, "name", {
        get: function () {
            return this.innerName;
        },
        enumerable: true,
        configurable: true
    });
    return TsBasicType;
}());
exports.TsBasicType = TsBasicType;
exports.TsBooleanType = new TsBasicType("boolean");
exports.TsNumberType = new TsBasicType("number");
exports.TsStringType = new TsBasicType("string");
exports.TsVoidType = new TsBasicType("void");
var TsFunctionType = (function () {
    function TsFunctionType(args, ret) {
        this.args = args;
        this.retType = ret;
    }
    Object.defineProperty(TsFunctionType.prototype, "isBasic", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsFunctionType.prototype, "name", {
        get: function () {
            return "Function";
        },
        enumerable: true,
        configurable: true
    });
    return TsFunctionType;
}());
exports.TsFunctionType = TsFunctionType;
var TsIdentifierType = (function () {
    function TsIdentifierType(name, typeParameters) {
        this._name = name;
        this.typeParameters = typeParameters;
        this.originalName = name;
        if (this.originalName.indexOf(".") > -1) {
            var splitted = this.originalName.split(".");
            this._name = splitted[splitted.length - 1];
        }
    }
    Object.defineProperty(TsIdentifierType.prototype, "isBasic", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsIdentifierType.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    return TsIdentifierType;
}());
exports.TsIdentifierType = TsIdentifierType;
var TsUnionType = (function () {
    function TsUnionType(innerTypes) {
        this.innerTypes = innerTypes;
    }
    Object.defineProperty(TsUnionType.prototype, "isBasic", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsUnionType.prototype, "name", {
        get: function () {
            return this.innerTypes.map(function (innerType) { return innerType.name; }).join(" | ");
        },
        enumerable: true,
        configurable: true
    });
    return TsUnionType;
}());
exports.TsUnionType = TsUnionType;
//# sourceMappingURL=ts-types.js.map