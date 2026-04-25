"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverInputDtoValidation = void 0;
const driverInputDtoValidation = (data) => {
    const errors = [];
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 15) {
        errors.push({ field: 'name', message: 'Invalid name' });
    }
    if (!data.phoneNumber || typeof data.phoneNumber !== 'string' || data.phoneNumber.trim().length < 8 || data.phoneNumber.trim().length > 15) {
        errors.push({ field: 'phoneNumber', message: 'Invalid phoneNumber' });
    }
    // Аналогично добавляем проверки для других полей...
    return errors;
};
exports.driverInputDtoValidation = driverInputDtoValidation;
